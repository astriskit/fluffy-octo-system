import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useGApp } from "../../utils";
import "./style.css";

const Login = props => {
  let globalState = useGApp();

  useEffect(() => {
    if (globalState.isLoggedIn) {
      props.history.push("/home");
    }
    // eslint-disable-next-line
  }, []);

  let [state, setState] = useState({ email: "", password: "" });

  const setEmail = ({ target: { value: email } }) =>
    setState({ ...state, email });

  const setPassword = ({ target: { value: password } }) =>
    setState({ ...state, password });

  const handleLogin = async () => {
    try {
      if (!state.email || !state.password) {
        alert("Fill the required information");
        return;
      }
      await globalState.login(state.email, state.password);
      props.history.push("/home");
    } catch (error) {
      alert("Login Failed. Check Email and Password!");
    }
  };

  return (
    <fieldset className="login-form flex-column flex-centered">
      <legend>Login</legend>
      <label className="flex-row flex-spaced-centered">
        Email
        <input
          placeholder="Email"
          type="text"
          onChange={setEmail}
          value={state.email || ""}
          disabled={globalState.isLoading}
          required
        />
      </label>
      <label className="flex-row flex-spaced-centered">
        Password
        <input
          placeholder="Password"
          type="password"
          onChange={setPassword}
          value={state.password || ""}
          disabled={globalState.isLoading}
          required
        />
      </label>
      <div className="flex-row flex-centered">
        <button disabled={globalState.isLoading} onClick={handleLogin}>
          Login
        </button>
      </div>
    </fieldset>
  );
};

export default observer(Login);
