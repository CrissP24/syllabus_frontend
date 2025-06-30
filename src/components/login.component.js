import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import AuthService from "../services/auth.service";
import { withRouter } from "../common/with-router";
import "./css/Login.css";


import login1 from "./unesum.jpeg";

const required = (value) => {
  if (!value) {
    return <div className="alert alert-danger mt-2">¡Este campo es obligatorio!</div>;
  }
};

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {
      username: "",
      password: "",
      loading: false,
      message: ""
    };
  }

  onChangeUsername(e) {
    this.setState({ username: e.target.value });
  }

  onChangePassword(e) {
    this.setState({ password: e.target.value });
  }

  handleLogin(e) {
    e.preventDefault();
    this.setState({ message: "", loading: true });
    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      AuthService.login(this.state.username, this.state.password).then(
        () => {
          this.props.router.navigate("/profile");
          window.location.reload();
        },
        (error) => {
          const resMessage =
            (error.response?.data?.message) || error.message || error.toString();

          this.setState({ loading: false, message: resMessage });
        }
      );
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <div className="login-container">
        <div className="login-card shadow-lg">
          <div className="login-left">
            <img src={login1} alt="login" className="img-fluid" />
            
          </div>
          <div className="login-right">
            <h3 className="text-center mb-4">Inicio de Sesión</h3>
            <Form
              onSubmit={this.handleLogin}
              ref={(c) => {
                this.form = c;
              }}
            >
              <div className="form-group mb-3">
                <label>Usuario</label>
                <Input
                  type="text"
                  className="form-control input-custom"
                  name="username"
                  value={this.state.username}
                  onChange={this.onChangeUsername}
                  validations={[required]}
                />
              </div>

              <div className="form-group mb-3">
                <label>Contraseña</label>
                <Input
                  type="password"
                  className="form-control input-custom"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChangePassword}
                  validations={[required]}
                />
              </div>

              {this.state.message && (
                <div className="alert alert-danger">{this.state.message}</div>
              )}

              <div className="d-grid">
                <button className="btn btn-primary btn-login" disabled={this.state.loading}>
                  {this.state.loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              </div>

              <CheckButton
                style={{ display: "none" }}
                ref={(c) => {
                  this.checkBtn = c;
                }}
              />
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
