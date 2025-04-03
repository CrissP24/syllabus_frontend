import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaPlusSquare, FaEdit } from 'react-icons/fa';
import './css/AddAsignatura.css'; 

const AddAsignatura = () => {
    const { id_nivel, cod_facultad, cod_carrera } = useParams();
    const [codigo_unico, setCodigoUnico] = useState('');
    const [nombre_asignatura, setNombreAsignatura] = useState('');
    const [horas, setHoras] = useState('');
    const [id_asignatura, setIdAsignatura] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!codigo_unico || !nombre_asignatura || !horas) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/asignatura', {
                codigo_unico,
                id_nivel,
                nombre_asignatura,
                estado: 1,
                horas,
                cod_carrera,
                cod_facultad
            });

            const { id_asignatura } = response.data; // Suponiendo que el id_asignatura se retorna en la respuesta
            setIdAsignatura(id_asignatura);

            toast.success('Asignatura añadida exitosamente');
        } catch (error) {
            toast.error('Error al añadir la asignatura');
            console.error('Error al añadir la asignatura:', error);
        }
    };

    const handleNavigate = () => {
        if (id_asignatura) {
            navigate(`/asignatura_precedente/${id_asignatura}/${cod_facultad}/${cod_carrera}`, {
                state: { nombre_asignatura }
            });
        } else {
            toast.error('Primero añada una asignatura');
        }
    };

    const handleUpdate = () => {
        navigate('/asignaturas');
    };

    return (
        <div className="container">
            <ToastContainer />
            <h2>Añadir Asignatura</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label className="form-label">Código Único:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={codigo_unico}
                        onChange={(e) => setCodigoUnico(e.target.value)}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Nombre:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={nombre_asignatura}
                        onChange={(e) => setNombreAsignatura(e.target.value)}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Horas:</label>
                    <input
                        className="form-input"
                        type="number"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
                <div className="button-group">
                    <button type="submit" data-tooltip="Añadir"><FaPlus /></button>
                    <button type="button" data-tooltip="Añadir Precedente" onClick={handleNavigate}><FaPlusSquare /></button>
                    <button type="button" data-tooltip="Modificar" onClick={handleUpdate}><FaEdit /></button>
                </div>
            </form>
        </div>
    );
};

export default AddAsignatura;