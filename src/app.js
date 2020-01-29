import React from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { SelRegAndFunc, QueBlockList, Login } from "./pages";
import { AppLayout } from "./components";
import AppContext from "./app.context";
import AppModel from "./app-model/";

const store = AppModel.create({ _token: localStorage.getItem("_token") || "" });

const AppRouter = () => (
  <HashRouter>
    <AppContext.Provider value={store}>
      <AppLayout>
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/home" exact component={SelRegAndFunc} />
          <Route path="/quest-blocks" exact component={QueBlockList} />
          <Redirect to="/" />
        </Switch>
      </AppLayout>
    </AppContext.Provider>
  </HashRouter>
);

export default AppRouter;
