import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

const SyllabusScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classDetails, setClassDetails] = useState([]);
  const [currentDetail, setCurrentDetail] = useState({
    date: null,
    unidad: '',
    contenido: '',
    metodo: '',
    recursos: '',
    escenario: '',
    fuentes: '',
    horasDocencia: '',
    horasPractica: '',
    horasAutonomo: '',
  });

  const academicEvents = [
    { label: "Vacaciones del personal académico", from: "2025-04-01", to: "2025-04-13" },
    { label: "Trámites para matrícula", from: "2025-04-01", to: "2025-05-05" },
    { label: "Preparación Seminario Internacional", from: "2025-04-14", to: "2025-04-17" },
    { label: "Feriado por Viernes Santo", from: "2025-04-18", to: "2025-04-18" },
    { label: "Seminario Internacional de Trabajo Científico", from: "2025-04-21", to: "2025-04-25" },
    { label: "Matrículas ordinarias", from: "2025-04-21", to: "2025-05-06" },
    { label: "Inicio de Clases", from: "2025-05-12", to: "2025-05-12" },
    { label: "Feriado por Batalla del Pichincha", from: "2025-05-23", to: "2025-05-23" },
    { label: "Retiro Interno de Asignatura", from: "2025-06-13", to: "2025-06-16" },
    { label: "Procesamiento de trámites y recepción en Secretaría General", from: "2025-05-06", to: "2025-05-16" },
    { label: "Seminarios en el campo de conocimiento", from: "2025-04-28", to: "2025-05-01" },
    { label: "Feriado por Día Internacional del Trabajo", from: "2025-05-02", to: "2025-05-02" },
    { label: "Preparación y actualización de instrumentos", from: "2025-05-06", to: "2025-05-09" },
    { label: "Matrículas Extraordinarias", from: "2025-05-06", to: "2025-05-20" },
    { label: "Inauguración del Periodo Académico", from: "2025-05-12", to: "2025-05-12" },
    { label: "Proceso de retiro de asignaturas", from: "2025-06-12", to: "2025-06-16" },
    { label: "Clases normales Parcial", from: "2025-05-12", to: "2025-06-17" },
    { label: "Socialización de syllabus", from: "2025-05-12", to: "2025-05-17" },
    { label: "Ingreso en el SGA-UNESUM", from: "2025-05-19", to: "2025-05-22" },
    { label: "Clases normales Parcial", from: "2025-05-19", to: "2025-06-23" },
    { label: "Feriado por Batalla del Pichincha", from: "2025-05-24", to: "2025-05-24" },
    { label: "Clases normales Parcial", from: "2025-05-26", to: "2025-06-31" },
    { label: "Matrículas Especiales", from: "2025-06-02", to: "2025-06-07" },
    { label: "Clases normales Parcial", from: "2025-06-09", to: "2025-06-14" },
    { label: "Proceso de retiro de asignatura", from: "2025-06-13", to: "2025-06-19" },
  ];

  const syllabusStructure = {
    unidadesTematicas: [
      { id: "UT1", contenidos: ["Introducción a la Ciencia", "Métodos Científicos"] },
      { id: "UT2", contenidos: ["Análisis de Datos", "Estadística Básica"] },
      { id: "UT3", contenidos: ["Redacción Científica", "Publicación de Resultados"] },
    ],
    metodos: ["Clase magistral", "Taller práctico", "Estudio de casos", "Discusión grupal"],
    recursos: ["Proyector", "Pizarra", "Material impreso", "Software estadístico"],
    escenarios: ["Aula", "Laboratorio", "Biblioteca", "Plataforma virtual"],
    fuentes: ["Libro: Investigación Científica 101", "Artículo: Métodos Modernos", "Guía: Escritura Académica"],
  };

  const isHighlighted = (date) => {
    return academicEvents.some((event) => {
      const from = new Date(event.from);
      const to = event.to ? new Date(event.to) : from;
      return date >= from && date <= to;
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentDetail({ ...currentDetail, date });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDetail({ ...currentDetail, [name]: value });
  };

  const handleSave = () => {
    if (currentDetail.date && currentDetail.unidad && currentDetail.contenido) {
      setClassDetails([...classDetails, currentDetail]);
      setCurrentDetail({
        date: null,
        unidad: '',
        contenido: '',
        metodo: '',
        recursos: '',
        escenario: '',
        fuentes: '',
        horasDocencia: '',
        horasPractica: '',
        horasAutonomo: '',
      });
    } else {
      alert("Por favor, complete los campos requeridos: fecha, unidad temática y contenido.");
    }
  };

  const exportToExcel = () => {
    const data = classDetails.map((detail) => ({
      Fecha: detail.date.toLocaleDateString(),
      "Unidad Temática": detail.unidad,
      Contenido: detail.contenido,
      Método: detail.metodo,
      "Recursos Didácticos": detail.recursos,
      "Escenario de Aprendizaje": detail.escenario,
      "Fuentes de Consulta": detail.fuentes,
      "Horas Docencia": detail.horasDocencia,
      "Horas Práctica": detail.horasPractica,
      "Horas Autónomo": detail.horasAutonomo,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planificación");
    XLSX.writeFile(wb, "Planificacion_Academica_UNESUM.xlsx");
  };

  const contenidos = syllabusStructure.unidadesTematicas.find((u) => u.id === currentDetail.unidad)?.contenidos || [];

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Planificador de Sílabos UNESUM</h1>
        <p className="text-muted">Universidad Estatal del Sur de Manabí - Periodo Académico PI 2025</p>
      </div>

      <div className="row">
        {/* Calendar Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title h5 fw-bold mb-3">Calendario Académico</h2>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={({ date }) => (isHighlighted(date) ? 'bg-warning rounded-circle' : null)}
                className="border-0 w-100"
              />
              <p className="mt-3">Fecha seleccionada: <strong>{selectedDate.toLocaleDateString()}</strong></p>
              <hr />
              <h3 className="h6 fw-bold">Eventos Académicos</h3>
              <ul className="list-group list-group-flush">
                {academicEvents.map((event, idx) => (
                  <li key={idx} className="list-group-item small">
                    {event.label}: {event.from} {event.to && ` - ${event.to}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Class Form Section */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title h5 fw-bold mb-3">Programar Clase</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="unidad" className="form-label small fw-bold">Unidad Temática</label>
                  <select
                    id="unidad"
                    name="unidad"
                    value={currentDetail.unidad}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {syllabusStructure.unidadesTematicas.map((ut) => (
                      <option key={ut.id} value={ut.id}>{ut.id}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="contenido" className="form-label small fw-bold">Contenido</label>
                  <select
                    id="contenido"
                    name="contenido"
                    value={currentDetail.contenido}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {contenidos.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="metodo" className="form-label small fw-bold">Método de Enseñanza</label>
                  <select
                    id="metodo"
                    name="metodo"
                    value={currentDetail.metodo}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {syllabusStructure.metodos.map((m, idx) => (
                      <option key={idx} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="recursos" className="form-label small fw-bold">Recursos Didácticos</label>
                  <select
                    id="recursos"
                    name="recursos"
                    value={currentDetail.recursos}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {syllabusStructure.recursos.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="escenario" className="form-label small fw-bold">Escenario de Aprendizaje</label>
                  <select
                    id="escenario"
                    name="escenario"
                    value={currentDetail.escenario}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {syllabusStructure.escenarios.map((e, idx) => (
                      <option key={idx} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="fuentes" className="form-label small fw-bold">Fuentes de Consulta</label>
                  <select
                    id="fuentes"
                    name="fuentes"
                    value={currentDetail.fuentes}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Seleccione</option>
                    {syllabusStructure.fuentes.map((f, idx) => (
                      <option key={idx} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="horasDocencia" className="form-label small fw-bold">Horas Docencia</label>
                  <input
                    type="number"
                    id="horasDocencia"
                    name="horasDocencia"
                    value={currentDetail.horasDocencia}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej. 2"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="horasPractica" className="form-label small fw-bold">Horas Práctica</label>
                  <input
                    type="number"
                    id="horasPractica"
                    name="horasPractica"
                    value={currentDetail.horasPractica}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej. 1"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="horasAutonomo" className="form-label small fw-bold">Horas Autónomo</label>
                  <input
                    type="number"
                    id="horasAutonomo"
                    name="horasAutonomo"
                    value={currentDetail.horasAutonomo}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej. 3"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="btn btn-primary mt-4"
              >
                Guardar Clase
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Classes Section */}
      <div className="mt-5">
        <h2 className="h5 fw-bold mb-3">Clases Programadas</h2>
        {classDetails.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Unidad</th>
                    <th>Contenido</th>
                    <th>Método</th>
                    <th>Recursos</th>
                    <th>Escenario</th>
                    <th>Fuentes</th>
                    <th>Horas Docencia</th>
                    <th>Horas Práctica</th>
                    <th>Horas Autónomo</th>
                  </tr>
                </thead>
                <tbody>
                  {classDetails.map((clase, idx) => (
                    <tr key={idx}>
                      <td>{clase.date.toLocaleDateString()}</td>
                      <td>{clase.unidad}</td>
                      <td>{clase.contenido}</td>
                      <td>{clase.metodo}</td>
                      <td>{clase.recursos}</td>
                      <td>{clase.escenario}</td>
                      <td>{clase.fuentes}</td>
                      <td>{clase.horasDocencia}</td>
                      <td>{clase.horasPractica}</td>
                      <td>{clase.horasAutonomo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={exportToExcel}
              className="btn btn-success mt-3"
            >
              Exportar a Excel
            </button>
          </>
        ) : (
          <p className="text-muted">No hay clases programadas aún.</p>
        )}
      </div>
    </div>
  );
};

export default SyllabusScheduler;