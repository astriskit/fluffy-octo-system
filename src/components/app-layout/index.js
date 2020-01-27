import React from "react";
import { Container, Col, Row } from "react-bootstrap";

const AppLayout = ({ children }) => {
  return (
    <Container fluid>
      <Row>
        <Col>
          <header>Welcome to my site.</header>
        </Col>
      </Row>
      <Row>
        <Col>{children}</Col>
      </Row>
      <Row>
        <Col>
          <footer>&copy; 2020-21 HS</footer>
        </Col>
      </Row>
    </Container>
  );
};

export default AppLayout;
