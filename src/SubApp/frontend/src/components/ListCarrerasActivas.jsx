import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './css/ListCarrerasActivas.css'; 
import './css/ToastifyCustom.css'; 
import { FaPlus, FaGraduationCap } from 'react-icons/fa'; // Importing icons for the button and heading

const ListCarrerasActivas = () => {
    const { cod_facultad } = useParams();
    const [carreras, setCarreras] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/carreras/${cod_facultad}`);
                setCarreras(response.data);
            } catch (error) {
                setError('Error al obtener las carreras activas');
                console.error('Error al obtener las carreras activas:', error);
            }
        };

        fetchCarreras();
    }, [cod_facultad]);

    return (
        <div>
            <h2 className="carreras-heading">
                <FaGraduationCap className="carreras-heading-icon" /> Carreras
            </h2>
            {error && <p className="error">{error}</p>}
            <ul className="carreras-list">
                {carreras.map((carrera) => (
                    <li key={carrera.cod_carrera} className="carreras-item">
                        <div className="carreras-item-container">
                            <div className="carreras-info">
                                <span>{carrera.nom_carrera}</span>
                            </div>
                            <Link to={`/malla_curricular/${cod_facultad}/${carrera.cod_carrera}`} className="carreras-link">
                                <FaPlus className="carreras-link-icon" /> Añadir Malla 
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListCarrerasActivas;