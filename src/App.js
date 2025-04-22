import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";
import EventBus from "./common/EventBus";
import Sidebar from "./components/sidebar.component";

// Componentes
import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";
import BoardDocente from "./components/board-docente.component";
import BoardEstudiante from "./components/board-estudiante.component";
import BoardOperador from "./components/board-operador.component";
import BoardCoordinador from "./components/board-coordinador.component";
import BoardSecretaria from "./components/board-secretaria.component";
import BoardDecano from "./components/board-decano.component";
import BoardComisionSilabos from "./components/board-comision-silabos.component";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      showDocenteBoard: false,
      showEstudianteBoard: false,
      showOperadorBoard: false,
      showCoordinadorBoard: false,
      showSecretariaBoard: false,
      showDecanoBoard: false,
      showComisionSilabosBoard: false,
      currentUser: undefined,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
        showDocenteBoard: user.roles.includes("ROLE_DOCENTE"),
        showEstudianteBoard: user.roles.includes("ROLE_ESTUDIANTE"),
        showOperadorBoard: user.roles.includes("ROLE_OPERADOR_SISTEMA"),
        showCoordinadorBoard: user.roles.includes("ROLE_COORDINADOR"),
        showSecretariaBoard: user.roles.includes("ROLE_SECRETARIA"),
        showDecanoBoard: user.roles.includes("ROLE_DECANO"),
        showComisionSilabosBoard: user.roles.includes("ROLE_COMISION_SILABOS"),
      });
    }

    EventBus.on("logout", this.logOut);
  }

  componentWillUnmount() {
    EventBus.remove("logout");
  }

  logOut() {
    AuthService.logout();
    this.setState({
      showModeratorBoard: false,
      showAdminBoard: false,
      showDocenteBoard: false,
      showEstudianteBoard: false,
      showOperadorBoard: false,
      showCoordinadorBoard: false,
      showSecretariaBoard: false,
      showDecanoBoard: false,
      showComisionSilabosBoard: false,
      currentUser: undefined,
    });
  }

  render() {
    const { currentUser } = this.state;

    return (
      <div className="d-flex" style={{ background: currentUser ? 'transparent' : 'linear-gradient(to right, #00b09b, #96c93d)' }}>
        {/* Sidebar */}
        {currentUser && (
          <Sidebar user={currentUser} className="sidebar bg-light border-end" />
        )}

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column min-vh-100">
          {/* Navbar */}
          <nav className="navbar navbar-expand-lg navbar-green px-3">
            <Link to={"/"} className="navbar-brand text-uppercase">
              UNESUM
            </Link>
            <div className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to={"/home"} className="nav-link">
                  Principal
                </Link>
              </li>
            </div>

            {/* User Options */}
            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/profile"} className="nav-link">
                    {currentUser.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={this.logOut}>
                    Cerrar sesión
                  </a>
                </li>
              </div>
            ) : (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/login"} className="nav-link">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={"/register"} className="nav-link">
                    Registrarse
                  </Link>
                </li>
              </div>
            )}
          </nav>

          {/* Main Routes */}
          <div className="container-fluid mt-3 flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user" element={<BoardUser />} />
              {currentUser && this.state.showModeratorBoard && (
                <Route path="/mod" element={<BoardModerator />} />
              )}
              {currentUser && this.state.showAdminBoard && (
                <Route path="/admin" element={<BoardAdmin />} />
              )}
              {currentUser && this.state.showDocenteBoard && (
                <Route path="/docente" element={<BoardDocente />} />
              )}
              {currentUser && this.state.showEstudianteBoard && (
                <Route path="/estudiante" element={<BoardEstudiante />} />
              )}
              {currentUser && this.state.showOperadorBoard && (
                <Route path="/operador_sistema" element={<BoardOperador />} />
              )}
              {currentUser && this.state.showCoordinadorBoard && (
                <Route path="/coordinador" element={<BoardCoordinador />} />
              )}
              {currentUser && this.state.showSecretariaBoard && (
                <Route path="/secretaria" element={<BoardSecretaria />} />
              )}
              {currentUser && this.state.showDecanoBoard && (
                <Route path="/decano" element={<BoardDecano />} />
              )}
              {currentUser && this.state.showComisionSilabosBoard && (
                <Route
                  path="/comision_silabos"
                  element={<BoardComisionSilabos />}
                />
              )}
            </Routes>
          </div>
          {/* Footer */}
          <footer className="footer">
            <p className="mb-0">© {new Date().getFullYear()} UNESUM. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    );
  }
}

export default App;
