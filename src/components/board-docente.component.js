import React, { Component } from "react";
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";

export default class BoardDocente extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      currentTeacher: null, // Docente autenticado
      silabos: [],
      selectedSilabo: "",
      assignedClasses: [], // Clases asignadas al docente
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    // Obtener datos del docente autenticado
    UserService.getCurrentTeacher().then(
      response => {
        this.setState({
          currentTeacher: response.data,
          loading: false
        });
      },
      error => {
        this.setState({
          error: (error.response?.data?.message) || error.message || error.toString(),
          loading: false
        });
        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );

    // Obtener sílabos disponibles
    UserService.getSilabos().then(
      response => {
        this.setState({ silabos: response.data });
      },
      error => {
        this.setState({ error: error.message });
      }
    );

    // Obtener clases asignadas al docente
    UserService.getTeacherClasses().then(
      response => {
        this.setState({ assignedClasses: response.data });
      },
      error => {
        this.setState({ error: error.message });
      }
    );
  }

  handleSilaboChange = (event) => {
    this.setState({ selectedSilabo: event.target.value });
    // Aquí podrías filtrar las clases asignadas según el sílabo seleccionado si lo deseas
  };

  render() {
    const { currentTeacher, silabos, selectedSilabo, assignedClasses, loading, error } = this.state;

    if (loading) {
      return <div className="container"><p>Cargando...</p></div>;
    }

    if (error) {
      return <div className="container"><p>Error: {error}</p></div>;
    }

    return (
      <div className="container">
        <header className="jumbotron">
          <h3>Bienvenido, {currentTeacher?.nombre}</h3>
        </header>

        {/* Información Personal */}
        <div className="dashboard-section">
          <h4>Información Personal</h4>
          <div className="card">
            <div className="card-body">
              <p><strong>ID:</strong> {currentTeacher?.id}</p>
              <p><strong>Email:</strong> {currentTeacher?.email}</p>
              <p><strong>Departamento:</strong> {currentTeacher?.departamento || "No especificado"}</p>
            </div>
          </div>
        </div>

        {/* Selección de Sílabos */}
        <div className="dashboard-section">
          <h4>Selecciona un Sílabo</h4>
          <select onChange={this.handleSilaboChange} value={selectedSilabo} className="form-control">
            <option value="">Todos los sílabos</option>
            {silabos.map(silabo => (
              <option key={silabo.id} value={silabo.id}>
                {silabo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Clases Asignadas */}
        <div className="dashboard-section">
          <h4>Clases Asignadas</h4>
          {assignedClasses.length === 0 ? (
            <p>No hay clases asignadas actualmente</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Sección del Sílabo</th>
                  <th>Materiales</th>
                  <th>Bibliografía</th>
                </tr>
              </thead>
              <tbody>
                {assignedClasses
                  .filter(clase => !selectedSilabo || clase.silaboId === selectedSilabo)
                  .map((clase, index) => (
                    <tr key={index}>
                      <td>{new Date(clase.fecha).toLocaleDateString()}</td>
                      <td>{clase.seccionSilabo}</td>
                      <td>{clase.materiales}</td>
                      <td>{clase.bibliografia}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Estadísticas rápidas (opcional) */}
        <div className="dashboard-section">
          <h4>Estadísticas</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total de Clases</p>
              <h5>{assignedClasses.length}</h5>
            </div>
            <div className="stat-card">
              <p>Sílabos Asignados</p>
              <h5>{new Set(assignedClasses.map(c => c.silaboId)).size}</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}