import React from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import {
  SelRegulators,
  SelFuncGroups,
  QueBlockList,
  QueList,
  Login
} from "./pages";
import { AppLayout } from "./components";
import AppContext from "./app.context";
import AppModel from "./app-model/";

const store = AppModel.create({});

const AppRouter = () => (
  <HashRouter>
    <AppContext.Provider value={store}>
      <AppLayout>
        <Switch>
          <Route path="/" exact component={SelRegulators} />
          <Route path="/login" exact component={Login} />
          <Route path="/select-func-grp" exact component={SelFuncGroups} />
          <Route path="/quest-blocks/:id" exact component={QueList} />
          <Route path="/quest-blocks" exact component={QueBlockList} />
          <Redirect to="/" />
        </Switch>
      </AppLayout>
    </AppContext.Provider>
  </HashRouter>
);

export default AppRouter;
