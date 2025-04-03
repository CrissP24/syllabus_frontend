import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/ConsultarMaterias.css';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConsultarMaterias = () => {
    const { cod_facultad, cod_carrera } = useParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/materias/${cod_facultad}/${cod_carrera}`);
                const data = await response.json();
                if (response.ok) {
                    setSubjects(data);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Error al consultar las materias');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [cod_facultad, cod_carrera]);

    const handleDelete = async (codigo_materia) => {
        try {
            const response = await fetch(`http://localhost:5000/api/materias/${codigo_materia}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Materia eliminada exitosamente');
                setSubjects(subjects.filter(subject => subject.codigo_materia !== codigo_materia));
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (err) {
            toast.error('Error al eliminar la materia');
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="subjects-container">
            <ToastContainer />
            <h2>Asignaturas</h2>
            <div className="subjects-list">
                {subjects.map((subject) => (
                    <div key={subject.id_materia} className="subject-card">
                        <p><strong>ID Nivel:</strong> {subject.id_nivel}</p>
                        <p><strong>Código Carrera:</strong> {subject.cod_carrera}</p>
                        <p><strong>Código Facultad:</strong> {subject.cod_facultad}</p>
                        <p><strong>Nombre Materia:</strong> {subject.nombre_materia}</p>
                        <p><strong>Créditos:</strong> {subject.creditos}</p>
                        <p><strong>Horas:</strong> {subject.horas}</p>
                        <div className="subject-actions">
                            <button onClick={() => handleDelete(subject.codigo_materia)} className="cp-delete-button">
                                <FaTrash /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" className="back-button" onClick={handleBack}>
                <FaArrowLeft /> Regresar
            </button>
        </div>
    );
};

export default ConsultarMaterias;