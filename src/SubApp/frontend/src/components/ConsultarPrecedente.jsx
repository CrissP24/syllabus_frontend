import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import './css/ConsultarPrecedente.css';

const ConsultarPrecedente = () => {
    const { cod_facultad, cod_carrera } = useParams();
    const navigate = useNavigate();
    const [mallaPrecedente, setMallaPrecedente] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMallaPrecedente = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/malla-precedente/${cod_carrera}`);
                setMallaPrecedente(response.data);
            } catch (err) {
                setError('Error al obtener las asignaturas precedentes');
            } finally {
                setLoading(false);
            }
        };

        fetchMallaPrecedente();
    }, [cod_carrera]);

    const handleDelete = async (nombre_materia_prece) => {
        try {
            await axios.delete('http://localhost:5000/api/malla-precedenteee', {
                data: { nombre_materia_prece },
            });
            toast.success('Materia eliminada exitosamente');
            setMallaPrecedente(mallaPrecedente.filter(materia => materia.nombre_materia_prece !== nombre_materia_prece));
        } catch (err) {
            toast.error('Error al eliminar la materia');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="cp-loading">Cargando...</div>;
    }

    if (error) {
        return <div className="cp-error-message">{error}</div>;
    }

    return (
        <div className="cp-materias-container">
            <ToastContainer />
            <header className="cp-header">
                <button onClick={handleBack} className="cp-back-button">
                    <FaArrowLeft /> Volver
                </button>
                <h2 className="cp-title">Asignaturas Precedente</h2>
            </header>
            <div className="cp-materias-grid">
                {mallaPrecedente.map((materia) => (
                    <div key={materia.nombre_materia_prece} className="cp-materia-card">
                        <p><strong>Nombre Materia:</strong> {materia.nombre_materia_prece}</p>
                        <p><strong>Horas:</strong> {materia.horas}</p>
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

export default ConsultarPrecedente;