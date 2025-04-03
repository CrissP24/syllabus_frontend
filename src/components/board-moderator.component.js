import React, { Component } from "react";

import UserService from "../services/user.service";
import EventBus from "../common/EventBus";

export default class BoardModerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      testText: "Este es un texto de prueba 222.",
      additionalInfo: "Hola Mundo."
    };
  }

  componentDidMount() {
    UserService.getModeratorBoard().then(
      response => {
        this.setState({
          content: response.data
        });
      },
      error => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
        });

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }

  render() {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>{this.state.content}</h3>
        </header>
        {/* Textos de prueba adicionales */}
        <div className="test-texts">
          <p>{this.state.testText}</p>
          <p>{this.state.additionalInfo}</p>
          <p>Este es otro texto fijo que se muestra siempre.</p>
        </div>
      </div>
    );
  }
}
