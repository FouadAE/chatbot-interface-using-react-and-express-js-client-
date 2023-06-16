import React from "react";
import axios from "axios";
import "./questions.css";
import { useEffect, useRef } from "react";

function Message({ text, isUser }) {
  const className = isUser ? "message user" : "message bot";
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: text }} />
  );
}

export default function AskChatbot() {
  const [messages, setMessages] = React.useState([]);
  const [options, setOptions] = React.useState([]);
  const [question, setQuestion] = React.useState("");
  const [context, setContext] = React.useState("");
  const [showChat, setShowChat] = React.useState(false);
  const messageThreadRef = useRef(null);

  const handleClick = (e, question) => {
    e.preventDefault();
    console.log("request send");
    setQuestion("");
    axios
      .post("http://localhost:8000/chat", {
        question: question,
      })
      .then((r) => {
        console.log("bot answer", r.data);
        console.log(typeof r.data);
        const newMessages = [...messages];
        newMessages.push({ text: question, isUser: true });
        newMessages.push({ text: r.data.message, isUser: false });
        setMessages(newMessages);
        setOptions(r.data.options);
        setContext(r.data.context || "");
        if (r.data.message === "I don't understand!") {
          axios
            .post("/question/save", {
              main_question: question,
            })
            .then((r) => console.log(r.data))
            .catch((e) => console.log(JSON.stringify(e.response.data)));
        }
      })
      .catch((e) => console.log(JSON.stringify(e.response.data)));
  };

  const sendOptions = (e, option) => {
    e.preventDefault();
    console.log("request send");
    let messageToSend = option;

    if (context) {
      messageToSend = context + ": " + option;
    }

    setQuestion("");
    axios
      .post("http://localhost:8000/chat", {
        question: messageToSend,
      })
      .then((r) => {
        console.log("bot answer", r.data);
        console.log(typeof r.data);
        const newMessages = [...messages];
        newMessages.push({ text: messageToSend, isUser: true });
        newMessages.push({ text: r.data.message, isUser: false });
        setMessages(newMessages);
        setOptions(r.data.options);
        setContext(r.data.context || "");
      })
      .catch((e) => console.log(JSON.stringify(e.response.data)));
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };
  useEffect(() => {
    // Scroll to the last message
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTop =
        messageThreadRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      {showChat ? (
        <div className="chat-container border">
          <div className="chat-header">
            <div className="chat-title">
              <span>Jamea Elfna Assistance</span>
            </div>
            <button className="close-button" onClick={toggleChat}>
              X
            </button>
          </div>
          <div className="message-thread" ref={messageThreadRef}>
            {messages.map((message, index) => (
              <Message
                key={index}
                text={message.text}
                isUser={message.isUser}
              />
            ))}
            {options && (
              <div className="options">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className="btn btn-success"
                    onClick={(e) => sendOptions(e, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="chat-input-container">
            <form>
              <div className="input-group">
                <input
                  value={question}
                  name="question"
                  className="form-control"
                  placeholder="Type your message here"
                  onChange={(e) => setQuestion(e.target.value)}
                ></input>
                <button
                  className="btn btn-primary"
                  onClick={(e) => handleClick(e, question)}
                >
                  send
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <button className="chat-button" onClick={toggleChat}>
          <img src="chatbot.png" alt="Chatbot Icon" className="chat-icon" />
        </button>
      )}
    </div>
  );
}
