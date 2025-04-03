import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./css/NivelesMaterias.css";
import './css/AddAsignaturaa.css';
import escudo from './image/escudo.jpeg'; // Import the image

const NivelesMaterias = () => {
    const { cod_carrera } = useParams();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [facultad, setFacultad] = useState({});
    const [carrera, setCarrera] = useState({});
    const [unidadColors, setUnidadColors] = useState({});
    const [precedenteColors, setPrecedenteColors] = useState({});
    const [precedentePrecedenteColors, setPrecedentePrecedenteColors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseNiveles = await axios.get(`http://localhost:5000/api/malla_precedente/${cod_carrera}`);
                setLevels(responseNiveles.data);

                const responseCarrera = await axios.get(`http://localhost:5000/api/carrera/${cod_carrera}`);
                setCarrera(responseCarrera.data);

                const responseFacultad = await axios.get(`http://localhost:5000/api/facultad/${responseCarrera.data.cod_facultad}`);
                setFacultad(responseFacultad.data);

                setLoading(false);
            } catch (err) {
                console.error(err.message);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [cod_carrera]);

    useEffect(() => {
        const fetchUnidadColors = async () => {
            const colors = {};
            for (const level of levels) {
                for (const materia of level.materias) {
                    if (!colors[materia.nombre_materia]) {
                        try {
                            const response = await axios.get(`http://localhost:5000/api/unidad/${materia.nombre_materia}`);
                            colors[materia.nombre_materia] = getColorForUnit(response.data.id_unidad);
                        } catch (err) {
                            console.error(err.message);
                        }
                    }
                }
            }
            setUnidadColors(colors);
        };

        const fetchPrecedenteColors = async () => {
            const colors = {};
            for (const level of levels) {
                for (const materia of level.materias) {
                    for (const precedente of materia.precedentes || []) {
                        if (!colors[precedente.nombre_materia_prece]) {
                            try {
                                const response = await axios.get(`http://localhost:5000/api/unidad/nombre/${precedente.nombre_materia_prece}`);
                                colors[precedente.nombre_materia_prece] = getColorForUnit(response.data.unidad);
                            } catch (err) {
                                console.error(err.message);
                            }
                        }
                    }
                }
            }
            setPrecedenteColors(colors);
        };

        const fetchPrecedentePrecedenteColors = async () => {
            const colors = {};
            for (const level of levels) {
                for (const materia of level.materias) {
                    for (const precedente of materia.precedentes || []) {
                        for (const precedenteDePrecedente of precedente.precedentes_de_precedentes || []) {
                            if (!colors[precedenteDePrecedente.nombre_materia_prece]) {
                                try {
                                    const response = await axios.get(`http://localhost:5000/api/unidad/nombre/precedente_precedente/${precedenteDePrecedente.nombre_materia_prece}`);
                                    colors[precedenteDePrecedente.nombre_materia_prece] = getColorForUnit(response.data.unidad);
                                } catch (err) {
                                    console.error(err.message);
                                }
                            }
                        }
                    }
                }
            }
            setPrecedentePrecedenteColors(colors);
        };

        if (levels.length > 0) {
            fetchUnidadColors();
            fetchPrecedenteColors();
            fetchPrecedentePrecedenteColors();
        }
    }, [levels]);

    const getColorForUnit = (unit) => {
        switch (unit) {
            case '101':
                return 'lightyellow';
            case '102':
                return 'lightsalmon';
            case '103':
                return 'lightblue';
            case 'UNIDAD BASICA':
                return 'lightyellow';
            case 'UNIDAD PROFESIONAL':
                return 'lightsalmon';
            case 'UNIDAD TITULACION':
                return 'lightblue';
            default:
                return 'white';
        }
    };

    const calculateTotalHours = (subjects) => {
        return subjects.reduce((total, subject) => total + (subject.horas || 0), 0);
    };

    const generatePDF = () => {
        const element = document.getElementById("content-to-pdf");
        const options = {
            margin: 1,
            filename: "NivelesMaterias.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 4 },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }, // Set orientation to landscape
        };
        const clone = element.cloneNode(true);
        clone.querySelector(".add-button").remove(); // Remove the button from the cloned element
        html2pdf().from(clone).set(options).save();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const organizeByLevel = (levels) => {
        const organizedLevels = {};

        levels.forEach(level => {
            if (!organizedLevels[level.id_nivel]) {
                organizedLevels[level.id_nivel] = {
                    id_unidad: level.id_unidad,
                    materias: []
                };
            }

            level.materias.forEach(materia => {
                organizedLevels[level.id_nivel].materias.push({
                    ...materia,
                    id_nivel: level.id_nivel,
                    id_unidad: level.id_unidad
                });

                materia.precedentes?.forEach(precedente => {
                    if (!organizedLevels[precedente.id_nivel]) {
                        organizedLevels[precedente.id_nivel] = {
                            id_unidad: precedente.unidad,
                            materias: []
                        };
                    }
                    organizedLevels[precedente.id_nivel].materias.push({
                        ...precedente,
                        id_nivel: precedente.id_nivel,
                        id_unidad: precedente.unidad
                    });

                    precedente.precedentes_de_precedentes?.forEach(precedenteDePrecedente => {
                        if (!organizedLevels[precedenteDePrecedente.id_nivel]) {
                            organizedLevels[precedenteDePrecedente.id_nivel] = {
                                id_unidad: precedenteDePrecedente.unidad,
                                materias: []
                            };
                        }
                        organizedLevels[precedenteDePrecedente.id_nivel].materias.push({
                            ...precedenteDePrecedente,
                            id_nivel: precedenteDePrecedente.id_nivel,
                            id_unidad: precedenteDePrecedente.unidad
                        });
                    });
                });
            });
        });

        return organizedLevels;
    };

    const organizedLevels = organizeByLevel(levels);

    const totalHoursAllLevels = Object.values(organizedLevels).reduce((total, level) => {
        return total + calculateTotalHours(level.materias);
    }, 0);

    return (
        <div className="container" id="content-to-pdf">
            <h1>UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ</h1>
            <img src={escudo} alt="Escudo" className="escudo" /> {/* Insert the image */}
            <div >
                <p><strong>Facultad:</strong> {facultad.nom_facultad} ({facultad.cod_facultad})</p>
                <p><strong>Carrera:</strong> {carrera.nom_carrera} ({carrera.cod_carrera})</p>
            </div>            
            <h2>DISTRIBUCIÓN DE ASIGNATURAS POR UNIDADES DE ORGANIZACIÓN CURRICULAR</h2>

            <button onClick={generatePDF} className="add-button">
                Descargar PDF
            </button>

            <div className="levels-container">
                {Object.keys(organizedLevels).map((nivel) => (
                    <div key={nivel} className="level-column">
                        <h3>Nivel {nivel}</h3>
                        <div className="subjects-column">
                            {organizedLevels[nivel].materias.map((subject) => (
                                <div key={subject.id_materia || subject.id_materia_precedente || subject.id_materia_precedente_precedente} className="subject" style={{ backgroundColor: unidadColors[subject.nombre_materia] || precedenteColors[subject.nombre_materia_prece] || precedentePrecedenteColors[subject.nombre_materia_prece] || 'white' }}>
                                    <h4>{subject.nombre_materia || subject.nombre_materia_prece}</h4>
                                    <p>Horas: {subject.horas}</p>
                                </div>
                            ))}
                        </div>
                        <div className="totals">
                            <p>
                                <strong>Total de Horas del Nivel:</strong> {calculateTotalHours(organizedLevels[nivel].materias)}
                            </p>
                        </div>
                    </div>
                ))}
                <div className="total-hours-all-levels">
                    <p>
                        <strong>Total de Horas de Todos los Niveles:</strong> {totalHoursAllLevels}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NivelesMaterias;