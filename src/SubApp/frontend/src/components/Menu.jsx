import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './css/Menu.css';
import { FaHome, FaCaretDown, FaPlus, FaBook, FaBookOpen, FaGraduationCap } from 'react-icons/fa';

const DropdownMenu = ({ icon, label, items }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    return (
        <li className="dropdown">
            <button 
                onClick={toggleDropdown} 
                className="dropdown-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="menu-list"
            >
                <span className="menu-icon">{icon}</span>
                <span className="menu-label">{label}</span>
                <FaCaretDown className={`caret-icon ${isOpen ? 'open' : ''}`} />
            </button>
            {isOpen && (
                <ul className="dropdown-menu" id="menu-list" role="menu">
                    {items.map((item, index) => (
                        <li key={index} className="dropdown-item" role="menuitem">
                            <Link to={item.path} className="menu-link" onClick={closeDropdown}>
                                <span className="menu-item-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

const Menu = () => {
    const { cod_carrera } = useParams();

    return (
        <nav className="menu-container" role="navigation">
            <ul className="menu">
                <li className="menu-item">
                    <Link to="/" className="menu-link">
                        <FaHome className="menu-icon" /> INICIO
                    </Link>
                </li>
                <DropdownMenu 
                    icon={<FaPlus className="menu-icon" />}
                    label="AÑADIR MALLA"
                    items={[
                        { path: '/facultades-activas', label: 'Añadir', icon: <FaPlus className="menu-item-icon" /> },
                    ]}
                />
                <DropdownMenu 
                    icon={<FaBook className="menu-icon" />}
                    label="CONSULTAS"
                    items={[
                        { path: '/unidad_tematica', label: 'Unidades temáticas', icon: <FaBook className="menu-item-icon" /> },
                        { path: '/unidad_tematica/temario', label: 'Temarios', icon: <FaBookOpen className="menu-item-icon" /> },
                        { path: '/niveles', label: 'Niveles por temarios', icon: <FaGraduationCap className="menu-item-icon" /> },
                        { path: '/asignaturas/niveles', label: 'Asignaturas por niveles', icon: <FaGraduationCap className="menu-item-icon" /> },
                        { path: '/asignaturas-con-precedentes', label: 'Asignaturas presiguientes', icon: <FaGraduationCap className="menu-item-icon" /> },
                        { path: '/estructura-completa', label: 'Estructura', icon: <FaGraduationCap className="menu-item-icon" /> },
                        { path: `/niveles-materias/${cod_carrera}`, label: 'Niveles y Materias', icon: <FaGraduationCap className="menu-item-icon" /> }, // Nueva ruta
                    ]}
                />
            </ul>
        </nav>
    );
};

export default Menu;