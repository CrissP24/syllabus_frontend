import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLayerGroup, FaArrowLeft } from 'react-icons/fa'; // Import the icons
import './css/AddAsignatura.css'; // Import the CSS file
import './css/ToastifyCustom.css'; 

const AddNivel = () => {
    const { id_temario, cod_facultad, cod_carrera } = useParams();
    const [nombre_nivel, setNombreNivel] = useState('');
    const [estado] = useState(1); // Set default value to 1
    const navigate = useNavigate();

    const nivelesValidos = [
        'I nivel', 'II nivel', 'III nivel', 'IV nivel', 'V nivel',
        'VI nivel', 'VII nivel', 'IX nivel', 'X nivel'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nivelesValidos.includes(nombre_nivel)) {
            toast.error('El nombre del nivel no es válido');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/nivel', {
                id_temario,
                nombre_nivel,
                estado,
                cod_carrera,
                cod_facultad
            });
            toast.success('Nivel añadido exitosamente');
            const id_nivel = response.data.id_nivel;
            // Wait for the toast to be displayed before navigating
            setTimeout(() => {
                navigate(`/asignatura/${id_nivel}/${cod_facultad}/${cod_carrera}`);
            }, 2000); // Adjust the delay as needed
        } catch (error) {
            toast.error('Error al añadir el nivel');
            console.error('Error al añadir el nivel:', error);
        }
    };

    const handleBack = () => {
        navigate(`/temario/${id_temario}/${cod_facultad}/${cod_carrera}`);
    };

    return (
        <div className="container"> {/* Apply the container class */}
            <ToastContainer />
            <h3><FaLayerGroup size={20} /> Nivel</h3> {/* Add the icon to the h3 element */}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label className="form-label">Nivel perteneciente:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={nombre_nivel}
                        onChange={(e) => setNombreNivel(e.target.value)}
                    />
                    <small className="form-text" style={{ fontSize: '0.6em', color: '#6c757d' }}>
                        Ejemplos válidos: I nivel, II nivel, III nivel, IV nivel, V nivel, VI nivel, VII nivel, IX nivel, X nivel
                    </small>
                </div>
                {/* Hidden input for estado */}
                <input
                    type="hidden"
                    value={estado}
                />
                <div className="button-group">
                    <button type="submit">Añadir</button>
                    <button type="button" onClick={handleBack}>
                        <FaArrowLeft /> Regresar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNivel;