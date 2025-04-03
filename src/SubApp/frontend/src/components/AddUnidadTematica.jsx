import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBook, FaArrowLeft } from 'react-icons/fa'; 
import './css/AddAsignatura.css'; // Import the CSS file
import './css/ToastifyCustom.css'; 

const AddUnidadTematica = () => {
    const { id_malla, cod_facultad, cod_carrera } = useParams();
    const [nombre_unidad, setNombreUnidad] = useState('');
    const [estado] = useState(1); // Set default value to 1
    const [unidades, setUnidades] = useState([]); // State to store unidades temáticas
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/unidad_tematica');
                console.log('Unidades obtenidas:', response.data); // Verificar los datos obtenidos
                setUnidades(response.data);
            } catch (error) {
                console.error('Error al obtener las unidades temáticas:', error);
            }
        };
        fetchUnidades();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre_unidad) {
            toast.error('El campo "Nombre de la Unidad" es obligatorio');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/unidad_tematica', {
                id_malla,
                nombre_unidad,
                estado,
                cod_facultad,
                cod_carrera
            });
            toast.success('Unidad Temática añadida exitosamente');
            const id_unidad = response.data.id_unidad;
            // Wait for the toast to be displayed before navigating
            setTimeout(() => {
                navigate(`/temario/${id_unidad}/${cod_facultad}/${cod_carrera}`);
            }, 2000); // Adjust the delay as needed
        } catch (error) {
            toast.error('Error al añadir la unidad temática');
            console.error('Error al añadir la unidad temática:', error);
        }
    };

    const handleBack = () => {
        navigate(`/malla_curricular/${cod_facultad}/${cod_carrera}`);
    };

    return (
        <div className="container"> {/* Apply the container class */}
            <ToastContainer />
            <h3><FaBook size={20} /> Unidad Temática</h3> {/* Adjusted title and icon size */}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label className="form-label">Nombre de la Unidad:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={nombre_unidad}
                        onChange={(e) => setNombreUnidad(e.target.value.toUpperCase())}
                        required
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Seleccionar Unidad:</label>
                    <select className="form-input select-large">
                        {unidades.map((unidad) => (
                            <option key={unidad.id_unidad} value={unidad.id_unidad}>
                                {unidad.nombre_unidad} - {unidad.nom_carrera} - {unidad.nom_facultad}
                            </option>
                        ))}
                    </select>
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

export default AddUnidadTematica;
