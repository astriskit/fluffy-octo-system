import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { Tag } from "../../components";
import { useGApp } from "../../utils";
import "./style.css";

const MODE_REG = "select-regulations";
const MODE_FUNC = "select-functions";

const SelRegAndFunc = ({ history }) => {
  let [query, setQuery] = useState("");
  let [mode, setMode] = useState(MODE_REG);

  let globalState = useGApp();

  useEffect(() => {
    globalState.getRegs();
    globalState.setMainClass("");
    //eslint-disable-next-line
  }, []);

  const regs = globalState._regulations;

  let items = [],
    selectedItems = [],
    searchPlaceholder = "",
    onSelect,
    onDeSelect,
    isChecked,
    getName = null,
    nextButtonEl = null,
    backButtonEl = null;

  const handleSearch = ({ target: { value: query } }) => setQuery(query);
  const changeMode = to => setMode(to);
  const onDone = () => history.push("/quest-blocks");

  if (mode === MODE_REG) {
    searchPlaceholder = "Search For Regulations";

    items = regs.getRegs(query);
    selectedItems = regs.allSelectedRegs;

    onSelect = item => regs.selectReg(item);
    onDeSelect = item => regs.deSelectReg(item);

    getName = item => item.regulation;

    isChecked = item => regs.isSelectedReg(item.id);

    nextButtonEl = (
      <button
        onClick={() => {
          changeMode(MODE_FUNC);
          regs.clearFuncs();
        }}
        disabled={!selectedItems.length}
      >
        Next
      </button>
    );
  } else if (mode === MODE_FUNC) {
    searchPlaceholder = "Search For Functions";

    items = regs.getFuncs(query);
    selectedItems = regs.selectedFuns;

    onSelect = item => regs.selectFunc(item);
    onDeSelect = item => regs.deSelectFunc(item);

    getName = item => item;

    isChecked = item => regs.isSelectedFunc(item);

    nextButtonEl = (
      <button onClick={onDone} disabled={!selectedItems.length}>
        Next
      </button>
    );
    backButtonEl = <button onClick={() => changeMode(MODE_REG)}>Back</button>;
  }

  const renderTag = (item, idk) => (
    <Tag key={idk} onClick={() => onDeSelect(item)}>
      {getName(item)}
    </Tag>
  );

  const renderCheckBox = (item, idk) => (
    <label key={idk} className="checkbox flex-row flex-start-stretch">
      <input
        type="checkbox"
        onChange={({ target: { checked } }) =>
          checked ? onSelect(item) : onDeSelect(item)
        }
        checked={isChecked(item)}
      />
      {getName(item)}
    </label>
  );

  if (globalState.isLoading) {
    return <section>Loading!</section>;
  }

  if (!items.length && !query) {
    return <section>No Items Found!&nbsp;{backButtonEl}</section>;
  }

  return (
    <article className="selector-pane flex-column flex-spaced-centered">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={query}
        onChange={handleSearch}
      />
      <div className="tag-pane flex-row flex-centered flex-wrapped">
        {selectedItems.map(renderTag)}
      </div>
      <div className="checkbox-pane flex-row flex-wrapped flex-centered-stretch">
        {items.map(renderCheckBox)}
      </div>
      <div className="action-pane flex-row flex-centered-stretch">
        {nextButtonEl}
        {backButtonEl}
      </div>
    </article>
  );
};

export default observer(SelRegAndFunc);
