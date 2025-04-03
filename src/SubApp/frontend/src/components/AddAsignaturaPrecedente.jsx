import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/AddAsignaturaPrecente.css'; 
import './css/ToastifyCustom.css'; 
import { FaBook, FaArrowLeft, FaPlus, FaEdit, FaArrowRight, FaPlusSquare, FaTools } from 'react-icons/fa';

const AddAsignaturaPrecedente = () => {
    const { id_asignatura, cod_facultad, cod_carrera } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { nombre_asignatura } = location.state || {};
    const [id_asignatura_precedente, setIdAsignaturaPrecedente] = useState(id_asignatura);
    const [nombre_asignatura_prece, setNombreAsignaturaPrece] = useState('');
    const [horas, setHoras] = useState('');
    const [addedDetails, setAddedDetails] = useState([]);

    const fetchAddedDetails = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/asignatura_precedente/${id_asignatura_precedente}`);
            setAddedDetails(response.data);
        } catch (error) {
            console.error('Error al obtener las asignaturas precedentes:', error);
        }
    }, [id_asignatura_precedente]);

    useEffect(() => {
        setIdAsignaturaPrecedente(id_asignatura);
        fetchAddedDetails();
    }, [id_asignatura, fetchAddedDetails]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id_asignatura_precedente || !nombre_asignatura_prece || !horas || /^\d+$/.test(nombre_asignatura_prece)) {
            toast.error('Todos los campos son obligatorios y el nombre de la asignatura no puede ser solo números');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/asignatura_precedente', {
                id_asignatura,
                id_asignatura_precedente,
                nombre_asignatura_prece,
                horas,
                cod_carrera,
                cod_facultad
            });
            toast.success('Asignatura Precedente añadida exitosamente');
            setAddedDetails(prevDetails => [
                ...prevDetails, 
                {
                    id: response.data.id_asignatura_precedente,
                    id_asignatura_precedente,
                    nombre_asignatura_prece,
                    horas
                }
            ]);
            setNombreAsignaturaPrece('');
            setHoras('');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(`Error: ${error.response.data.error}`);
            } else if (error.response && error.response.data && error.response.data.details) {
                toast.error(`Error: ${error.response.data.details}`);
            } else {
                toast.error('Error al añadir la materia precedente');
            }
            console.error('Error al añadir la materia precedente:', error);
        }
    };

    const handleBack = () => {
        navigate('/facultades-activas');
    };

    const handleNavigateToPrecedenteDePrecedente = (id) => {
        navigate(`/asignatura_precedente_de_precedente/${id}/${cod_facultad}/${cod_carrera}`);
    };

    const handleNavigateToAddcurricular= () => {
        navigate(`/addcurricular/${id_asignatura_precedente}`);
    };

    const handleNavigateToModifyPrecedente = () => {
        navigate(`/asignatura_precedente_relacion`);
    };

    return (    
        <>
            <ToastContainer />
            <div className="container">
                <h2><FaBook /> Añadir Asignatura Precedente</h2>
                {nombre_asignatura && <h5>Asignatura inicial: {nombre_asignatura}</h5>}
                <div className="flex-container">
                    <div className="form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label className="form-label">ID Precedente:</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={id_asignatura_precedente}
                                    readOnly
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Asignatura presiguiente:</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={nombre_asignatura_prece}
                                    onChange={(e) => setNombreAsignaturaPrece(e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Horas:</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    value={horas}
                                    onChange={(e) => setHoras(e.target.value)}
                                />
                            </div>
                            <div className="small-button-group">
                                <button type="submit" data-tooltip="Añadir asignatura"><FaPlus /></button>
                                <button type="button" data-tooltip="Añadir asignatura Precedente" onClick={() => handleNavigateToPrecedenteDePrecedente(id_asignatura_precedente)}>
                                    <FaPlusSquare />
                                </button>
                                <button type="button" data-tooltip="Modificar" onClick={handleNavigateToAddcurricular}>
                                    <FaTools />
                                </button>
                                <button type="button" data-tooltip="Modificar Precedente" onClick={handleNavigateToModifyPrecedente}>
                                    <FaEdit />
                                </button>
                            </div>
                            <div className="small-button-group">
                                <button type="button" data-tooltip="Regresar" onClick={handleBack}>
                                    <FaArrowLeft /> Regresar
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="details-container">
                        {addedDetails.map(detail => (
                            <div key={detail.id} className="added-details">
                                <p><strong>Asignatura presiguiente:</strong> {detail.nombre_asignatura_prece}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddAsignaturaPrecedente;