import React, { useEffect, useState } from "react";
import "./openai.css";
import axios from "axios";
import { Spinner } from "react-bootstrap";

export default function AskOpenai() {
  const [questions, setQuestions] = useState([]);
  const [listQuestions, setListQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingIndex, setLoadingIndex] = React.useState(-1);
  const [isList, setIsList] = useState(false);
  const [tag, setTag] = useState("");
  const [response, setResponse] = useState("");
  const [context_set, setContext_set] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch("/question/all")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
      });
  }, []);

  const handleClick = async (index, item) => {
    setLoadingIndex(index);
    setIsLoading(true);
    setListQuestions({ isLoading: true });
    try {
      const response = await axios.post("/question/ask_openai", {
        main_question: item.main_question,
      });
      if (Array.isArray(response.data)) {
        setListQuestions(response.data);
        setIsList(true);
        setSelectedQuestion(item.main_question);
        setLoadingIndex(-1);
      } else {
        setIsList(false);
        throw new Error("Invalid response from OpenAI API");
      }
    } catch (error) {
      console.log(JSON.stringify(error.mesaage));
      setLoadingIndex(-1);
      setListQuestions({ isLoading: false, generatedList: [] });
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedQuestion(null);
    setListQuestions([]);
  };

  const handleDelete = async (index) => {
    const updatedQuestions = [...listQuestions];
    updatedQuestions.splice(index, 1);
    setListQuestions(updatedQuestions);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      tag: tag,
      patterns: listQuestions,
      responses: [response],
      context_set: context_set,
    };

    fetch("/question/toJson", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response);
        setIsSaved(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="my-container">
      {questions.map((item, index) => (
        <div key={index} className="my-item">
          <div className="row">
            <div className="col-md-8">
              <p>{item.main_question}</p>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-success"
                onClick={() => handleClick(index, item)}
                disabled={isLoading || loadingIndex === index}
              >
                {loadingIndex === index ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ marginRight: "5px" }}
                    />
                    Loading...
                  </>
                ) : (
                  "Ask OpenAI"
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
      {!isSaved && isList && listQuestions && (
        <div>
          <h3>{selectedQuestion}</h3>

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Tag"
                  onChange={(e) => setTag(e.target.value)}
                />
              </div>
              <div className="form-group">
                <textarea
                  type="text"
                  className="form-control"
                  placeholder="Enter Response"
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Context Set"
                  onChange={(e) => setContext_set(e.target.value)}
                />
              </div>
              <div className="question-list">
                {listQuestions.map((item, index) => (
                  <div key={index} className="question-brick">
                    <div className="question-text">{item}</div>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>

          <div className="row mt-2">
            <div className="col-md-4"></div>
          </div>
        </div>
      )}
      {isSaved && (
        <div className="alert alert-success mt-4" role="alert">
          <h3>Tag Added</h3>
        </div>
      )}
    </div>
  );
}
