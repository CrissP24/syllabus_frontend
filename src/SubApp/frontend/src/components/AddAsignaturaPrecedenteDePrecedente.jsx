import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/AddAsignaturaPrecente.css'; 
import './css/ToastifyCustom.css'; 
import { FaBook, FaArrowLeft } from 'react-icons/fa';

const AddAsignaturaPrecedenteDePrecedente = () => {
    const { cod_facultad, cod_carrera, id_asignatura_precedente } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id_asignatura_precedente: id_asignatura_precedente || '',
        id_asignatura_precedente_nueva: id_asignatura_precedente || '',
        nombre_asignatura_prece: '',
        horas: '',
        cod_carrera: cod_carrera || '',
        cod_facultad: cod_facultad || '',
        codigo_asignatura_precedente_nueva: ''
    });

    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            id_asignatura_precedente: id_asignatura_precedente || '',
            id_asignatura_precedente_nueva: id_asignatura_precedente || '',
            cod_carrera: cod_carrera || '',
            cod_facultad: cod_facultad || ''
        }));
    }, [id_asignatura_precedente, cod_carrera, cod_facultad]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.id_asignatura_precedente_nueva || !formData.nombre_asignatura_prece || !formData.horas || !formData.codigo_asignatura_precedente_nueva) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/asignatura_precedente_de_precedente', formData);
            toast.success('Asignatura Precedente de Precedente añadida exitosamente');
            setFormData({
                id_asignatura_precedente: id_asignatura_precedente || '',
                id_asignatura_precedente_nueva: id_asignatura_precedente || '',
                nombre_asignatura_prece: '',
                horas: '',
                cod_carrera: cod_carrera || '',
                cod_facultad: cod_facultad || '',
                codigo_asignatura_precedente_nueva: ''
            });

            navigate(-1);

        } catch (error) {
            toast.error('Error al añadir la asignatura precedente de precedente');
            console.error('Error al añadir la asignatura precedente de precedente:', error);
        }
    };

    const handleBack = () => {
        navigate('/facultades-activas');
    };

    return (
        <>
            <ToastContainer />
            <div className="container">
                <h2><FaBook /> Añadir Asignatura Precedente de Precedente</h2>
                {formData.id_asignatura_precedente && <h5>ID Asignatura Precedente: {formData.id_asignatura_precedente}</h5>}
                <div className="flex-container">
                    <div className="form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label className="form-label">ID Asignatura Precedente:</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="id_asignatura_precedente_nueva"
                                    value={formData.id_asignatura_precedente_nueva}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Nombre Asignatura Precedente:</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="nombre_asignatura_prece"
                                    value={formData.nombre_asignatura_prece}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Horas:</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    name="horas"
                                    value={formData.horas}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <input
                                type="hidden"
                                name="cod_carrera"
                                value={formData.cod_carrera}
                            />
                            <input
                                type="hidden"
                                name="cod_facultad"
                                value={formData.cod_facultad}
                            />
                            <div className="form-row">
                                <label className="form-label">Código Asignatura Precedente Nueva:</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="codigo_asignatura_precedente_nueva"
                                    value={formData.codigo_asignatura_precedente_nueva}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="button-group">
                                <button type="submit">Añadir</button>
                            </div>
                            <button type="button" onClick={handleBack}>
                                <FaArrowLeft /> Regresar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddAsignaturaPrecedenteDePrecedente;