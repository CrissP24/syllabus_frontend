import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ user }) => {
  // Definición de los enlaces según los roles
  const roleLinks = {
    ROLE_ADMIN: [
      { path: "/admin", label: "Administrador" },
      { path: "/user", label: "Usuario" },
    ],
    ROLE_DOCENTE: [
      { path: "/docente", label: "Docente" },
    ],
    ROLE_ESTUDIANTE: [
      { path: "/estudiante", label: "Estudiante" },
    ],
    ROLE_MODERATOR: [
      { path: "/mod", label: "Moderador" },
    ],
    ROLE_OPERADOR_SISTEMA: [
      { path: "/operador_sistema", label: "Operador" },
    ],
    ROLE_COORDINADOR: [
      { path: "/coordinador", label: "Coordinador" },
    ],
    ROLE_SECRETARIA: [
      { path: "/secretaria", label: "Secretaria" },
    ],
    ROLE_DECANO: [
      { path: "/decano", label: "Decano" },
    ],
    ROLE_COMISION_SILABOS: [
      { path: "/comision_silabos", label: "Comisión de Sílabos" },
    ],
  };

  // Generar los enlaces correspondientes al rol del usuario
  const userLinks = user
    ? user.roles.flatMap((role) => roleLinks[role] || [])
    : [];

  return (
    <nav className="bg-light sidebar p-3">
      <h5 className="mb-3">Menú</h5>
      <ul className="nav flex-column">
        {userLinks.map((link, index) => (
          <li key={index} className="nav-item">
            <Link to={link.path} className="nav-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
