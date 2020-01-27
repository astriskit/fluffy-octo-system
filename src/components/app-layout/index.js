import React from "react";
import { observer } from "mobx-react";
import UserHeader from "./user-header";
import { useGApp } from "../../utils";
import "./style.css";

const AppLayout = ({ children }) => {
  let globalState = useGApp();
  return (
    <section
      className={`app-container flex-column ${
        globalState.isLoggedIn ? "flex-start-stretch" : "flex-centered"
      }`}
    >
      {globalState.isLoggedIn && <UserHeader />}
      <main className="flex-row flex-centered-stretch">{children}</main>
    </section>
  );
};

export default observer(AppLayout);
