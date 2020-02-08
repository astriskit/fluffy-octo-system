import React from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { useGApp } from "../../utils";
import { Button } from "antd";

const UserHeader = ({ history }) => {
  const globalState = useGApp();

  const logoutHandler = async () => {
    try {
      await globalState.logout();
      history.push("/");
    } catch (error) {
      if (error.response.status === 401) {
        globalState.setCredentials();
        history.push("/");
      } else {
        alert(
          `Error while logging-out! Error message - ${error.message}. Contact Admin!`
        );
      }
    }
  };

  return (
    <>
      <div style={{ flex: "2" }}>Welcome User!</div>
      <Button
        onClick={logoutHandler}
        type="primary"
        loading={globalState.isLoading}
      >
        Logout
      </Button>
    </>
  );
};

export default withRouter(observer(UserHeader));
