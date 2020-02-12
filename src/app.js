import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { observer } from "mobx-react";
import { SelRegAndFunc, QueBlockList, Login, Signup } from "./pages";
import { AppLayout } from "./components";
import AppContext from "./app.context";
import AppModel from "./app-model";

const store = AppModel.create({
  _token: localStorage.getItem("_token") || "",
  _userId: localStorage.getItem("_userId") || "",
  _userDet: JSON.parse(localStorage.getItem("_userDet")) || {
    username: "",
    email: "",
    emailVerified: false,
    role: ""
  }
});

const AppRouter = () => {
  useEffect(() => {
    store.boot();
    return () => {
      store.shut();
    };
  }, []);

  if (store.isBooting) {
    return <div>Booting...</div>;
  }

  return (
    <BrowserRouter>
      <AppContext.Provider value={store}>
        <AppLayout>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/home" exact component={SelRegAndFunc} />
            <Route path="/quest-blocks" exact component={QueBlockList} />
            <Route path="/sign-up" exact component={Signup} />
            <Redirect to="/" />
          </Switch>
        </AppLayout>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default observer(AppRouter);
