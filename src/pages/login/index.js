import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { Form, Input, Button, Card } from "antd";
import { useGApp } from "../../utils";
import "./index.css";

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

  const handleSignup = () => {
    props.history.push("/sign-up");
  };

  return (
    <Card title="Login" size="small" className="login-card">
      <Form layout="inline">
        <Form.Item label="Email" required>
          <Input
            placeholder="Email"
            type="email"
            onChange={setEmail}
            value={state.email || ""}
            disabled={globalState.isLoading}
          />
        </Form.Item>
        <Form.Item label="Password" required>
          <Input
            placeholder="Password"
            type="password"
            onChange={setPassword}
            value={state.password || ""}
            disabled={globalState.isLoading}
          />
        </Form.Item>
        <Form.Item>
          <Button
            loading={globalState.isLoading}
            onClick={handleLogin}
            type="primary"
          >
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={handleSignup} type="primary">
            Signup
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default observer(Login);
