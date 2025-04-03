import React, { useState } from 'react';
import axios from 'axios';
import './css/ToastifyCustom.css'; 

const AddProyectoIntegrador = () => {
    const [idNivel, setIdNivel] = useState('');
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/proyecto_integrador/:id_nivel', {
                id_nivel: idNivel,
                nombre_proyecto: nombreProyecto
            });
            setMessage(`Proyecto añadido: ${response.data.nombre_proyecto}`);
        } catch (error) {
            setMessage(`Error: ${error.response.data.error}`);
        }
    };

    return (
        <div>
            <h2>Añadir Proyecto Integrador</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID Nivel:</label>
                    <input
                        type="text"
                        value={idNivel}
                        onChange={(e) => setIdNivel(e.target.value)}
                    />
                </div>
                <div>
                    <label>Nombre del Proyecto:</label>
                    <input
                        type="text"
                        value={nombreProyecto}
                        onChange={(e) => setNombreProyecto(e.target.value)}
                    />
                </div>
                <button type="submit">Añadir Proyecto</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddProyectoIntegrador;