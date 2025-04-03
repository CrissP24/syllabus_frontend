import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './css/styese.css'; // Asegúrate de importar el archivo de estilos

const Asigna = () => {
    const { cod_facultad, cod_carrera } = useParams(); // Obtener los parámetros de la ruta
    const navigate = useNavigate(); // Hook para la navegación
    const [asignaturas, setAsignaturas] = useState([]);
    const [selectedAsignatura, setSelectedAsignatura] = useState(null);
    const [nivelUnidad, setNivelUnidad] = useState(null);
    const [newMateria, setNewMateria] = useState({
        cod_carrera: cod_carrera,
        nombre_materia: '',
        id_nivel: '',
        id_unidad: '',
        resultados: '',
        contenidos: '',
        aprendizaje_docente: '',
        aprendizaje_practico: '',
        aprendizaje_autonomo: '',
        practicas_profesionales: '',
        practicas_servicio_comunitario: ''
    });

    useEffect(() => {
        const fetchAsignaturas = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/all-data/${cod_carrera}`);
                setAsignaturas(response.data.map(asignatura => ({
                    value: asignatura.nombre_materia || asignatura.nombre_materia_prece,
                    label: asignatura.nombre_materia || asignatura.nombre_materia_prece,
                    type: asignatura.type
                })));
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchAsignaturas();
    }, [cod_carrera]);

    const handleSelectAsignatura = async (selectedOption) => {
        const nombre_materia = selectedOption.value;
        const type = selectedOption.type;
        setSelectedAsignatura(selectedOption);
        try {
            let response;
            if (type === 'precedente_precedente') {
                response = await axios.get(`http://localhost:5000/api/nivel-unidad-prece-prece/${nombre_materia}`);
            } else if (type === 'precedente') {
                response = await axios.get(`http://localhost:5000/api/nivel-unidad-prece/${nombre_materia}`);
            } else {
                response = await axios.get(`http://localhost:5000/api/nivel-unidad/${nombre_materia}`);
            }
            setNivelUnidad(response.data);
            setNewMateria({
                ...newMateria,
                nombre_materia: nombre_materia,
                id_nivel: response.data.id_nivel || '',
                id_unidad: response.data.id_unidad || response.data.unidad || ''
            });
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMateria({ ...newMateria, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Calcular el total de horas
        const total_horas = parseInt(newMateria.aprendizaje_docente || 0) + parseInt(newMateria.aprendizaje_practico || 0) + parseInt(newMateria.aprendizaje_autonomo || 0);
        // Validar que los campos numéricos no estén vacíos
        const validNewMateria = {
            ...newMateria,
            id_nivel: newMateria.id_nivel || 0,
            id_unidad: newMateria.id_unidad || 0,
            aprendizaje_docente: newMateria.aprendizaje_docente || 0,
            aprendizaje_practico: newMateria.aprendizaje_practico || 0,
            aprendizaje_autonomo: newMateria.aprendizaje_autonomo || 0,
            practicas_profesionales: newMateria.practicas_profesionales || 0,
            practicas_servicio_comunitario: newMateria.practicas_servicio_comunitario || 0,
            total_horas: total_horas
        };
        try {
            const response = await axios.post('http://localhost:5000/api/materias-detalles', validNewMateria);
            setAsignaturas([...asignaturas, { value: response.data.nombre_materia, label: response.data.nombre_materia }]);
            setNewMateria({
                cod_carrera: cod_carrera,
                nombre_materia: '',
                id_nivel: '',
                id_unidad: '',
                resultados: '',
                contenidos: '',
                aprendizaje_docente: '',
                aprendizaje_practico: '',
                aprendizaje_autonomo: '',
                practicas_profesionales: '',
                practicas_servicio_comunitario: ''
            });
            toast.success('Información almacenada con éxito');
        } catch (err) {
            console.error(err.message);
            toast.error('Error al añadir la materia');
        }
    };

    const handleBack = () => {
        navigate(`/malla_curricular/${cod_facultad}/${cod_carrera}`);
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/materias-detalles/${cod_carrera}`);
            const doc = new jsPDF('landscape');
            doc.autoTable({
                head: [[
                    'Nombre\nMateria', 
                    'ID\nNivel', 
                    'ID\nUnidad', 
                    'Resultados', 
                    'Contenidos', 
                    'Aprendizaje\nDocente', 
                    'Aprendizaje\nPráctico', 
                    'Aprendizaje\nAutónomo', 
                    'Prácticas\nProfesionales', 
                    'Prácticas de\nServicio\nComunitario', 
                    'Total\nHoras'
                ]],
                body: response.data.map(row => [
                    row.nombre_materia,
                    row.id_nivel,
                    row.id_unidad || row.unidad,
                    row.resultados,
                    row.contenidos,
                    row.aprendizaje_docente,
                    row.aprendizaje_practico,
                    row.aprendizaje_autonomo,
                    row.practicas_profesionales,
                    row.practicas_servicio_comunitario,
                    parseInt(row.aprendizaje_docente || 0) + parseInt(row.aprendizaje_practico || 0) + parseInt(row.aprendizaje_autonomo || 0)
                ]),
                styles: { 
                    lineColor: [128, 128, 128], 
                    lineWidth: 0.5,
                    fillColor: [240, 240, 240] // Light gray background color
                },
                headStyles: {
                    textColor: [0, 0, 0], // Black text color for header
                    font: 'Georgia' // Set font to Georgia for header
                },
                bodyStyles: {
                    font: 'Georgia' // Set font to Georgia for body
                },
                columnStyles: {
                    0: { cellWidth: 20 }, // Adjust width for "Nombre Materia"
                    1: { cellWidth: 20 }, // Adjust width for "ID Nivel"
                    2: { cellWidth: 20 }, // Adjust width for "ID Unidad"
                    3: { cellWidth: 50 }, // Adjust width for "Resultados"
                    4: { cellWidth: 50 }, // Adjust width for "Contenidos"
                    5: { cellWidth: 20 }, // Adjust width for "Aprendizaje Docente"
                    6: { cellWidth: 20 }, // Adjust width for "Aprendizaje Práctico"
                    7: { cellWidth: 20 }, // Adjust width for "Aprendizaje Autónomo"
                    8: { cellWidth: 20 }, // Adjust width for "Prácticas Profesionales"
                    9: { cellWidth: 20 }, // Adjust width for "Prácticas de Servicio Comunitario"
                    10: { cellWidth: 20 }  // Adjust width for "Total Horas"
                }
            });
            doc.save('MateriasDetalles.pdf');
        } catch (err) {
            console.error(err.message);
            toast.error('Error al descargar el PDF');
        }
    };

    return (
        <div className="formContainer">
            <ToastContainer />
            <h2>Resultados de aprendizajes</h2>
            <div className="reactSelectContainer">
                <Select
                    options={asignaturas}
                    onChange={handleSelectAsignatura}
                    value={selectedAsignatura}
                    placeholder="Selecciona una asignatura"
                    isSearchable
                />
            </div>
            {selectedAsignatura && (
                <div>
                    <h2>Proceso.-</h2>
                    {nivelUnidad && (
                        <div className="formRow">
                            <div className="formGroup">
                                <label>ID Nivel:</label>
                                <input type="text" value={nivelUnidad.id_nivel} readOnly className="formInput" />
                            </div>
                            <div className="formGroup">
                                <label>ID Unidad:</label>
                                <input type="text" value={nivelUnidad.id_unidad || nivelUnidad.unidad} readOnly className="formInput" />
                            </div>
                        </div>
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit} className="addMateriaForm">
                <div className="formRow">
                    <div className="formGroup">
                        <label>Resultados:</label>
                        <textarea name="resultados" value={newMateria.resultados} onChange={handleInputChange} className="formInput" />
                    </div>
                    <div className="formGroup">
                        <label>Contenidos:</label>
                        <textarea name="contenidos" value={newMateria.contenidos} onChange={handleInputChange} className="formInput" />
                    </div>
                </div>
                <div className="formRow">
                    <div className="formGroup">
                        <label>Aprendizaje Docente:</label>
                        <input type="number" name="aprendizaje_docente" value={newMateria.aprendizaje_docente} onChange={handleInputChange} className="formInput" />
                    </div>
                    <div className="formGroup">
                        <label>Aprendizaje Práctico:</label>
                        <input type="number" name="aprendizaje_practico" value={newMateria.aprendizaje_practico} onChange={handleInputChange} className="formInput" />
                    </div>
                </div>
                <div className="formRow">
                    <div className="formGroup">
                        <label>Aprendizaje Autónomo:</label>
                        <input type="number" name="aprendizaje_autonomo" value={newMateria.aprendizaje_autonomo} onChange={handleInputChange} className="formInput" />
                    </div>
                    <div className="formGroup">
                        <label>Prácticas Profesionales:</label>
                        <input type="number" name="practicas_profesionales" value={newMateria.practicas_profesionales} onChange={handleInputChange} className="formInput" />
                    </div>
                </div>
                <div className="formRow">
                    <div className="formGroup">
                        <label>Prácticas de Servicio Comunitario:</label>
                        <input type="number" name="practicas_servicio_comunitario" value={newMateria.practicas_servicio_comunitario} onChange={handleInputChange} className="formInput" />
                    </div>
                    <div className="formGroup">
                        <label>Total Horas:</label>
                        <input type="number" value={parseInt(newMateria.aprendizaje_docente || 0) + parseInt(newMateria.aprendizaje_practico || 0) + parseInt(newMateria.aprendizaje_autonomo || 0)} readOnly className="formInput" />
                    </div>
                </div>
                <div className="buttonGroup">
                    <button type="submit" className="addButton">Añadir Materia</button>
                    <button type="button" className="backButton" onClick={handleBack}>Volver</button>
                    <button type="button" className="backButton" onClick={handleDownloadPDF}>Descargar PDF</button>
                </div>
            </form>
        </div>
    );
};

export default Asigna;