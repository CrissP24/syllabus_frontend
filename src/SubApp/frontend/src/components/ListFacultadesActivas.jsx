import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/ListFacultadesActivas.css'; 
import './css/ToastifyCustom.css'; 
import { FaUniversity } from 'react-icons/fa'; // Importing an icon for the items

const ListFacultadesActivas = () => {
    const [facultades, setFacultades] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFacultades = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/facultades/activas');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setFacultades(data);
            } catch (err) {
                setError('Error fetching facultades');
            }
        };

        fetchFacultades();
    }, []);

    return (
        <div className="facultades-container">
            <h2 className="facultades-heading">Facultades</h2>
            {error && <p className="error">{error}</p>}
            <ul className="facultades-list">
                {facultades.map((facultad, index) => (
                    <li key={index} className="facultades-item">
                        <div className="facultades-item-container">
                            <div className="facultades-info">
                                <FaUniversity className="facultades-icon" />
                                <span>{facultad.nom_facultad}</span>
                            </div>
                            <Link to={`/carreras/${facultad.cod_facultad}`} className="facultades-link">Ver Carreras</Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListFacultadesActivas;