import React from "react";
import { Button } from "react-bootstrap";
import { FaTasks, FaUsersCog, FaCalendarAlt, FaBook, FaGraduationCap } from "react-icons/fa";
import Malla from "./Malla.component";
import GestionSyllabus from "./gestionsyllabus.component";

const Sidebar = ({ setActiveSection, activeSection }) => (
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
      Programa analitico de la asignatura
    </Button>
    <Button variant="secondary" className="w-100 mb-2" onClick={() => setActiveSection("GestionSyllabus")}>
      <FaBook className="me-2" />
      Gestión de syllabus
    </Button>
    {activeSection === "gestionsyllabus" && <GestionSyllabus />}

    <Button variant="info" className="w-100 mb-2" onClick={() => setActiveSection("malla")}>
      <FaGraduationCap className="me-2" />
      Malla
    </Button>
    {activeSection === "malla" && <Malla />}

  </div>
);

export default Sidebar; 