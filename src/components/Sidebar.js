import React from "react";
import { Button } from "react-bootstrap";
import {
  FaTasks,
  FaUsersCog,
  FaCalendarAlt,
  FaBook,
  FaGraduationCap,
  FaChalkboardTeacher, // Ícono para docentes principales
} from "react-icons/fa";

const Sidebar = ({ setActiveSection }) => (
  <div className="sidebar-buttons">
    <Button variant="primary" className="w-100 mb-2" onClick={() => setActiveSection("actividades")}>
      <FaTasks className="me-2" />
      Gestión de Actividades
    </Button>

    <Button variant="success" className="w-100 mb-2" onClick={() => setActiveSection("distrifunc")}>
      <FaUsersCog className="me-2" />
      Distribución de Funciones
    </Button>

    <Button variant="warning" className="w-100 mb-2" onClick={() => setActiveSection("docente")}>
      <FaCalendarAlt className="me-2" />
      Gestión de Periodo
    </Button>

    <Button variant="secondary" className="w-100 mb-2" onClick={() => setActiveSection("datatable")}>
      <FaBook className="me-2" />
      Programa Analítico
    </Button>

    <Button variant="secondary" className="w-100 mb-2" onClick={() => setActiveSection("syllabus")}>
      <FaBook className="me-2" />
      Gestión de Syllabus
    </Button>

    <Button variant="info" className="w-100 mb-2" onClick={() => setActiveSection("malla")}>
      <FaGraduationCap className="me-2" />
      Malla Curricular
    </Button>

    <Button variant="dark" className="w-100 mb-2" onClick={() => setActiveSection("docenpri")}>
      <FaChalkboardTeacher className="me-2" />
      Docentes Principales
    </Button>
  </div>
);

export default Sidebar;
