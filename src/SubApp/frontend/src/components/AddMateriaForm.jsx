import React from 'react';
import { Link, useParams, Route, Routes } from 'react-router-dom';
import { FaPlus, FaSearch, FaList, FaListAlt } from 'react-icons/fa';
import './css/Sidebar.css';
import AddMat from './AddMat';
import ConsultarMaterias from './ConsultarMaterias';
import ConsultarPrecedente from './ConsultarPrecedente';
import ConsultarPrecedentePrecedente from './ConsultarPrecedentePrecedente';

const AddMateriaForm = () => {
    const { cod_facultad, cod_carrera } = useParams();

    return (
        <div className="main-container">
            <div className="sidebar">
                <h2>--</h2>
                <ul>
                    <li>
                        <Link to={`/AddMat/${cod_facultad}/${cod_carrera}`}>
                            <FaPlus className="icon" />
                            <span className="link-text">Añadir Asignatura</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={`/consultar-materias/${cod_facultad}/${cod_carrera}`}>
                            <FaSearch className="icon" />
                            <span className="link-text">Consultar Asignatura</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={`/consultar-precedente/${cod_facultad}/${cod_carrera}`}>
                            <FaList className="icon" />
                            <span className="link-text">Consultar Precedente</span>
                        </Link>
                    </li>
                    <li>
                        <Link to={`/consultar-precedente-precedente/${cod_facultad}/${cod_carrera}`}>
                            <FaListAlt className="icon" />
                            <span className="link-text">Consultar Precedente de Precedente</span>
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="content">
                <Routes>
                    <Route path="/AddMat/:cod_facultad/:cod_carrera" element={<AddMat />} />
                    <Route path="/consultar-materias/:cod_facultad/:cod_carrera" element={<ConsultarMaterias />} />
                    <Route path="/consultar-precedente/:cod_facultad/:cod_carrera" element={<ConsultarPrecedente />} />
                    <Route path="/consultar-precedente-precedente/:cod_facultad/:cod_carrera" element={<ConsultarPrecedentePrecedente />} />
                </Routes>
            </div>
        </div>
    );
};

export default AddMateriaForm;