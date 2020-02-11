import React, { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react";
import {
  Card,
  Row,
  Col,
  Button,
  List,
  Radio,
  Spin,
  Icon,
  Menu,
  Dropdown,
  Modal,
  message,
  Select,
  Divider
} from "antd";
import { useGApp } from "../../utils";
import { cancelSource } from "../../app.service";
import "./index.css";

const QUE_BLOCK = "que-block";
const QUE_LIST = "que-list";

const LOADING_RES = "loading-responses";
const SAVING_RES = "saving-response(s)";

const spinIcon = <Icon type="loading" spin />;

const ActionMenu = ({ onAssign }) => (
  <Menu style={{ border: "1px solid #d9d9d9" }}>
    <Menu.Item onClick={onAssign}>Assign</Menu.Item>
  </Menu>
);

const ActionDropDown = props => (
  <Dropdown overlay={<ActionMenu {...props} />}>
    <Button
      icon="more"
      size="small"
      style={{ border: "unset" }}
      onClick={ev => {
        ev.stopPropagation();
      }}
    />
  </Dropdown>
);

const AssignModal = ({ onSelectUsers, users, ...props }) => (
  <Modal {...props}>
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Select Users"
      onChange={onSelectUsers}
      filterOption={(input, option) => {
        let { username, email, id } = option.props["data-item"];
        if (
          username.includes(input) ||
          email.includes(input) ||
          id.includes(input)
        ) {
          return true;
        }
        return false;
      }}
      allowClear
    >
      {users.map(user => (
        <Select.Option key={user.id} value={user.id} data-item={user}>
          {user.email}
        </Select.Option>
      ))}
    </Select>
  </Modal>
);

const QueBlockList = ({ history }) => {
  let globalState = useGApp();
  let [mode, setMode] = useState(QUE_BLOCK);
  let [ques, setQues] = useState([]);
  let [responses, setResponses] = useState(() => new Map());
  let [resLoad, setResLoad] = useState("");
  let [assignQues, setAssignQues] = useState(null);
  let [users, setUsers] = useState([]);
  let [selectedUsers, setSelectedUsers] = useState([]);
  let [assignLoad, setAssignLoad] = useState(false);

  const getResAndUsers = useCallback(
    ({ users }) => {
      setResLoad(LOADING_RES);
      globalState
        .getAns()
        .then(res => {
          let r = new Map();
          res.forEach(_r => {
            r.set(_r.question, _r);
          });
          setResponses(r);
          if (
            users &&
            globalState._userDet &&
            globalState._userDet.role === "CSO"
          ) {
            return globalState.getUsers();
          }
          return null;
        })
        .then(res => {
          res && setUsers(res);
        })
        .catch(err => {
          alert(`Error - ${err.message}`);
        })
        .finally(() => {
          setResLoad("");
        });
    },
    // eslint-disable-next-line
    [ques]
  );

  useEffect(() => {
    if (
      globalState._userDet &&
      globalState._userDet.role === "CSO" &&
      globalState.isQuestionable
    ) {
      globalState.getQues().catch(err => {
        alert(`Error while requesting questions- ${err.message}`);
        throw err;
      });
    } else if (
      globalState._userDet &&
      globalState._userDet.role !== "Delegatee"
    ) {
      history.push("/home");
    }
    return () => {
      resLoad && cancelSource.cancel();
    };
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (mode === QUE_LIST && ques.length) {
      getResAndUsers({ users: false });
    } else if (mode === QUE_BLOCK) {
      getResAndUsers({ users: true });
    }
  }, [mode, ques, getResAndUsers]);

  //fix mem-leak;

  const role =
    globalState._userDet && globalState._userDet.role
      ? globalState._userDet.role
      : "";

  let selRegs = [];
  let selFuncs = [];
  let que = [];
  let queGroups = [];

  if (role === "CSO") {
    selRegs = globalState._regulations.selected;
    selFuncs = globalState._regulations.selectedFuns;
    que = globalState._questions;
    queGroups = selFuncs
      .map(func => que.withFunction(func))
      .filter(arr => arr.length);
  } else if (role === "Delegatee") {
    selFuncs = [
      ...new Set(
        [...responses.values()].map(
          ({ questionDetails: { function: fn } }) => fn
        )
      )
    ];
    queGroups = selFuncs.map(func =>
      [...responses.values()].filter(
        ({ questionDetails: { function: fn } }) => fn === func
      )
    );
  } else {
    return null;
  }

  const modalOkDisabled =
    role === "Delegatee"
      ? true
      : assignQues && selectedUsers && assignQues.length && selectedUsers.length
      ? false
      : true;

  const isAnswered = idx => {
    return responses && responses.get(idx)
      ? !!responses.get(idx).answer
      : false;
  };

  const handleModalClose = () => {
    setAssignQues(null);
  };

  const assignUserIterator = function*(users, functionGroup) {
    for (let i = 0; i < users.length; i++) {
      yield globalState.assignBlock(functionGroup, users[i]);
    }
  };

  const assignUsers = async () => {
    try {
      if (!selectedUsers.length || !assignQues.length) {
        message.info("Nothing Selected.");
        return;
      }
      setAssignLoad(true);
      const functionGroup = assignQues[0].function;
      let nReq = 1;
      //eslint-disable-next-line
      for await (let _ of assignUserIterator(selectedUsers, functionGroup)) {
        message.success(`User Assigned - ${nReq}`);
        nReq += 1;
      }
    } catch (error) {
      message.error(`One Or More Assigning Failed - ${error.message}`);
    } finally {
      setAssignLoad(false);
    }
  };

  let isModalVis = false;

  let asideContent = null;
  let mainContent = null;

  if (mode === QUE_LIST) {
    const saveResponse = r => {
      setResLoad(SAVING_RES);
      return globalState
        .saveAns(r)
        .catch(err => {
          alert(`Saving answer failed - ${err.message}`);
        })
        .finally(() => {
          setResLoad("");
        });
    };

    const handleBack = () => {
      setMode(QUE_BLOCK);
      setQues([]);
      setResponses(new Map());
    };

    const handleResponse = ({ question }, resp) => {
      let _r = responses.get(question);
      if (_r) {
        _r.answer = resp;
        saveResponse(_r).then(() => {
          setResponses(responses.set(question, _r));
        });
      } else {
        console.error(`Question - ${question} is not found!`);
      }
    };

    const selectQuestion = idx => {
      const queEl = document.querySelector(`#que-${idx}`);
      queEl.scrollIntoView();
    };

    const renderQueList = (q, ind) => {
      const item = role === "CSO" ? q : q.questionDetails;
      const { id: idx, question } = item;
      return (
        <List.Item
          key={idx}
          onClick={() => !resLoad && selectQuestion(idx)}
          extra={
            <Icon
              type="file-done"
              title="Answered"
              theme={isAnswered(question) ? "filled" : "outlined"}
            />
          }
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          Question - {ind + 1}
        </List.Item>
      );
    };

    const renderAnsOptions = (option, { id: idx, question }) => (
      <Radio
        key={`${option}-${idx}`}
        name={idx}
        onChange={({ target }) => {
          target.checked && handleResponse({ id: idx, question }, option);
        }}
        value={option}
        checked={
          responses.get(question) &&
          responses.get(question).answer &&
          responses.get(question).answer === option
        }
        disabled={!!resLoad}
      >
        {option}
      </Radio>
    );

    const showQueInfo = ({ description, methods }) =>
      Modal.info({
        title: "About Question",
        content: (
          <>
            <p>{description}</p>
            <p>{methods}</p>
          </>
        )
      });

    const questionsRenderer = (q, index) => {
      const item = role === "CSO" ? q : q.questionDetails;
      return (
        <List.Item
          key={item.id}
          id={`que-${item.id}`}
          extra={
            <Button
              icon="info-circle"
              style={{ border: "unset" }}
              onClick={() => showQueInfo(item)}
            />
          }
        >
          <div>
            <div>
              <span>Q-{index + 1}.&nbsp;</span>
              {item.description}
            </div>
            <Radio.Group>
              {item.answerOptions.map(ans => renderAnsOptions(ans, item))}
            </Radio.Group>
          </div>
        </List.Item>
      );
    };

    asideContent = (
      <Card
        type="inner"
        title="Questions"
        extra={
          <Button onClick={handleBack} disabled={resLoad}>
            Go back
          </Button>
        }
        className="limit-80vh"
      >
        <List dataSource={ques} renderItem={renderQueList} bordered />
      </Card>
    );

    mainContent = (
      <Card title="Questions" className="limit-80vh">
        <List dataSource={ques} renderItem={questionsRenderer} />
      </Card>
    );
  } else if (mode === QUE_BLOCK) {
    isModalVis =
      role === "Delegatee"
        ? false
        : assignQues && assignQues.length
        ? true
        : false;

    const handleUpdate = () => {
      if (role === "Delegatee") return;
      let res = window.confirm(
        "This will change current selections. Continue?"
      );
      res && history.push("/home", { update: "1" });
      res && globalState._regulations.clearRegs();
    };

    const handleQBlockClick = ques => () => {
      setQues(ques);
      setMode(QUE_LIST);
    };

    const handleAssign = queArr => ev => {
      if (role === "Delegatee") return;
      ev.domEvent.stopPropagation();
      setAssignQues(queArr);
    };

    const renderRegulation = ({ regulation }, idx) => (
      <li key={idx}>
        <p style={{ fontWeight: "bold" }}>{regulation}</p>
      </li>
    );
    const renderFunction = (func, idx) => (
      <li key={idx}>
        <p style={{ fontWeight: "bold" }}>{func}</p>
      </li>
    );
    const renderQueGroup = (queArr, idx) => (
      <Card.Grid
        key={idx}
        onClick={handleQBlockClick(queArr)}
        style={{
          padding: "0"
        }}
      >
        <Card
          title={
            queArr[0].function || queArr[0].questionDetails.function || null
          }
          extra={
            role === "CSO" ? (
              <ActionDropDown onAssign={handleAssign(queArr)} />
            ) : null
          }
          headStyle={{ fontSize: "0.9rem", fontWeight: "bold" }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            padding: "15px"
          }}
        >
          <div>
            <span style={{ fontWeight: "bold" }}>Answered: </span>
            <br />
            <span>
              {resLoad === LOADING_RES ? (
                <Spin indicator={spinIcon} />
              ) : (
                queArr
                  .map(({ question }) => isAnswered(question))
                  .filter(Boolean).length
              )}
              &nbsp; out of {queArr.length}
            </span>
          </div>
          <br />
          <div>
            <span style={{ fontWeight: "bold" }}>Estimated time</span>
            <br />
            <span>--</span>
          </div>
        </Card>
      </Card.Grid>
    );

    asideContent =
      role === "CSO" ? (
        <Card className="aside-qblock">
          <div>
            <Button onClick={handleUpdate} type="danger">
              Update Selections
            </Button>
          </div>
          <br />
          <div>
            <div>Regulations</div>
            <Divider style={{ margin: "4px 0px" }} />
            <ul>{selRegs.map(renderRegulation)}</ul>
          </div>
          <br />
          <div>
            <div>Functions</div>
            <Divider style={{ margin: "4px 0px" }} />
            <ul>{selFuncs.map(renderFunction)}</ul>
          </div>
        </Card>
      ) : null;

    mainContent = (
      <Card title="Question grouped by functions">
        {queGroups.map(renderQueGroup)}
      </Card>
    );
  }

  return (
    <Card loading={globalState.isLoading}>
      <Row gutter={[16, 16]}>
        {asideContent && <Col span={4}>{asideContent}</Col>}
        <Col span={asideContent ? 20 : 24}>{mainContent}</Col>
      </Row>
      <AssignModal
        title="Assign Block To Users"
        onOk={assignUsers}
        okButtonProps={{ disabled: modalOkDisabled }}
        onCancel={handleModalClose}
        visible={isModalVis}
        onSelectUsers={setSelectedUsers}
        users={users}
        confirmLoading={assignLoad}
        closable
        destroyOnClose
      />
    </Card>
  );
};

export default observer(QueBlockList);
