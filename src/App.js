import React from "react";
import "./App.css";
import AskChatbot from "./components/askChatbot";
import AskOpenai from "./components/askOpenai";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Nav, Navbar } from "react-bootstrap";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#">Jamea Elfna Chatbot</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <Nav.Link as={Link} to="/ask-chatbot">
                Ask Chatbot
              </Nav.Link>
              <Nav.Link as={Link} to="/ask-openai">
                Ask OpenAI
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes>
          <Route path="/ask-chatbot" element={<AskChatbot />} />
          <Route path="/" element={<AskChatbot />} />
          <Route path="/ask-openai" element={<AskOpenai />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
