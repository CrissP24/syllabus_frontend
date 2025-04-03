import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/Addcurricular.css';

const Asignaturas = () => {
    const [asignaturas, setAsignaturas] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentAsignatura, setCurrentAsignatura] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState('');

    const getAllAsignaturas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/asignaturas');
            setAsignaturas(response.data);
        } catch (error) {
            console.error('Error al obtener las asignaturas:', error);
        }
    };

    const updateAsignatura = async () => {
        try {
            await axios.put('http://localhost:5000/api/asignatura', {
                nombre_asignatura: currentAsignatura.nombre_asignatura,
                nuevo_nombre: nuevoNombre
            });
            getAllAsignaturas(); // Refresh the list
            closeModal();
            toast.success('Asignatura modificada exitosamente');
        } catch (error) {
            console.error('Error al modificar la asignatura:', error);
            toast.error('Error al modificar la asignatura');
        }
    };

    const deleteAsignatura = async (nombre_asignatura) => {
        try {
            await axios.delete(`http://localhost:5000/api/asignatura/${nombre_asignatura}`);
            getAllAsignaturas(); // Refresh the list
            toast.success('Asignatura eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar la asignatura ,tienes una relacion:', error);
            toast.error('Error al eliminar la asignatura ,tienes una relacion');
        }
    };

    useEffect(() => {
        getAllAsignaturas();
    }, []);

    const openModal = (asignatura) => {
        setCurrentAsignatura(asignatura);
        setNuevoNombre(asignatura.nombre_asignatura);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setCurrentAsignatura(null);
        setNuevoNombre('');
    };

    return (
        <div className="container">
            <div className="header">
                <h1><FaBook className="icon" /> Asignaturas</h1>
                <button className="consultar-button" onClick={getAllAsignaturas}>Consultar</button>
            </div>

            <div className="asignaturas-container">
                {asignaturas.map((asignatura) => (
                    <div className="asignatura-card" key={asignatura.id_asignatura}>
                        <span className="asignatura-nombre">{asignatura.nombre_asignatura}</span>
                        <div className="asignatura-actions">
                            <button className="edit-button" onClick={() => openModal(asignatura)}><FaEdit /></button>
                            <button className="delete-button" onClick={() => deleteAsignatura(asignatura.nombre_asignatura)}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Modificar Asignatura"
                className="modal"
                overlayClassName="overlay"
            >
                <h2>Modificar Asignatura</h2>
                <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="modal-input"
                />
                <div className="modal-actions">
                    <button className="modal-button" onClick={updateAsignatura}>Guardar</button>
                    <button className="modal-button" onClick={closeModal}>Cancelar</button>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default Asignaturas;