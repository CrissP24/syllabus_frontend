import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';
import styles from './css/AddMateriaForm.module.css';

import { FaPlus, FaArrowLeft, FaSearch } from 'react-icons/fa';

const AddMat = () => {
    const { cod_facultad, cod_carrera } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id_nivel: '',
        cod_carrera: '',
        cod_facultad: '',
        nombre_materia: '',
        estado: '1', // Definir estado como 1 (true)
        creditos: '',
        horas: '',
        id_unidad: '', // Añadir campo id_unidad
        codigo_materia: '' // Añadir campo codigo_materia
    });

    const [unidades, setUnidades] = useState([]); // Estado para almacenar las unidades temáticas
    const [niveles, setNiveles] = useState([]); // Estado para almacenar los niveles

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            cod_carrera: cod_carrera,
            cod_facultad: cod_facultad
        }));
    }, [cod_carrera, cod_facultad]);

    useEffect(() => {
        // Obtener todas las unidades temáticas
        const fetchUnidades = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/unidad-temat');
                const data = await response.json();
                setUnidades(data);
            } catch (err) {
                console.error('Error al obtener las unidades temáticas:', err);
                toast.error('Error al obtener las unidades temáticas');
            }
        };

        fetchUnidades();
    }, []);

    useEffect(() => {
        // Obtener todos los niveles según el cod_carrera
        const fetchNiveles = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/niveles/${cod_carrera}`);
                const data = await response.json();
                setNiveles(data);
            } catch (err) {
                console.error('Error al obtener los niveles:', err);
                toast.error('Error al obtener los niveles');
            }
        };

        fetchNiveles();
    }, [cod_carrera]);

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'nombre_materia') {
            newValue = removeAccents(value).toUpperCase();
        }
        setFormData({
            ...formData,
            [name]: newValue
        });
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({
            ...formData,
            [name]: selectedOption ? selectedOption.value : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/materias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                toast.success('Materia añadida exitosamente');
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (err) {
            console.error('Error al añadir la materia:', err);
            toast.error('Error al añadir la materia');
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div className={styles.formContainer}>
            <ToastContainer />
            <form className={styles.addMateriaForm} onSubmit={handleSubmit}>
                <h2>Añadir Materia</h2>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label> Nivel:</label>
                        <Select
                            name="id_nivel"
                            value={niveles.find(nivel => nivel.id_nivel === formData.id_nivel)}
                            onChange={handleSelectChange}
                            options={niveles.map(nivel => ({ value: nivel.id_nivel, label: nivel.nombre_nivel }))}
                            placeholder="Seleccione un nivel"
                            isClearable
                            required
                            className={styles.reactSelectContainer}
                            classNamePrefix="react-select"
                        />
                        <input type="text" name="selected_nivel" value={niveles.find(nivel => nivel.id_nivel === formData.id_nivel)?.nombre_nivel || ''} readOnly className={styles.formInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Unidad Temática:</label>
                        <Select
                            name="id_unidad"
                            value={unidades.find(unidad => unidad.id_unidad === formData.id_unidad)}
                            onChange={handleSelectChange}
                            options={unidades.map(unidad => ({ value: unidad.id_unidad, label: unidad.nombre_unidad }))}
                            placeholder="Seleccione una unidad"
                            isClearable
                            required
                            className={styles.reactSelectContainer}
                            classNamePrefix="react-select"
                        />
                        <input type="text" name="selected_unidad" value={unidades.find(unidad => unidad.id_unidad === formData.id_unidad)?.nombre_unidad || ''} readOnly className={styles.formInput} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Código Carrera:</label>
                        <input type="text" name="cod_carrera" value={formData.cod_carrera} readOnly className={styles.formInput} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Código Facultad:</label>
                        <input type="text" name="cod_facultad" value={formData.cod_facultad} readOnly className={styles.formInput} required />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Código Materia:</label>
                        <input type="text" name="codigo_materia" value={formData.codigo_materia} onChange={handleChange} required className={styles.formInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nombre Materia:</label>
                        <input type="text" name="nombre_materia" value={formData.nombre_materia} onChange={handleChange} required className={styles.formInput} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Créditos:</label>
                        <input type="number" name="creditos" value={formData.creditos} onChange={handleChange} required className={styles.formInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Horas:</label>
                        <input type="number" name="horas" value={formData.horas} onChange={handleChange} required className={styles.formInput} />
                    </div>
                </div>
                <input type="hidden" name="estado" value={formData.estado} />
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.addButton}>
                        <FaPlus /> Añadir Materia
                    </button>
                    <button type="button" className={styles.backButton} onClick={handleBack}>
                        <FaArrowLeft /> Regresar
                    </button>
                    <Link to={`/consultar-materias/${cod_facultad}/${cod_carrera}`} className={`${styles.addButton} ${styles.noUnderline}`} title="Consultar Materias">
                        <FaSearch className="icon" />Consultar
                        <span className="link-text">Consultar Asignatura</span>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddMat;