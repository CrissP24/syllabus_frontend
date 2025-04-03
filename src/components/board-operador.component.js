import React, { Component } from "react";

import UserService from "../services/user.service";
import EventBus from "../common/EventBus";

export default class BoardOperador extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      testText: "Este es un texto de prueba para Operador del Sistema.",
      additionalInfo: "Información adicional para el rol de Operador del Sistema."
    };
  }

  componentDidMount() {
    UserService.getOperadorBoard().then(
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
        <div className="test-texts">
          <p>{this.state.testText}</p>
          <p>{this.state.additionalInfo}</p>
        </div>
      </div>
    );
  }
}
