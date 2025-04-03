import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import './css/AddAsignaturaa.css';
import { FaBook, FaTimes, FaPlus, FaSearch, FaPlusCircle, FaCheck } from 'react-icons/fa';

const AddMallaCurricular = () => {
    const { cod_facultad, cod_carrera } = useParams();
    const [version_malla, setVersionMalla] = useState('');
    const [estado] = useState(1); // Set default value to 1
    const [mallas, setMallas] = useState([]); // State to store mallas
    const [unidadTemat, setUnidadTemat] = useState([]); // State to store unidad_temat
    const [showForm, setShowForm] = useState(false); // State to control form visibility
    const [niveles, setNiveles] = useState([]); // State to store niveles and materias
    const [selectedNivel, setSelectedNivel] = useState(''); // State to store selected nivel
    const [searchTerm, setSearchTerm] = useState(''); // State to store search term
    const [showPrecedenteForm, setShowPrecedenteForm] = useState(false); // State to control precedente form visibility
    const [precedenteData, setPrecedenteData] = useState({ id_materia: '', nombre_materia_prece: '', horas: '', unidad: '' });
    const [precedentePrecedenteData, setPrecedentePrecedenteData] = useState({});
    const [showPrecedentePrecedenteForm, setShowPrecedentePrecedenteForm] = useState(false);
    const [precedentesByNivel, setPrecedentesByNivel] = useState([]); // State to store precedentes by nivel

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMallas = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/malla-curricular/${cod_carrera}`);
                console.log('Mallas obtenidas:', response.data); // Verificar los datos obtenidos
                setMallas(response.data);
            } catch (error) {
                console.error('Error al obtener las mallas curriculares:', error);
            }
        };
        fetchMallas();
    }, [cod_carrera]);

    useEffect(() => {
        const fetchUnidadTemat = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/unidad-temat');
                console.log('Unidad Temat obtenidas:', response.data); // Verificar los datos obtenidos
                setUnidadTemat(response.data);
            } catch (error) {
                console.error('Error al obtener las unidades de unidad_temat:', error);
            }
        };
        fetchUnidadTemat();
    }, []);

    useEffect(() => {
        const fetchNivelesYMaterias = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/carreras/${cod_carrera}/niveles-materias`);
                console.log('Niveles y materias obtenidos:', response.data);
                setNiveles(response.data.niveles);
            } catch (error) {
                console.error('Error al obtener los niveles y materias:', error);
            }
        };
        fetchNivelesYMaterias();
    }, [cod_carrera]);

    useEffect(() => {
        const fetchPrecedentesByNivel = async () => {
            if (selectedNivel) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/precedente/nivel/${selectedNivel}`);
                    console.log('Precedentes por nivel obtenidos:', response.data);
                    setPrecedentesByNivel(response.data);
                } catch (error) {
                    console.error('Error al obtener los precedentes por nivel:', error);
                }
            }
        };
        fetchPrecedentesByNivel();
    }, [selectedNivel]);

    const handleSubmitMalla = async (e) => {
        e.preventDefault();
        if (!version_malla) {
            toast.error('El campo "Versión de Malla" es obligatorio');
            return;
        }
        try {
            console.log('Datos enviados:', {
                cod_carrera,
                cod_facultad,
                version_malla,
                estado
            });
            const response = await axios.post('http://localhost:5000/api/malla_curricular', {
                cod_carrera,
                cod_facultad,
                version_malla,
                estado
            });
            console.log('Respuesta de la API:', response.data);
            toast.success('Malla Curricular añadida exitosamente');
            // No redirigir a otra página, solo mostrar la alerta
        } catch (error) {
            toast.error('Error al añadir la malla curricular');
            console.error('Error al añadir la malla curricular:', error);
        }
    };

    const handleAddMateriaClicka = () => {
        navigate(`/niveles-materias/${cod_facultad}/${cod_carrera}`); // Ajusta la ruta según sea necesario
    };

    const handleAddPrecedentePrecedente = (id_materia_precedente) => {
        setPrecedentePrecedenteData({ ...precedentePrecedenteData, id_materia_precedente });
        setShowPrecedentePrecedenteForm(true);
    };

    const handleNavigatee = () => {
        navigate(`/Asigna/${cod_facultad}/${cod_carrera}`);
    };

    const handleAddMateriaClick = () => {
        navigate(`/AddMat/${cod_facultad}/${cod_carrera}`);
    };

    const handleSubmitPrecedentePrecedente = async (e) => {
        e.preventDefault();
        const { id_materia_precedente, nombre_materia_prece, horas, unidad } = precedentePrecedenteData;

        if (!nombre_materia_prece || !horas || !unidad) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/addNewPrecedenteBasedOnExisting', {
                id_materia_precedente,
                id_materia_precedente_precedente: id_materia_precedente,
                nombre_materia_prece,
                horas,
                cod_carrera,
                cod_facultad,
                unidad
            });
            console.log('Materia precedente de precedente añadida:', response.data);
            toast.success('Materia precedente de precedente añadida exitosamente');

            // Update niveles state
            const newPrecedente = response.data;
            setNiveles((prevNiveles) => {
                return prevNiveles.map((nivel) => {
                    if (nivel.id_nivel === newPrecedente.id_nivel) {
                        const updatedPrecedentes = nivel.precedentes.map(precedente => {
                            if (precedente.id_materia_precedente === newPrecedente.id_materia_precedente) {
                                return {
                                    ...precedente,
                                    precedentes: [...(precedente.precedentes || []), newPrecedente]
                                };
                            }
                            return precedente;
                        });
                        return {
                            ...nivel,
                            precedentes: updatedPrecedentes
                        };
                    }
                    return nivel;
                });
            });

            setShowPrecedentePrecedenteForm(false);
        } catch (error) {
            toast.error('Error al añadir la materia precedente de precedente.');
            console.error('Error al añadir la materia precedente de precedente:', error);
        }
    };

    const handleAddPrecedente = (id_materia) => {
        setPrecedenteData({ ...precedenteData, id_materia });
        setShowPrecedenteForm(true);
    };

    const handleSubmitPrecedente = async (e) => {
        e.preventDefault();
        const { id_materia, nombre_materia_prece, horas, unidad } = precedenteData;

        if (!nombre_materia_prece || !horas || !unidad) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/malla_precedente', {
                id_materia,
                id_materia_precedente: id_materia,
                nombre_materia_prece,
                horas,
                cod_carrera,
                cod_facultad,
                unidad
            });
            console.log('Materia precedente añadida:', response.data);
            toast.success('Materia precedente añadida exitosamente');
            setShowPrecedenteForm(false);
        } catch (error) {
            toast.error('Error al añadir la materia precedente, no se pueden añadir más de 5 registros.');
            console.error('Error al añadir la materia precedente:', error);
        }
    };

    const handleBack = () => {
        navigate('/facultades-activas');
    };

    const filteredMaterias = selectedNivel
        ? niveles
              .find(nivel => nivel.id_nivel === parseInt(selectedNivel))
              ?.materias.filter(materia =>
                  materia.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase())
              ) || []
        : [];

    return (
        <div className="container">
            <ToastContainer />
            <h3><FaBook size={20} /> Malla Curricular</h3>
            <div className="form-row">
            <label className="form-label">Seleccionar Versión Malla:</label>
             <div className="select-add-container">
                <select className="form-input select-large">
                     {mallas.map((malla) => (
                    <option key={malla.id_malla} value={malla.id_malla}>
                        {malla.version_malla} - {malla.cod_carrera} - {malla.cod_facultad}
                    </option>
                 ))}
                </select>
             <button type="button" onClick={() => setShowForm(!showForm)} className="add-button">
                 <FaPlus />
             </button>
    </div>
    </div>
            {showForm && (
            <div className="modal-backdrop">
                <div className="cp-materias-contain">
                    <button className="modal-close" onClick={() => setShowForm(false)}>
                        &times;
                    </button>
                    <form onSubmit={handleSubmitMalla} className="modal-form">
                        <h4 className="modal-title">Añadir</h4>
                        <div className="form-row">
                            <label className="form-label">Versión de Malla:</label>
                            <input
                                className="form-input"
                                type="text"
                                value={version_malla}
                                onChange={(e) => setVersionMalla(e.target.value)}
                                required
                            />
                        </div>
                        {/* Hidden input for estado */}
                        <input
                            type="hidden"
                            value={estado}
                        />
                        <div className="modal-buttons">
                            <button className="modal-submit" type="submit">
                                <FaCheck />
                                <span className="tooltip-text">Añadir</span>
                            </button>
                            <button className="modal-cancel" type="button" onClick={() => setShowForm(false)}>
                                <FaTimes />
                                <span className="tooltip-text">Cancelar</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
            <div className="form-row">
                <label className="form-label">Seleccionar Nivel:</label>
                <select
                    className="form-input select-large"
                    value={selectedNivel}
                    onChange={(e) => setSelectedNivel(e.target.value)}
                >
                    <option value="">Seleccione un nivel</option>
                    {niveles.map((nivel) => (
                        <option key={nivel.id_nivel} value={nivel.id_nivel}>
                            {nivel.nombre_nivel}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddMateriaClick} className="add-button">
                <FaPlus /> Añadir Materia
                </button>
            </div>
            <div className="form-row full-width">
                <label className="form-label">Buscar Materias:</label>
                <div className="search-container">
                    <input
                        className="form-input search-input search-full-width"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar materias..."
                    />
                    <FaSearch className="search-icon" />
                </div>
            </div>
            <div>
                 <button onClick={handleAddMateriaClicka} className="add-butto">---------Generar pdf---------</button>
                 <button onClick={handleNavigatee} className="add-butto">
                 Resultados de aprendizajes</button>
            </div>

            <div className="form-row">
            <div className="materias-container">
                {filteredMaterias.map((materia) => (
                    <div key={materia.id_materia} className="materia-card">
                        <div className="materia-info">
                            <h5 className="materia-nombre">{materia.nombre_materia}</h5>
                            <button 
                                onClick={() => handleAddPrecedente(materia.id_materia)} 
                                className="action-button" 
                                title="Añadir Precedente"
                            >
                                <FaPlusCircle className="icon" />
                                <span>Añadir Precedente</span>
                            </button>
                            <Link 
                                to={`/consultar-precedente/${cod_facultad}/${cod_carrera}`} 
                                className="action-butto" 
                                title="Consultar Precedentes"
                            >
                                <FaSearch className="icon" />
                                <span>Consultar Precedente</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {selectedNivel && (
        <div className="form-row">
            <div className="materias-container">
               {niveles
                    .find(nivel => nivel.id_nivel === parseInt(selectedNivel))
                    ?.precedentes.map(precedente => (
                    <div key={precedente.id_materia_precedente} className="materia-card">
                        <div className="materia-info">
                            <h5 className="materia-nombre">{precedente.nombre_materia_prece}</h5>
                            <button onClick={() => handleAddPrecedentePrecedente(precedente.id_materia_precedente)} className="action-button">
                                <FaPlusCircle /> Añadir Precedente de Precedente
                            </button>
                            <Link to={`/consultar-precedente-precedente/${cod_facultad}/${cod_carrera}`} className="action-butto">
                                <FaSearch className="icon" />Consultar Precedente de Precedente
                                <span className="link-text">Consultar Precedente de Precedente</span>
                            </Link>
                            <div className="materias-container">
                                {precedente.precedentes?.map(precedentePrecedente => (
                                    <div key={precedentePrecedente.id_materia_precedente_precedente} className="materia-card">
                                        <div className="materia-info">
                                            <h5 className="materia-nombre">{precedentePrecedente.nombre_materia_prece}</h5>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    </div>
)}
        {showPrecedenteForm && (
        <div id="precedenteModal" className="modal-backdrop">
        <div className="modal-contentt">
            <div className="modal-header">
                <h4 className="modal-title">Añadir Materia Precedente</h4>
                <button className="modal-close" onClick={() => setShowPrecedenteForm(false)}>
                    &times;
                </button>
            </div>
            <form onSubmit={handleSubmitPrecedente} className="modal-form">
                <div className="form-group">
                    <label className="modal-label">Nombre de la Materia Precedente:</label>
                    <input
                        type="text"
                        className="modal-inputt"
                        value={precedenteData.nombre_materia_prece}
                        onChange={(e) =>
                            setPrecedenteData({ 
                                ...precedenteData, 
                                nombre_materia_prece: e.target.value
                                    .toUpperCase()
                                    .normalize('NFD')
                                    .replace(/[\u0300-\u036f]/g, '') 
                            })
                        }
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="modal-label">Horas:</label>
                    <input
                        type="number"
                        className="modal-input"
                        value={precedenteData.horas}
                        onChange={(e) =>
                            setPrecedenteData({ ...precedenteData, horas: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="form-row">
                    <div className="form-column">
                        <label className="modal-label">Unidad Tematica:</label>
                        <select
                            className="form-input select-large"
                            value={precedenteData.unidad}
                            onChange={(e) =>
                                setPrecedenteData({ ...precedenteData, unidad: e.target.options[e.target.selectedIndex].text })
                            }
                            required
                        >
                            <option value="">Seleccione una unidad</option>
                            {unidadTemat.map((unidad) => (
                                <option key={unidad.id_unidad} value={unidad.nombre_unidad}>
                                    {unidad.nombre_unidad}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <div className="modal-buttons">
                        <button type="submit" className="modal-submit">
                            <FaCheck /> Añadir
                        </button>
                        <button type="button" className="modal-cancel" onClick={() => setShowPrecedenteForm(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
)}
        {showPrecedentePrecedenteForm && (
        <div id="precedentePrecedenteModal" className="modal-backdrop">
            <div className="modal-content">
                <button className="modal-close" onClick={() => setShowPrecedentePrecedenteForm(false)}>
                    &times;
                </button>
                <form onSubmit={handleSubmitPrecedentePrecedente} className="modal-form">
                    <h4 className="modal-title">Añadir Materia Precedente de Precedente</h4>
                    <div className="form-group">
                        <label className="modal-label">Nombre de la Materia Precedente:</label>
                        <input
                            type="text"
                            className="modal-input"
                            value={precedentePrecedenteData.nombre_materia_prece}
                            onChange={(e) =>
                                setPrecedentePrecedenteData({ ...precedentePrecedenteData, nombre_materia_prece: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="modal-label">Horas:</label>
                            <input
                                type="number"
                                className="modal-input"
                                value={precedenteData.horas}
                                onChange={(e) =>
                                    setPrecedenteData({ ...precedenteData, horas: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-column">
                                <label className="form-label">Unidad Tematica:</label>
                                <select
                                    className="form-input select-large"
                                    value={precedenteData.unidad}
                                    onChange={(e) =>
                                        setPrecedenteData({ ...precedenteData, unidad: e.target.options[e.target.selectedIndex].text })
                                    }
                                    required
                                >
                                    <option value="">Seleccione una unidad</option>
                                    {unidadTemat.map((unidad) => (
                                        <option key={unidad.id_unidad} value={unidad.nombre_unidad}>
                                            {unidad.nombre_unidad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button type="submit" className="modal-submit">
                                <FaCheck /> Añadir
                            </button>
                            <button type="button" className="modal-cancel" onClick={() => setShowPrecedenteForm(false)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
       {showPrecedentePrecedenteForm && (
    <div id="precedentePrecedenteModal" className="modal-backdrop">
        <div className="modal-content">
            <button className="modal-close" onClick={() => setShowPrecedentePrecedenteForm(false)}>
                &times;
            </button>
            <form onSubmit={handleSubmitPrecedentePrecedente} className="modal-form">
                <h4 className="modal-title">Añadir Materia Precedente de Precedente</h4>
                <div className="form-group">
                    <label className="modal-label">Nombre de la Materia Precedente:</label>
                    <input
                        type="text"
                        className="modal-input"
                        value={precedentePrecedenteData.nombre_materia_prece}
                        onChange={(e) => {
                            const normalizedValue = e.target.value
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .toUpperCase();
                            setPrecedentePrecedenteData({ ...precedentePrecedenteData, nombre_materia_prece: normalizedValue });
                        }}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="modal-label">Horas:</label>
                    <input
                        type="number"
                        className="modal-input"
                        value={precedentePrecedenteData.horas}
                        onChange={(e) =>
                            setPrecedentePrecedenteData({ ...precedentePrecedenteData, horas: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="form-row">
                    <div className="form-column">
                        <label className="form-label">Unidad Tematica:</label>
                        <select
                            className="form-input select-large"
                            value={precedentePrecedenteData.unidad}
                            onChange={(e) =>
                                setPrecedentePrecedenteData({ ...precedentePrecedenteData, unidad: e.target.options[e.target.selectedIndex].text })
                            }
                            required
                        >
                            <option value="">Seleccione una unidad</option>
                            {unidadTemat.map((unidad) => (
                                <option key={unidad.id_unidad} value={unidad.nombre_unidad}>
                                    {unidad.nombre_unidad}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="modal-buttons">
                    <button type="submit" className="modal-submit">
                        <FaCheck /> Añadir
                    </button>
                    <button type="button" className="modal-cancel" onClick={() => setShowPrecedentePrecedenteForm(false)}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
        </div>
    );
};

export default AddMallaCurricular;