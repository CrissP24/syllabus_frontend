import React, { Component } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import UserService from "../services/user.service";
import EventBus from "../common/EventBus";

class ClassScheduler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: new Date(),
      scheduledClasses: [],
      selectedTeacher: null,
      teachers: [
        { id: 1, name: "Docente 1" },
        { id: 2, name: "Docente 2" },
        { id: 3, name: "Docente 3" }
      ],
      classDetails: {
        syllabusSection: "",
        materials: "",
        bibliography: ""
      }
    };
  }

  // Métodos existentes (componentDidMount, onDateChange, etc.) permanecen igual
  componentDidMount() {
    UserService.getComisionSilabosBoard().then(
      response => {
        this.setState({ content: response.data });
      },
      error => {
        this.setState({
          content: (error.response?.data?.message) || error.message || error.toString()
        });
        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }

  onDateChange = (date) => this.setState({ selectedDate: date });

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      classDetails: { ...prevState.classDetails, [name]: value }
    }));
  };

  handleTeacherSelect = (teacherId) => {
    const teacher = this.state.teachers.find(t => t.id === parseInt(teacherId));
    this.setState({ selectedTeacher: teacher });
  };

  scheduleClass = () => {
    const newClass = {
      date: this.state.selectedDate,
      teacher: this.state.selectedTeacher,
      details: { ...this.state.classDetails }
    };
    this.setState(prevState => ({
      scheduledClasses: [...prevState.scheduledClasses, newClass],
      classDetails: { syllabusSection: "", materials: "", bibliography: "" }
    }));
  };

  render() {
    const { selectedDate, scheduledClasses, teachers, selectedTeacher, classDetails } = this.state;

    return (
      <div className="scheduler-wrapper">
        <header className="scheduler-header">
          <h1>CRONOGRAMA</h1>
        </header>

        <div className="scheduler-grid">
          {/* Panel de Selección */}
          <div className="scheduler-panel teacher-panel">
            <h2>Docente</h2>
            <select 
              className="teacher-select"
              onChange={(e) => this.handleTeacherSelect(e.target.value)}
              value={selectedTeacher?.id || ""}
            >
              <option value="">Elegir docente</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          {/* Panel de Calendario */}
          <div className="scheduler-panel calendar-panel">
            <h2>Fecha</h2>
            <Calendar
              onChange={this.onDateChange}
              value={selectedDate}
              className="custom-calendar"
            />
          </div>

          {/* Panel de Detalles */}
          {selectedTeacher && (
            <div className="scheduler-panel details-panel">
              <h2>Detalles de Clase</h2>
              <div className="form-group">
                <label>Sección del Sílabo</label>
                <input
                  type="text"
                  name="syllabusSection"
                  value={classDetails.syllabusSection}
                  onChange={this.handleInputChange}
                  placeholder="Ingrese sección..."
                />
              </div>
              <div className="form-group">
                <label>Materiales</label>
                <textarea
                  name="materials"
                  value={classDetails.materials}
                  onChange={this.handleInputChange}
                  placeholder="Liste materiales..."
                />
              </div>
              <div className="form-group">
                <label>Bibliografía</label>
                <textarea
                  name="bibliography"
                  value={classDetails.bibliography}
                  onChange={this.handleInputChange}
                  placeholder="Referencias..."
                />
              </div>
              <button 
                onClick={this.scheduleClass}
                disabled={!classDetails.syllabusSection}
                className="schedule-btn"
              >
                Programar
              </button>
            </div>
          )}
        </div>

        {/* Lista de Clases */}
        <div className="classes-list">
          <h2>Clases Programadas</h2>
          {scheduledClasses.length === 0 ? (
            <p className="no-classes">No hay clases programadas</p>
          ) : (
            <div className="classes-grid">
              {scheduledClasses.map((classItem, index) => (
                <div key={index} className="class-card">
                  <div className="class-date">
                    {classItem.date.toLocaleDateString()}
                  </div>
                  <div className="class-info">
                    <p><strong>Docente:</strong> {classItem.teacher?.name}</p>
                    <p><strong>Sección:</strong> {classItem.details.syllabusSection}</p>
                    <p><strong>Materiales:</strong> {classItem.details.materials || 'N/A'}</p>
                    <p><strong>Bibliografía:</strong> {classItem.details.bibliography || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .scheduler-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Arial', sans-serif;
          }

          .scheduler-header {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
          }

          .scheduler-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }

          .scheduler-panel {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }

          h2 {
            color: #34495e;
            margin-bottom: 15px;
            font-size: 1.5rem;
          }

          .teacher-select {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            font-size: 1rem;
          }

          .custom-calendar {
            border: none;
            border-radius: 5px;
            width: 100%;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #666;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #3498db;
            outline: none;
          }

          .schedule-btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
          }

          .schedule-btn:hover:not(:disabled) {
            background: #2980b9;
          }

          .schedule-btn:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
          }

          .classes-list {
            margin-top: 40px;
          }

          .classes-grid {
            display: grid;
            gap: 15px;
          }

          .class-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 15px;
          }

          .class-date {
            background: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
            color: #2c3e50;
          }

          .class-info p {
            margin: 5px 0;
            color: #444;
          }

          .no-classes {
            text-align: center;
            color: #777;
            padding: 20px;
          }
        `}</style>
      </div>
    );
  }
}

export default ClassScheduler;