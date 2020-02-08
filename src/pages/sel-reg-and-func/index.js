import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { Tag, Card, Input, Button, Checkbox, Row, Col } from "antd";
import { useGApp } from "../../utils";

const MODE_REG = "select-regulations";
const MODE_FUNC = "select-functions";

const SelRegAndFunc = ({ history, location }) => {
  let [query, setQuery] = useState("");
  let [mode, setMode] = useState(MODE_REG);

  let globalState = useGApp();

  useEffect(() => {
    globalState.getRegs().then(redirect => {
      if (
        redirect &&
        (!location.state || (location.state && !location.state.update))
      ) {
        history.push("/quest-blocks");
      }
    });
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
  const onDone = () => {
    history.push("/quest-blocks", {});
  };

  if (mode === MODE_REG) {
    searchPlaceholder = "Search For Regulations";

    items = regs.getRegs(query);
    selectedItems = regs.allSelectedRegs;

    onSelect = item => regs.selectReg(item);
    onDeSelect = item => regs.deSelectReg(item);

    getName = item => item.regulation;

    isChecked = item => regs.isSelectedReg(item.id);

    nextButtonEl = (
      <Button
        onClick={() => {
          changeMode(MODE_FUNC);
          regs.clearFuncs();
        }}
        disabled={!selectedItems.length}
      >
        Next
      </Button>
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
      <Button onClick={onDone} disabled={!selectedItems.length}>
        Next
      </Button>
    );
    backButtonEl = <Button onClick={() => changeMode(MODE_REG)}>Back</Button>;
  }

  const renderTag = (item, idk) => (
    <Tag key={idk} onClick={() => onDeSelect(item)}>
      {getName(item)}
    </Tag>
  );

  const renderCheckBox = (item, idk) => (
    <Checkbox
      key={idk}
      size="small"
      onChange={({ target: { checked } }) =>
        checked ? onSelect(item) : onDeSelect(item)
      }
      checked={isChecked(item)}
    >
      {getName(item)}
    </Checkbox>
  );

  if (!items.length && !query) {
    return <Card>No Items Found!&nbsp;{backButtonEl}</Card>;
  }

  return (
    <Card loading={globalState.isLoading}>
      <Row gutter={[16, 16]}>
        <Col>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} type="flex" justify="center">
        <Col>{selectedItems.map(renderTag)}</Col>
      </Row>

      <Row gutter={[16, 16]} type="flex" justify="center">
        <Col>{items.map(renderCheckBox)}</Col>
      </Row>

      <Row gutter={[16, 16]} type="flex" justify="center">
        <Col>{nextButtonEl}</Col>
        <Col>{backButtonEl}</Col>
      </Row>
    </Card>
  );
};

export default observer(SelRegAndFunc);
