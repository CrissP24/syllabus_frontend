import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/ConsultarPrecedentePrecedente.css';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const ConsultarPrecedentePrecedente = () => {
    const { cod_carrera } = useParams();
    const navigate = useNavigate();
    const [mallaPrecedentePrecedente, setMallaPrecedentePrecedente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMallaPrecedentePrecedente = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/malla-precedente-precedente/${cod_carrera}`);
                setMallaPrecedentePrecedente(response.data);
            } catch (err) {
                setError('Error al obtener las asignaturas precedentes');
            } finally {
                setLoading(false);
            }
        };

        fetchMallaPrecedentePrecedente();
    }, [cod_carrera]);

    const handleDelete = async (nombre_materia_prece) => {
        try {
            await axios.delete('http://localhost:5000/api/malla-precedente-precedente', {
                data: { nombre_materia_prece }
            });
            toast.success('Materia eliminada exitosamente');
            setMallaPrecedentePrecedente(mallaPrecedentePrecedente.filter(materia => materia.nombre_materia_prece !== nombre_materia_prece));
        } catch (err) {
            toast.error('Error al eliminar la materia');
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    if (loading) {
        return <div className="cp-loading">Cargando...</div>;
    }

    if (error) {
        return <div className="cp-error-message">Error: {error}</div>;
    }

    return (
        <div className="cp-materias-container">
            <ToastContainer />
            <div className="cp-header">
                <button type="button" className="cp-back-button" onClick={handleBack}>
                    <FaArrowLeft /> Regresar
                </button>
                <h2 className="cp-title">Malla Precedente Precedente</h2>
            </div>
            <div className="cp-materias-grid">
                {mallaPrecedentePrecedente.map((materia) => (
                    <div key={materia.nombre_materia_prece} className="cp-materia-card">
                        <p><strong>Nombre Materia:</strong> {materia.nombre_materia_prece}</p>
                        <p><strong>Horas:</strong> {materia.horas}</p>
                        <p><strong>Código Carrera:</strong> {materia.cod_carrera}</p>
                        <p><strong>Código Facultad:</strong> {materia.cod_facultad}</p>
                        <div className="cp-materia-actions">
                            <button onClick={() => handleDelete(materia.nombre_materia_prece)} className="cp-delete-button">
                                <FaTrash /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsultarPrecedentePrecedente;