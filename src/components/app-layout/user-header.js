import React from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { useGApp } from "../../utils";
import "./user-header.css";

const UserHeader = ({ history }) => {
  const globalState = useGApp();
  const logoutHandler = async () => {
    try {
      await globalState.logout();
      history.push("/");
    } catch (error) {
      if (error.response.status === 401) {
        globalState.setToken("");
        history.push("/");
      } else {
        alert(
          `Error while logging-out! Error message - ${error.message}. Contact Admin!`
        );
      }
    }
  };
  return (
    <div className="user-header flex-row flex-centered">
      <div>Welcome User!</div>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  );
};

export default observer(withRouter(UserHeader));
