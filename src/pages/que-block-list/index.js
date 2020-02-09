import React, { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react";
import { Card, Row, Col, Button, Tag, List, Radio, Spin, Icon } from "antd";
import { useGApp } from "../../utils";
import "./index.css";

const QUE_BLOCK = "que-block";
const QUE_LIST = "que-list";

const LOADING_RES = "loading-responses";
const SAVING_RES = "saving-response(s)";

const spinIcon = <Icon type="loading" spin />;

const QueBlockList = ({ history }) => {
  let globalState = useGApp();
  let [mode, setMode] = useState(QUE_BLOCK);
  let [ques, setQues] = useState([]);
  let [responses, setResponses] = useState(() => new Map());
  let [resLoad, setResLoad] = useState("");

  const getResponses = useCallback(() => {
    setResLoad(LOADING_RES);
    globalState
      .getAns()
      .then(res => {
        let r = new Map();
        res.forEach(_r => {
          r.set(_r.question, _r);
        });
        setResponses(r);
      })
      .catch(err => {
        alert(`Error getting response - ${err.message}`);
      })
      .finally(() => {
        setResLoad("");
      });
    // eslint-disable-next-line
  }, [ques]);

  useEffect(() => {
    if (globalState.isQuestionable) {
      globalState.getQues().catch(err => {
        alert(`Error while requesting questions- ${err.message}`);
      });
    } else {
      history.push("/home");
    }
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if ((mode === QUE_LIST && ques.length) || mode === QUE_BLOCK) {
      getResponses();
    }
  }, [mode, ques, getResponses]);

  const selRegs = globalState._regulations.selected;
  const selFuncs = globalState._regulations.selectedFuns;
  const que = globalState._questions;
  const queGroups = selFuncs
    .map(func => que.withFunction(func))
    .filter(arr => arr.length);

  const isAnswered = idx => {
    return responses && responses.get(idx)
      ? !!responses.get(idx).answer
      : false;
  };

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
        console.error(`Quetion - ${question} is not found!`);
      }
    };

    const selectQuestion = idx => {
      const queEl = document.querySelector(`#que-${idx}`);
      queEl.scrollIntoView();
    };

    const renderQueList = ({ id: idx, question }, ind) => (
      <List.Item
        key={idx}
        onClick={() => !resLoad && selectQuestion(idx)}
        style={{ backgroundColor: isAnswered(question) ? "" : "#f3f3f3" }}
      >
        Question - {ind + 1}
      </List.Item>
    );

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

    const questionsRenderer = (item, index) => (
      <List.Item
        style={{
          backgroundColor: isAnswered(item.question) ? "" : "#f3f3f3"
        }}
        key={item.id}
        id={`que-${item.id}`}
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
        <List
          size="small"
          dataSource={ques}
          renderItem={renderQueList}
          bordered
        />
      </Card>
    );

    mainContent = (
      <Card title="Questions" className="limit-80vh">
        <List dataSource={ques} renderItem={questionsRenderer} />
      </Card>
    );
  } else if (mode === QUE_BLOCK) {
    const handleUpdate = () => {
      let res = window.confirm(
        "This will change current selections. Continue?"
      );
      res && history.push("/home", { update: "1" });
      res && globalState.setMainClass("");
      res && globalState._regulations.clearRegs();
    };

    const handleQBlockClick = ques => {
      setQues(ques);
      setMode(QUE_LIST);
    };

    const renderRegulation = ({ regulation }, idx) => (
      <Tag key={idx}>{regulation}</Tag>
    );
    const renderFunction = (func, idx) => <Tag key={idx}>{func}</Tag>;
    const renderQueGroup = (queArr, idx) => (
      <Card.Grid key={idx} onClick={() => handleQBlockClick(queArr)}>
        <Tag>{queArr[0].function}</Tag>
        <div>Total Questions: {queArr.length}</div>
        <div>
          Answered:{" "}
          {resLoad === LOADING_RES ? (
            <Spin indicator={spinIcon} />
          ) : (
            queArr.map(({ question }) => isAnswered(question)).filter(Boolean)
              .length
          )}
        </div>
        <div>Estimated time: --</div>
        <div>About: --</div>
      </Card.Grid>
    );

    asideContent = (
      <Card>
        <div>
          <Button onClick={handleUpdate} type="danger">
            Update Selections
          </Button>
        </div>
        <div>
          <div>Regulations - </div>
          {selRegs.map(renderRegulation)}
        </div>
        <div>
          <div>Functions - </div>
          {selFuncs.map(renderFunction)}
        </div>
      </Card>
    );

    mainContent = (
      <Card title="Question grouped by functions">
        {queGroups.map(renderQueGroup)}
      </Card>
    );
  }

  return (
    <Card loading={globalState.isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={4}>{asideContent}</Col>
        <Col span={20}>{mainContent}</Col>
      </Row>
    </Card>
  );
};

export default observer(QueBlockList);
