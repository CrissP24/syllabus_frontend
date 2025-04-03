import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/Addcurricular.css';
import { useParams } from 'react-router-dom';

const AddAsignaturaPrecedenteRelacion = () => {
    const { id_asignatura_precedente } = useParams();
    // const { id_asignatura, cod_facultad, cod_carrera } = useParams(); // Variables no utilizadas
    // const navigate = useNavigate(); // Variable no utilizada
    const [asignaturas, setAsignaturas] = useState([]);
    // const [updateResult, setUpdateResult] = useState(null); // Variable no utilizada
    // const [deleteResult, setDeleteResult] = useState(null); // Variable no utilizada
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentAsignatura, setCurrentAsignatura] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState('');

    const getAllAsignaturasPrecedentes = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/relacion`, {
                params: { id_asignatura_precedente }
            });
            setAsignaturas(response.data);
        } catch (error) {
            console.error('Error al obtener las asignaturas precedentes:', error);
        }
    };

    const updateAsignaturaPrecedente = async () => {
        try {
            await axios.put(`http://localhost:5000/api/relacion/${currentAsignatura.nombre_asignatura_prece}`, {
                id_asignatura_precedente_nueva: currentAsignatura.id_asignatura_precedente_nueva,
                horas: currentAsignatura.horas,
                cod_carrera: currentAsignatura.cod_carrera,
                cod_facultad: currentAsignatura.cod_facultad,
                codigo_asignatura_precedente_nueva: currentAsignatura.codigo_asignatura_precedente_nueva,
                nuevo_nombre: nuevoNombre
            });
            // setUpdateResult(response.data); // Variable no utilizada
            getAllAsignaturasPrecedentes(); // Refresh the list
            closeModal();
            toast.success('Asignatura modificada exitosamente');
        } catch (error) {
            console.error('Error al modificar la asignatura precedente:', error);
            toast.error('Error al modificar la asignatura precedente');
        }
    };

    const deleteAsignaturaPrecedente = async (nombre_asignatura_prece) => {
        try {
            await axios.delete(`http://localhost:5000/api/relacion/${nombre_asignatura_prece}`);
            // setDeleteResult(response.data); // Variable no utilizada
            getAllAsignaturasPrecedentes(); // Refresh the list
            toast.success('Asignatura eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar la asignatura precedente:', error);
            toast.error('Error al eliminar la asignatura precedente');
        }
    };

    const fetchAddedDetails = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/relacion`, {
                params: { id_asignatura_precedente }
            });
            setAsignaturas(response.data);
        } catch (error) {
            console.error('Error al obtener las asignaturas precedentes:', error);
        }
    }, [id_asignatura_precedente]);

    useEffect(() => {
        fetchAddedDetails();
    }, [fetchAddedDetails]);

    const openModal = (asignatura) => {
        setCurrentAsignatura(asignatura);
        setNuevoNombre(asignatura.nombre_asignatura_prece);
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
                <h1><FaBook className="icon" /> Asignaturas Precedentes</h1>
                <button className="consultar-button" onClick={getAllAsignaturasPrecedentes}>Consultar</button>
            </div>

            <div className="asignaturas-container">
                {asignaturas.map((asignatura, index) => (
                    <div className="asignatura-card" key={asignatura.id}>
                        <span className="asignatura-nombre">{asignatura.nombre_asignatura_prece}</span>
                        <div className="asignatura-actions">
                            <button className="edit-button" onClick={() => openModal(asignatura)}><FaEdit /></button>
                            <button className="delete-button" onClick={() => deleteAsignaturaPrecedente(asignatura.nombre_asignatura_prece)}><FaTrash /></button>
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
                    <button className="modal-button" onClick={updateAsignaturaPrecedente}>Guardar</button>
                    <button className="modal-button" onClick={closeModal}>Cancelar</button>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default AddAsignaturaPrecedenteRelacion;