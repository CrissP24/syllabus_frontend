// Sidebar.js
import React from "react";
import { Nav } from "react-bootstrap";
import { UserCog, ClipboardList, FileSpreadsheet, Users, Database } from "lucide-react";

const Sidebar = ({ setActiveSection }) => {
  return (
    <Nav className="flex-column p-3">
      <Nav.Link onClick={() => setActiveSection("home")} className="d-flex align-items-center">
        <Users size={20} className="me-2" /> Home
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("usermanagement")} className="d-flex align-items-center">
        <UserCog size={20} className="me-2" /> Gestión de Usuarios
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("actividades")} className="d-flex align-items-center">
        <ClipboardList size={20} className="me-2" /> Gestión de Actividades
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("distrifunc")} className="d-flex align-items-center">
        <ClipboardList size={20} className="me-2" /> Distribución de Funciones
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("docente")} className="d-flex align-items-center">
        <Users size={20} className="me-2" /> Gestión de Periodos
      </Nav.Link>
      
      <Nav.Link onClick={() => setActiveSection("datatable")} className="d-flex align-items-center">
        <FileSpreadsheet size={20} className="me-2" /> Cargar y editar Syllabus
      </Nav.Link>
      
      <Nav.Link onClick={() => setActiveSection("malla")} className="d-flex align-items-center">
        <Users size={20} className="me-2" /> Gestión de malla curricular
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("syllabus")} className="d-flex align-items-center">
        <Database size={20} className="me-2" /> Gestión de Syllabus
      </Nav.Link>
      <Nav.Link onClick={() => setActiveSection("docenpri")} className="d-flex align-items-center">
        <Users size={20} className="me-2" /> Docentes Principales
      </Nav.Link>
    </Nav>
  );
};

export default Sidebar;