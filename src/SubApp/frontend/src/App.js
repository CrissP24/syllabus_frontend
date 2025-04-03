import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu';
import ListFacultadesActivas from './components/ListFacultadesActivas';
import ListCarrerasActivas from './components/ListCarrerasActivas';
import AddMallaCurricular from './components/AddMallaCurricularr';
import AddUnidadTematica from './components/AddUnidadTematica';
import AddTemario from './components/AddTemario';
import AddNivel from './components/AddNivel';
import AddAsignatura from './components/AddAsignatura';
import AddAsignaturaPrecedente from './components/AddAsignaturaPrecedente';
import AddAsignaturaPrecedenteDePrecedente from './components/AddAsignaturaPrecedenteDePrecedente'; // Import the new component
import AddProyectoIntegrador from './components/AddProyectoIntegrador'; 
import Home from './Home';
import UnidadesTematicas from './components/web/UnidadTematicas'; // Asegúrate de que la ruta sea correcta
import UnidadesTematicasPorTemario from './components/web/UnidadesTematicasPorTemario'; // Asegúrate de que la ruta sea correcta
import NivelesConTemarios from './components/web/NivelesconTemarios'; 
import AsignaturasPorNivel from './components/web/AsignaturasPorNiveles';
import AsignaturasConPrecedentes from './components/web/AsignaturasConPrecedentes';
import EstructuraCompleta from './components/web/EstructuraCompleta';
import Addcurricular from './components/Addcurricular';
import AddAsignaturaPrecedenteRelacion from './components/AddAsignaturaPrecedenteRelacion'; // Import the new component
import Asignaturas from './components/Asignaturas';
import AddMateriaForm from './components/AddMateriaForm';
import AddMat from './components/AddMat';
import ConsultarMaterias from './components/ConsultarMaterias';
import ConsultarPrecedente from './components/ConsultarPrecedente';
import ConsultarPrecedentePrecedente from './components/ConsultarPrecedentePrecedente';
import NivelesMaterias from './components/NivelesMaterias'; // Importar el nuevo componente
import Asigna from './components/Asigna'; // Importar el nuevo componente



import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Menu />
                <header className="App-header">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/facultades-activas" element={<ListFacultadesActivas />} />
                        <Route path="/carreras/:cod_facultad" element={<ListCarrerasActivas />} />
                        <Route path="/malla_curricular/:cod_facultad/:cod_carrera" element={<AddMallaCurricular />} />
                        <Route path="/unidad_tematica/:id_malla/:cod_facultad/:cod_carrera" element={<AddUnidadTematica />} />
                        <Route path="/temario/:id_unidad/:cod_facultad/:cod_carrera" element={<AddTemario />} />
                        <Route path="/nivel/:id_temario/:cod_facultad/:cod_carrera" element={<AddNivel />} />
                        <Route path="/asignatura/:id_nivel/:cod_facultad/:cod_carrera" element={<AddAsignatura />} />
                        <Route path="/asignatura_precedente/:id_asignatura/:cod_facultad/:cod_carrera" element={<AddAsignaturaPrecedente />} />
                        <Route path="/proyecto_integrador/:id_nivel" element={<AddProyectoIntegrador />} /> 
                        <Route path="/unidad_tematica/temario" element={<UnidadesTematicasPorTemario />} />
                        <Route path="/unidad_tematica" element={<UnidadesTematicas />} />
                        <Route path="/niveles" element={<NivelesConTemarios />} />
                        <Route path="/asignaturas/niveles" element={<AsignaturasPorNivel />} />
                        <Route path="/asignaturas-con-precedentes" element={<AsignaturasConPrecedentes />} />
                        <Route path="/otra-seccion" element={<h1>Otra Sección</h1>} />
                        <Route path="/estructura-completa" element={<EstructuraCompleta />} />
                        <Route path="/asignatura_precedente_de_precedente/:id_asignatura_precedente/:cod_facultad/:cod_carrera" element={<AddAsignaturaPrecedenteDePrecedente />} /> 
                        <Route path="/addcurricular/:id_asignatura_precedente" element={<Addcurricular />} />
                        <Route path="/asignatura_precedente_relacion" element={<AddAsignaturaPrecedenteRelacion />} /> {/* Add the new route */}
                        <Route path="/asignaturas" element={<Asignaturas />} />
                        <Route path="/AddMateriaForm/:cod_facultad/:cod_carrera" element={<AddMateriaForm />} />
                        <Route path="/AddMat/:cod_facultad/:cod_carrera" element={<AddMat/>} />
                        <Route path="/consultar-materias/:cod_facultad/:cod_carrera" element={<ConsultarMaterias />} />
                        <Route path="/consultar-precedente/:cod_facultad/:cod_carrera" element={<ConsultarPrecedente />} />
                        <Route path="/consultar-precedente-precedente/:cod_facultad/:cod_carrera" element={<ConsultarPrecedentePrecedente />} />
                        <Route path="/niveles-materias/:cod_facultad/:cod_carrera" element={<NivelesMaterias />} /> {/* Nueva ruta */}
                        <Route path="/Asigna/:cod_facultad/:cod_carrera" element={<Asigna />} /> {/* Nueva ruta */}


                    </Routes>
                </header>
            </div>
        </Router>
    );
}

export default App;