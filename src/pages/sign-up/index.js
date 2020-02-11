import React, { useState } from "react";
import { observer } from "mobx-react";
import { Form, Input, Button, Card, Select, message } from "antd";
import { useGApp } from "../../utils";
// import "./index.css";

const Signup = props => {
  let globalState = useGApp();

  let [state, setState] = useState({
    email: "",
    password: "",
    username: "",
    role: ""
  });

  const setEmail = ({ target: { value: email } }) =>
    setState({ ...state, email });

  const setPassword = ({ target: { value: password } }) =>
    setState({ ...state, password });

  const setUsername = ({ target: { value: username } }) =>
    setState({ ...state, username });

  const setRole = role => setState({ ...state, role });

  const handleSignup = async () => {
    try {
      if (!state.email || !state.password || !state.role || !state.username) {
        alert("Fill the required information");
        return;
      }
      await globalState.signUp({
        email: state.email,
        password: state.password,
        role: state.role,
        username: state.username
      });
      props.history.push("/");
      message.success("Registration Successfull. Login Into Your Account.");
    } catch (error) {
      message.error(`Signup Failed -${error.message}`);
    }
  };

  return (
    <Card title="Register yourself" className="signup-card">
      <Form>
        <Form.Item label="Email" required>
          <Input
            placeholder="Email"
            type="email"
            onChange={setEmail}
            value={state.email || ""}
          />
        </Form.Item>
        <Form.Item label="Username" required>
          <Input
            placeholder="Username"
            onChange={setUsername}
            value={state.username || ""}
          />
        </Form.Item>
        <Form.Item label="Password" required>
          <Input
            placeholder="Password"
            type="password"
            onChange={setPassword}
            value={state.password || ""}
          />
        </Form.Item>
        <Form.Item label="Role" required>
          <Select
            onChange={setRole}
            value={state.role || ""}
            style={{ width: "100%" }}
          >
            <Select.Option value="CSO">CSO</Select.Option>
            <Select.Option value="Delegatee">Delegatee</Select.Option>
          </Select>
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

export default observer(Signup);
