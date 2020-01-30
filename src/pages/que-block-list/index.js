import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useGApp } from "../../utils";
import "./style.css";

const QUE_BLOCK = "que-block";
const QUE_LIST = "que-list";

const QueBlockList = ({ history }) => {
  let globalState = useGApp();
  let [mode, setMode] = useState(QUE_BLOCK);
  let [ques, setQues] = useState([]);
  let [responses, setResponses] = useState({});

  useEffect(() => {
    if (globalState.isQuestionable) {
      globalState
        .getQues()
        .catch(err => {
          alert(`Error while requesting questions- ${err.message}`);
          history.push("/home");
        })
        .finally(() => {
          globalState.setMainClass("flex-stretched");
        });
    } else {
      history.push("/home");
    }
    //eslint-disable-next-line
  }, []);

  if (globalState.isLoading) {
    globalState.setMainClass("");
    return <div>Loading...</div>;
  }

  const selRegs = globalState._regulations.selected;
  const selFuncs = globalState._regulations.selectedFuns;
  const que = globalState._questions;
  const queGroups = selFuncs
    .map(func => que.withFunction(func))
    .filter(arr => arr.length);

  let asideContent = null;
  let mainContent = null;

  if (mode === QUE_LIST) {
    const handleBack = () => {
      setMode(QUE_BLOCK);
      setQues([]);
      setResponses({});
      alert("Answers not saved!");
    };

    const handleResponse = (quesId, resp) => {
      let res = { ...responses };
      res[quesId] = resp;
      setResponses(res);
    };

    const handleSave = () => {
      /**
       * handle saving responses : mocking now
       */
      console.log(responses, "mock-save;responses for the questionnaire!");
      alert("Saved!");
      setMode(QUE_BLOCK);
      setQues([]);
      setResponses({});
    };

    const selectQuestion = idx => {
      const queEl = document.querySelector(`#que-${idx}`);
      queEl.scrollIntoView();
    };
    const isAnswered = idx => responses[idx];
    const areAllAnswered = () => Object.keys(responses).length === ques.length;

    const renderQueList = ({ id: idx }, ind) => (
      <div
        key={idx}
        onClick={() => selectQuestion(idx)}
        className={`que-list-item ${isAnswered(idx) ? "que-answered" : ""}`}
      >
        Question-{ind + 1}
      </div>
    );
    const renderAnsOptions = (option, idx) => (
      <label key={`${option}-${idx}`}>
        <input
          type="radio"
          name={idx}
          onChange={({ target }) => {
            target.checked && handleResponse(idx, option);
          }}
          value={option}
          checked={responses[idx] === option}
        />
        {option}
      </label>
    );

    const questionsRenderer = (item, index) => (
      <div
        className={`que flex-column flex-spaced-stretch ${
          isAnswered(item.id) ? "que-answered" : ""
        }`}
        key={item.id}
        id={`que-${item.id}`}
      >
        <div className="que-description">
          <span>Q-{index + 1}.&nbsp;</span>
          {item.description}
        </div>
        <div className="que-responses flex-row flex-centered">
          {item.answerOptions.map(ans => renderAnsOptions(ans, item.id))}
        </div>
      </div>
    );

    asideContent = (
      <>
        <div className="flex-column flex-centered-stretch">
          <button onClick={handleBack} style={{ marginBottom: "5px" }}>
            Go back
          </button>
          <button onClick={handleSave} disabled={!areAllAnswered()}>
            Save
          </button>
        </div>
        <div className="flex-column flex-centered-stretch">
          <span>Questions</span>
          <div className="que-list flex-column">{ques.map(renderQueList)}</div>
        </div>
      </>
    );

    mainContent = ques.map(questionsRenderer);
  } else if (mode === QUE_BLOCK) {
    const handleUpdate = () => {
      let res = window.confirm(
        "This will change current selections. Continue?"
      );
      res && history.push("/home");
      res && globalState.setMainClass("");
      res && globalState._regulations.clearRegs();
    };

    const handleQBlockClick = ques => {
      setQues(ques);
      setMode(QUE_LIST);
    };

    const renderRegulation = ({ regulation }, idx) => (
      <div key={idx}>{regulation}</div>
    );
    const renderFunction = (func, idx) => <div key={idx}>{func}</div>;
    const renderQueGroup = (queArr, idx) => (
      <div
        key={idx}
        className="que-block flex-column flex-centered"
        onClick={() => handleQBlockClick(queArr)}
      >
        <div>{queArr[0].function}</div>
        <div>Total Questions: {queArr.length}</div>
        <div>Estimated time: --</div>
        <div>About: --</div>
      </div>
    );

    asideContent = (
      <>
        <div className="flex-column flex-centered-stretch">
          <button onClick={handleUpdate}>Update Selections</button>
        </div>
        <div className="flex-column flex-centered-stretch">
          <span>Regulations</span>
          {selRegs.map(renderRegulation)}
        </div>
        <div className="flex-column flex-centered-stretch">
          <span>Functions</span>
          {selFuncs.map(renderFunction)}
        </div>
      </>
    );

    mainContent = queGroups.map(renderQueGroup);
  }

  return (
    <section className="que-block-pane flex-row flex-stretched">
      <aside className="selections flex-column">{asideContent}</aside>
      <div
        className={`que-blocks ${
          mode === QUE_BLOCK ? "flex-row" : "flex-col que-list-container"
        } flex-centered`}
      >
        {mainContent}
      </div>
    </section>
  );
};

export default observer(QueBlockList);
