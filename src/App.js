import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { SelRegulators, SelFuncGroups, QueBlockList, QueList } from "./pages";
import AppContext from "./app.context";
import AppModel from "./app.model";

const store = AppModel.create({});

const AppRouter = () => (
  <BrowserRouter>
    <AppContext.Provider value={store}>
      <AppLayout>
        <Switch>
          <Route path="/" exact component={SelRegulators} />
          <Route path="/select-func-grp" exact component={SelFuncGroups} />
          <Route path="/quest-blocks/:id" exact component={QueList} />
          <Route path="/quest-blocks" exact component={QueBlockList} />
          <Redirect to="/" />
        </Switch>
      </AppLayout>
    </AppContext.Provider>
  </BrowserRouter>
);

export default AppRouter;
