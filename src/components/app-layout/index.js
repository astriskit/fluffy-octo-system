import React from "react";
import { observer } from "mobx-react";
import UserHeader from "./user-header";
import { useGApp } from "../../utils";
import { Layout } from "antd";

const AppLayout = ({ children }) => {
  let globalState = useGApp();
  return (
    <Layout>
      <Layout.Header
        style={{
          display: "flex",
          justifyContent: "stretch",
          alignItems: "center",
          color: "white"
        }}
      >
        {globalState.isLoggedIn ? <UserHeader /> : <></>}
      </Layout.Header>
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  );
};

export default observer(AppLayout);
