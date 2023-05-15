import React, { useEffect, useState } from "react";
import "./questions.css";
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
        //console.log(data);
        setQuestions(data.questions);
      });
  }, []);

  const handleClick = async (index, item) => {
    console.log("request send");
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

          <div className="row mt-2">
            <div className="col-md-4"></div>
            <div className="col-md-4">
              <button className="btn btn-primary m-2" onClick={handleReset}>
                Back
              </button>
            </div>
          </div>
          <div className="row">
            {listQuestions.map((item, index) => (
              <div key={index} className="col-md-4">
                <div className="card m-2">
                  <div className="card-body">
                    <p className="card-text">{item}</p>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(index)}
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="row">
              <div className="col-md-3"></div>
              <div className="col-md-8">
                <form onSubmit={handleSubmit}>
                  <div className="form-group m-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Tag"
                      onChange={(e) => setTag(e.target.value)}
                    />
                  </div>
                  <div className="form-group m-2">
                    <textarea
                      type="text"
                      className="form-control"
                      placeholder="Enter Response"
                      onChange={(e) => setResponse(e.target.value)}
                    />
                  </div>
                  <div className="form-group m-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Context Set"
                      onChange={(e) => setContext_set(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isSaved && (
        <div className="alert alert-success" role="alert">
          <h3>Question Saved</h3>
        </div>
      )}
    </div>
  );
}
