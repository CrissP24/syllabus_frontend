import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBook, FaArrowLeft } from 'react-icons/fa'; // Import the icon
import './css/AddAsignatura.css'; // Import the CSS file
import './css/ToastifyCustom.css'; 

const AddTemario = () => {
    const { id_unidad, cod_facultad, cod_carrera } = useParams();
    const [nombre_temario, setNombreTemario] = useState('');
    const [estado] = useState(1); // Set default value to 1
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre_temario) {
            toast.error('El campo "Nombre del Temario" es obligatorio');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/temario', {
                id_unidad,
                nombre_temario,
                cod_carrera,
                cod_facultad,
                estado
            });
            toast.success('Temario añadido exitosamente');
            const id_temario = response.data.id_temario;
            // Wait for the toast to be displayed before navigating
            setTimeout(() => {
                navigate(`/nivel/${id_temario}/${cod_facultad}/${cod_carrera}`);
            }, 2000); // Adjust the delay as needed
        } catch (error) {
            toast.error('Error al añadir el temario');
            console.error('Error al añadir el temario:', error);
        }
    };

    const handleBack = () => {
        navigate(`/unidad_tematica/${cod_facultad}/${cod_carrera}`);
    };

    return (
        <div className="container"> {/* Apply the container class */}
            <ToastContainer />
            <h3><FaBook size={20} /> Temario</h3> {/* Add the icon to the h3 element */}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label className="form-label">Nombre del Temario:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={nombre_temario}
                        onChange={(e) => setNombreTemario(e.target.value.toUpperCase())}
                        required
                    />
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

export default AddTemario;