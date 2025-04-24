import React from "react";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaUsersCog,
  FaCalendarAlt,
  FaBook,
  FaGraduationCap,
  FaChalkboardTeacher,
} from "react-icons/fa";
import "./Sidebar.css"; // Asegúrate de tener este archivo o usa estilos inline

const menuItems = [
  { icon: <FaUsersCog />, label: "Inicio", key: "home", color: "light" }, 
  { icon: <FaTasks />, label: "Gestión de Actividades", key: "actividades", color: "primary" },
  { icon: <FaUsersCog />, label: "Distribución de Funciones", key: "distrifunc", color: "success" },
  { icon: <FaCalendarAlt />, label: "Gestión de Periodo", key: "docente", color: "warning" },
  { icon: <FaBook />, label: "Programa Analítico", key: "datatable", color: "secondary" },
  { icon: <FaBook />, label: "Gestión de Syllabus", key: "syllabus", color: "secondary" },
  { icon: <FaGraduationCap />, label: "Malla Curricular", key: "malla", color: "info" },
  { icon: <FaChalkboardTeacher />, label: "Docentes Principales", key: "docenpri", color: "dark" },
  // Nueva sección "Inicio"
];

const Sidebar = ({ setActiveSection }) => {
  return (
    <motion.div
      className="sidebar-buttons"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80 }}
    >
      {menuItems.map((item, index) => (
        <motion.button
          key={index}
          className={`btn btn-${item.color} w-100 mb-3 d-flex align-items-center justify-content-start sidebar-btn`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection(item.key)}
        >
          <span className="me-3 fs-5">{item.icon}</span>
          <span className="sidebar-label">{item.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Sidebar;
