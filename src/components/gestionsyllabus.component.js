import React, { useState, useEffect } from 'react';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { QRCodeCanvas } from 'qrcode.react';
import mammoth from 'mammoth';
import './css/BoardDocente.css';

// Simulación de base de datos
const db = {
  asignaturas: [
    {
      id: "MAT101",
      nombre: "Matemáticas Básicas",
      codigo: "MAT101",
      prerrequisito: "Ninguno",
      correquisito: "Ninguno",
      facultad: "Ciencias Técnicas",
      carrera: "Tecnologías de la Información",
      unidadCurricular: "Formación Básica",
      ejeFormacion: "Ciencias Básicas",
      campoFormacion: {
        amplio: "Ciencias",
        especifico: "Matemáticas",
        detallado: "Matemáticas Básicas",
      },
      modalidad: "Presencial",
      periodo: "PI 2025",
      nivel: "Primer Semestre",
      totalHoras: "64",
      horasDocencia: "32",
      horasPFAE: "16",
      horasTA: "16",
      horasPPP: "0",
      horasHVS: "0",
      unidades: [
        {
          nombre: "UT1",
          contenidos: "Números reales y operaciones básicas",
          horasHD: "8",
          horasPFAE: "4",
          horasTA: "4",
          metodologias: "Clase magistral, ejercicios prácticos",
          recursos: "Pizarra, proyector",
          escenario: "Presencial",
          bibliografia: "Stewart, J. (2015). Cálculo.",
          fecha: "Paralelo A: 01/03/2025",
        },
      ],
      resultados: [
        {
          nombre: "UT1",
          contenidos: "Números reales y operaciones básicas",
          resultados: "Resolver operaciones con números reales",
          criterios: "Exactitud en cálculos",
          instrumentos: "Examen escrito",
        },
      ],
    },
    {
      id: "FDP101",
      nombre: "Fundamentos de Programación",
      codigo: "FDP101",
      prerrequisito: "Ninguno",
      correquisito: "Ninguno",
      facultad: "Ciencias Técnicas",
      carrera: "Tecnologías de la Información",
      unidadCurricular: "Formación Básica",
      ejeFormacion: "Ciencias Básicas",
      campoFormacion: {
        amplio: "Ciencias Computacionales",
        especifico: "Programación",
        detallado: "Fundamentos de Programación",
      },
      modalidad: "Presencial",
      periodo: "PI 2025",
      nivel: "Primer Semestre",
      totalHoras: "64",
      horasDocencia: "32",
      horasPFAE: "16",
      horasTA: "16",
      horasPPP: "0",
      horasHVS: "0",
      unidades: [
        {
          nombre: "UT1",
          contenidos: "Algoritmos, variables, estructuras de control",
          horasHD: "8",
          horasPFAE: "4",
          horasTA: "4",
          metodologias: "Clase magistral, ejercicios prácticos",
          recursos: "Pizarra, proyector",
          escenario: "Presencial",
          bibliografia: "Joyanes, L. (2017). Fundamentos de Programación.",
          fecha: "Paralelo A: 01/03/2025",
        },
      ],
      resultados: [
        {
          nombre: "UT1",
          contenidos: "Algoritmos, variables, estructuras de control",
          resultados: "Resolver problemas básicos de programación",
          criterios: "Correctitud de algoritmos",
          instrumentos: "Examen práctico",
        },
      ],
    },
  ],
};

const Gestionsyllabus = () => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    prerrequisito: "",
    correquisito: "",
    facultad: "",
    carrera: "",
    unidadCurricular: "",
    ejeFormacion: "",
    campoAmplio: "",
    campoEspecifico: "",
    campoDetallado: "",
    modalidad: "Presencial",
    periodo: "PI 2025",
    nivel: "",
    paralelos: [{ id: "A", horario: "" }],
    tutorias: "",
    profesor: "",
    perfilProfesor: "",
    totalHoras: "",
    horasDocencia: "",
    horasPFAE: "",
    horasTA: "",
    horasPPP: "",
    horasHVS: "",
    unidades: [
      {
        nombre: "UT1",
        contenidos: "",
        horasHD: "",
        horasPFAE: "",
        horasTA: "",
        metodologias: "",
        recursos: "",
        escenario: "Presencial",
        bibliografia: "",
        fecha: "",
      },
    ],
    resultados: [
      {
        nombre: "UT1",
        contenidos: "",
        resultados: "",
        criterios: "",
        instrumentos: "",
      },
    ],
    visado: {
      decano: "",
      director: "",
      coordinador: "",
      docente: "",
      fechaDecano: "",
      fechaDirector: "",
      fechaCoordinador: "",
      fechaDocente: "",
      qrDecano: "",
      qrDirector: "",
      qrCoordinador: "",
      qrDocente: "",
    },
    rubricas: [{ criterio: "", puntaje: "", descripcion: "" }],
  });
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState("");
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [error, setError] = useState("");
  const [documentosGuardados, setDocumentosGuardados] = useState([]);

  // Cargar documentos guardados
  useEffect(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem("documentosSyllabus") || "[]");
      setDocumentosGuardados(guardados);
    } catch (err) {
      setError("Error al cargar documentos guardados: " + err.message);
    }
  }, []);

  // Cargar datos de asignatura
  const cargarDatosAsignatura = () => {
    console.log("Cargando asignatura:", asignaturaSeleccionada);
    const asignatura = db.asignaturas.find((a) => a.id === asignaturaSeleccionada);
    if (asignatura) {
      if (asignatura.codigo !== asignaturaSeleccionada) {
        setError("El código de la asignatura no coincide.");
        return;
      }
      setFormData({
        ...formData,
        ...asignatura,
        campoAmplio: asignatura.campoFormacion?.amplio || "",
        campoEspecifico: asignatura.campoFormacion?.especifico || "",
        campoDetallado: asignatura.campoFormacion?.detallado || "",
        paralelos: asignatura.paralelos || [{ id: "A", horario: "" }],
        tutorias: asignatura.tutorias || "",
        profesor: asignatura.profesor || "",
        perfilProfesor: asignatura.perfilProfesor || "",
        unidades: asignatura.unidades || [
          {
            nombre: "UT1",
            contenidos: "",
            horasHD: "",
            horasPFAE: "",
            horasTA: "",
            metodologias: "",
            recursos: "",
            escenario: "Presencial",
            bibliografia: "",
            fecha: "",
          },
        ],
        resultados: asignatura.resultados || [
          {
            nombre: "UT1",
            contenidos: "",
            resultados: "",
            criterios: "",
            instrumentos: "",
          },
        ],
        visado: {
          decano: "",
          director: "",
          coordinador: "",
          docente: "",
          fechaDecano: "",
          fechaDirector: "",
          fechaCoordinador: "",
          fechaDocente: "",
          qrDecano: "",
          qrDirector: "",
          qrCoordinador: "",
          qrDocente: "",
        },
        rubricas: asignatura.rubricas || [{ criterio: "", puntaje: "", descripcion: "" }],
      });
      setError("");
      setVistaPrevia(false);
      console.log("Datos cargados:", asignatura);
    } else {
      setError("Asignatura no encontrada.");
    }
  };

  // Manejar cambios en los inputs
  const manejarCambioInput = (e, seccion, indice, campo) => {
    let updatedFormData = { ...formData };
    if (seccion === "paralelos") {
      const paralelosActualizados = [...formData.paralelos];
      paralelosActualizados[indice] = { ...paralelosActualizados[indice], [campo]: e.target.value };
      updatedFormData.paralelos = paralelosActualizados;
    } else if (seccion === "unidades") {
      const unidadesActualizadas = [...formData.unidades];
      unidadesActualizadas[indice] = { ...unidadesActualizadas[indice], [campo]: e.target.value };
      updatedFormData.unidades = unidadesActualizadas;
      // Sincronizar con resultados
      updatedFormData.resultados = unidadesActualizadas.map((u, i) => ({
        nombre: u.nombre,
        contenidos: u.contenidos,
        resultados: formData.resultados[i]?.resultados || "",
        criterios: formData.resultados[i]?.criterios || "",
        instrumentos: formData.resultados[i]?.instrumentos || "",
      }));
    } else if (seccion === "resultados") {
      const resultadosActualizados = [...formData.resultados];
      resultadosActualizados[indice] = { ...resultadosActualizados[indice], [campo]: e.target.value };
      updatedFormData.resultados = resultadosActualizados;
    } else if (seccion === "visado") {
      updatedFormData.visado = { ...formData.visado, [campo]: e.target.value };
      if (["decano", "director", "coordinador", "docente"].includes(campo)) {
        updatedFormData.visado[`qr${campo.charAt(0).toUpperCase() + campo.slice(1)}`] = e.target.value
          ? `Firma de ${campo}: ${e.target.value}, Fecha: ${formData.visado[`fecha${campo.charAt(0).toUpperCase() + campo.slice(1)}`] || "N/A"}`
          : "";
      }
    } else if (seccion === "rubricas") {
      const rubricasActualizadas = [...formData.rubricas];
      rubricasActualizadas[indice] = { ...rubricasActualizadas[indice], [campo]: e.target.value };
      updatedFormData.rubricas = rubricasActualizadas;
    } else {
      updatedFormData[campo] = e.target.value;
    }
    setFormData(updatedFormData);
  };

  // Agregar nuevo item
  const agregarItem = (seccion) => {
    if (seccion === "paralelos") {
      setFormData({
        ...formData,
        paralelos: [...formData.paralelos, { id: String.fromCharCode(65 + formData.paralelos.length), horario: "" }],
      });
    } else if (seccion === "unidades") {
      const nuevaUnidad = {
        nombre: `UT${formData.unidades.length + 1}`,
        contenidos: "",
        horasHD: "",
        horasPFAE: "",
        horasTA: "",
        metodologias: "",
        recursos: "",
        escenario: "Presencial",
        bibliografia: "",
        fecha: "",
      };
      setFormData({
        ...formData,
        unidades: [...formData.unidades, nuevaUnidad],
        resultados: [
          ...formData.resultados,
          { nombre: nuevaUnidad.nombre, contenidos: "", resultados: "", criterios: "", instrumentos: "" },
        ],
      });
    } else if (seccion === "rubricas") {
      setFormData({
        ...formData,
        rubricas: [...formData.rubricas, { criterio: "", puntaje: "", descripcion: "" }],
      });
    }
  };

  // Guardar en JSON
  const guardarJson = () => {
    try {
      const json = JSON.stringify(formData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const nombreArchivo = `syllabus_${formData.codigo || 'sin_codigo'}.json`;
      saveAs(blob, nombreArchivo);
      const nuevoDocumento = {
        id: formData.codigo || 'sin_codigo',
        nombre: formData.nombre || 'Sin nombre',
        fecha: new Date().toISOString(),
        archivo: nombreArchivo,
      };
      const updatedDocumentos = [...documentosGuardados, nuevoDocumento];
      setDocumentosGuardados(updatedDocumentos);
      localStorage.setItem("documentosSyllabus", JSON.stringify(updatedDocumentos));
      setError("");
    } catch (err) {
      setError("Error al guardar JSON: " + err.message);
    }
  };

  // Exportar a Word
  const exportarAWord = async () => {
    try {
      console.log("Iniciando exportación a Word...");
      const response = await fetch('/Anexo No. 2 Formato Syllabus de la asignatura.docx');
      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const data = {
        codigo: formData.codigo || "N/A",
        nombre: formData.nombre || "N/A",
        prerrequisito: formData.prerrequisito || "N/A",
        correquisito: formData.correquisito || "N/A",
        facultad: formData.facultad || "N/A",
        carrera: formData.carrera || "N/A",
        unidadCurricular: formData.unidadCurricular || "N/A",
        ejeFormacion: formData.ejeFormacion || "N/A",
        campoAmplio: formData.campoAmplio || "N/A",
        campoEspecifico: formData.campoEspecifico || "N/A",
        campoDetallado: formData.campoDetallado || "N/A",
        modalidad: formData.modalidad || "N/A",
        periodo: formData.periodo || "N/A",
        nivel: formData.nivel || "N/A",
        paralelos: formData.paralelos.length > 0
          ? formData.paralelos.map((p) => `${p.id}: ${p.horario || "N/A"}`).join('\n')
          : "N/A",
        tutorias: formData.tutorias || "N/A",
        profesor: formData.profesor || "N/A",
        perfilProfesor: formData.perfilProfesor || "N/A",
        totalHoras: formData.totalHoras || "N/A",
        horasDocencia: formData.horasDocencia || "N/A",
        horasPFAE: formData.horasPFAE || "N/A",
        horasTA: formData.horasTA || "N/A",
        horasPPP: formData.horasPPP || "N/A",
        horasHVS: formData.horasHVS || "N/A",
        unidades: formData.unidades.map((u) => ({
          nombre: u.nombre || "N/A",
          contenidos: u.contenidos || "N/A",
          horasHD: u.horasHD || "N/A",
          horasPFAE: u.horasPFAE || "N/A",
          horasTA: u.horasTA || "N/A",
          metodologias: u.metodologias || "N/A",
          recursos: u.recursos || "N/A",
          escenario: u.escenario || "N/A",
          bibliografia: u.bibliografia || "N/A",
          fecha: u.fecha || "N/A",
        })),
        resultados: formData.resultados.map((r) => ({
          nombre: r.nombre || "N/A",
          contenidos: r.contenidos || "N/A",
          resultados: r.resultados || "N/A",
          criterios: r.criterios || "N/A",
          instrumentos: r.instrumentos || "N/A",
        })),
        visado: {
          decano: formData.visado.decano || "N/A",
          fechaDecano: formData.visado.fechaDecano || "N/A",
          qrDecano: formData.visado.qrDecano ? `Firma QR Decano` : "N/A",
          director: formData.visado.director || "N/A",
          fechaDirector: formData.visado.fechaDirector || "N/A",
          qrDirector: formData.visado.qrDirector ? `Firma QR Director` : "N/A",
          coordinador: formData.visado.coordinador || "N/A",
          fechaCoordinador: formData.visado.fechaCoordinador || "N/A",
          qrCoordinador: formData.visado.qrCoordinador ? `Firma QR Coordinador` : "N/A",
          docente: formData.visado.docente || "N/A",
          fechaDocente: formData.visado.fechaDocente || "N/A",
          qrDocente: formData.visado.qrDocente ? `Firma QR Docente` : "N/A",
        },
        rubricas: formData.rubricas.map((r) => ({
          criterio: r.criterio || "N/A",
          puntaje: r.puntaje || "N/A",
          descripcion: r.descripcion || "N/A",
        })),
      };

      console.log("Datos para la plantilla:", data);
      doc.setData(data);
      doc.render();
      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const nombreArchivo = `syllabus_${formData.codigo || 'sin_codigo'}_${Date.now()}.docx`;
      saveAs(out, nombreArchivo);
      const nuevoDocumento = {
        id: formData.codigo || 'sin_codigo',
        nombre: formData.nombre || 'Sin nombre',
        fecha: new Date().toISOString(),
        archivo: nombreArchivo,
      };
      const updatedDocumentos = [...documentosGuardados, nuevoDocumento];
      setDocumentosGuardados(updatedDocumentos);
      localStorage.setItem("documentosSyllabus", JSON.stringify(updatedDocumentos));
      setError("");
      console.log("Documento exportado con éxito:", nombreArchivo);
    } catch (err) {
      console.error("Error al exportar a Word:", err);
      setError(`Error al exportar el documento: ${err.message}`);
    }
  };

  // Alternar vista previa
  const alternarVistaPrevia = () => {
    console.log("Cambiando vistaPrevia a:", !vistaPrevia);
    setVistaPrevia(!vistaPrevia);
    setError("");
  };

  // Cargar Word y rellenar datos
  const handleWordUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    mammoth.extractRawText({ arrayBuffer: file.arrayBuffer() })
      .then((result) => {
        const text = result.value;
        // Aquí puedes parsear el texto y rellenar los campos principales del formData
        // Ejemplo básico para algunos campos:
        setFormData((prev) => ({
          ...prev,
          nombre: text.match(/NOMBRE\s*([^\n]*)/)?.[1]?.trim() || prev.nombre,
          codigo: text.match(/CÓDIGO\s*([^\n]*)/)?.[1]?.trim() || prev.codigo,
          facultad: text.match(/FACULTAD\s*([^\n]*)/)?.[1]?.trim() || prev.facultad,
          carrera: text.match(/CARRERA\s*([^\n]*)/)?.[1]?.trim() || prev.carrera,
          // ... puedes seguir con los demás campos según el formato del Word
        }));
      })
      .catch((err) => {
        setError('Error al procesar el documento Word.');
        console.error(err);
      });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Syllabus</h1>

      {/* Selección de asignatura */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Seleccione Asignatura:</label>
        <select
          value={asignaturaSeleccionada}
          onChange={(e) => setAsignaturaSeleccionada(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="">Seleccione...</option>
          {db.asignaturas.map((asignatura) => (
            <option key={asignatura.id} value={asignatura.id}>
              {asignatura.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={cargarDatosAsignatura}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!asignaturaSeleccionada}
        >
          Cargar Datos
        </button>
      </div>

      {/* Documentos guardados */}
      {documentosGuardados.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Documentos Guardados</h2>
          <ul className="border p-2 rounded">
            {documentosGuardados.map((doc, index) => (
              <li key={index} className="mb-2">
                {doc.nombre} ({doc.id}) - {new Date(doc.fecha).toLocaleString()} -{' '}
                <a href={`/${doc.archivo}`} download className="text-blue-500">
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {asignaturaSeleccionada && !error && (
        <>
          {/* Formulario */}
          <div className={vistaPrevia ? "hidden" : "block"}>
            <h2 className="text-xl font-semibold mb-2">1. Datos Generales</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Código de Asignatura"
                value={formData.codigo}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Nombre de la Asignatura"
                value={formData.nombre}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Prerrequisito"
                value={formData.prerrequisito}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Correquisito"
                value={formData.correquisito}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Facultad"
                value={formData.facultad}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Carrera"
                value={formData.carrera}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Unidad Curricular"
                value={formData.unidadCurricular}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Eje de Formación"
                value={formData.ejeFormacion}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Campo Amplio"
                value={formData.campoAmplio}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Campo Específico"
                value={formData.campoEspecifico}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Campo Detallado"
                value={formData.campoDetallado}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <select
                value={formData.modalidad}
                onChange={(e) => manejarCambioInput(e, null, null, "modalidad")}
                className="border p-2 rounded"
              >
                <option value="Presencial">Presencial</option>
                <option value="Semipresencial">Semipresencial</option>
                <option value="En línea">En línea</option>
              </select>
              <select
                value={formData.periodo}
                onChange={(e) => manejarCambioInput(e, null, null, "periodo")}
                className="border p-2 rounded"
              >
                <option value="PI 2025">PI 2025</option>
                <option value="PII 2025">PII 2025</option>
              </select>
              <input
                type="text"
                placeholder="Nivel"
                value={formData.nivel}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Tutorías"
                value={formData.tutorias}
                onChange={(e) => manejarCambioInput(e, null, null, "tutorias")}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Profesor"
                value={formData.profesor}
                onChange={(e) => manejarCambioInput(e, null, null, "profesor")}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Perfil del Profesor"
                value={formData.perfilProfesor}
                onChange={(e) => manejarCambioInput(e, null, null, "perfilProfesor")}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Total Horas/Créditos"
                value={formData.totalHoras}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Horas Docencia"
                value={formData.horasDocencia}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Horas PFAE"
                value={formData.horasPFAE}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Horas TA"
                value={formData.horasTA}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Horas PPP"
                value={formData.horasPPP}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                placeholder="Horas HVS"
                value={formData.horasHVS}
                readOnly
                className="border p-2 rounded bg-gray-100"
              />
            </div>

            <h2 className="text-xl font-semibold mb-2">Paralelos</h2>
            {formData.paralelos.map((paralelo, indice) => (
              <div key={indice} className="flex gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Paralelo"
                  value={paralelo.id}
                  onChange={(e) => manejarCambioInput(e, "paralelos", indice, "id")}
                  className="border p-2 rounded w-1/4"
                />
                <input
                  type="text"
                  placeholder="Horario"
                  value={paralelo.horario}
                  onChange={(e) => manejarCambioInput(e, "paralelos", indice, "horario")}
                  className="border p-2 rounded w-3/4"
                />
              </div>
            ))}
            <button onClick={() => agregarItem("paralelos")} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
              Agregar Paralelo
            </button>

            <h2 className="text-xl font-semibold mb-2">2. Estructura de la Asignatura</h2>
            {formData.unidades.map((unidad, indice) => (
              <div key={indice} className="mb-4 border p-4 rounded">
                <input
                  type="text"
                  placeholder="Unidad Temática"
                  value={unidad.nombre}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "nombre")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Contenidos"
                  value={unidad.contenidos}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "contenidos")}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Horas HD"
                  value={unidad.horasHD}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasHD")}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Horas PFAE"
                  value={unidad.horasPFAE}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasPFAE")}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Horas TA"
                  value={unidad.horasTA}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasTA")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Metodologías"
                  value={unidad.metodologias}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "metodologias")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Recursos Didácticos"
                  value={unidad.recursos}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "recursos")}
                  className="border p-2 rounded w-full mb-2"
                />
                <select
                  value={unidad.escenario}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "escenario")}
                  className="border p-2 rounded w-full mb-2"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Real">Real</option>
                </select>
                <textarea
                  placeholder="Bibliografía"
                  value={unidad.bibliografia}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "bibliografia")}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Fecha/Paralelo"
                  value={unidad.fecha}
                  onChange={(e) => manejarCambioInput(e, "unidades", indice, "fecha")}
                  className="border p-2 rounded w-full mb-2"
                />
              </div>
            ))}
            <button onClick={() => agregarItem("unidades")} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
              Agregar Unidad
            </button>

            <h2 className="text-xl font-semibold mb-2">3. Resultados y Evaluación</h2>
            {formData.resultados.map((resultado, indice) => (
              <div key={indice} className="mb-4 border p-4 rounded">
                <input
                  type="text"
                  placeholder="Unidad Temática"
                  value={resultado.nombre}
                  readOnly
                  className="border p-2 rounded w-full mb-2 bg-gray-100"
                />
                <textarea
                  placeholder="Contenidos"
                  value={resultado.contenidos}
                  readOnly
                  className="border p-2 rounded w-full mb-2 bg-gray-100"
                />
                <textarea
                  placeholder="Resultados de Aprendizaje"
                  value={resultado.resultados}
                  onChange={(e) => manejarCambioInput(e, "resultados", indice, "resultados")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Criterios de Evaluación"
                  value={resultado.criterios}
                  onChange={(e) => manejarCambioInput(e, "resultados", indice, "criterios")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Instrumentos de Evaluación"
                  value={resultado.instrumentos}
                  onChange={(e) => manejarCambioInput(e, "resultados", indice, "instrumentos")}
                  className="border p-2 rounded w-full mb-2"
                />
              </div>
            ))}

            <h2 className="text-xl font-semibold mb-2">4. Rúbricas de Calificaciones</h2>
            {formData.rubricas.map((rubrica, indice) => (
              <div key={indice} className="mb-4 border p-4 rounded">
                <input
                  type="text"
                  placeholder="Criterio"
                  value={rubrica.criterio}
                  onChange={(e) => manejarCambioInput(e, "rubricas", indice, "criterio")}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Puntaje"
                  value={rubrica.puntaje}
                  onChange={(e) => manejarCambioInput(e, "rubricas", indice, "puntaje")}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  placeholder="Descripción"
                  value={rubrica.descripcion}
                  onChange={(e) => manejarCambioInput(e, "rubricas", indice, "descripcion")}
                  className="border p-2 rounded w-full mb-2"
                />
              </div>
            ))}
            <button onClick={() => agregarItem("rubricas")} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
              Agregar Rúbrica
            </button>

            <h2 className="text-xl font-semibold mb-2">5. Visado</h2>
            <div className="board-docente-section visado-grid-futuristic">
              <label className="board-docente-label">Visado</label>
              <div className="visado-row">
                {[
                  { key: 'decano', label: 'Decano/a', qr: formData.visado.qrDecano, nombre: formData.visado.decano, fecha: formData.visado.fechaDecano },
                  { key: 'director', label: 'Director/a Académico/a', qr: formData.visado.qrDirector, nombre: formData.visado.director, fecha: formData.visado.fechaDirector },
                  { key: 'coordinador', label: 'Coordinador/a de Carrera', qr: formData.visado.qrCoordinador, nombre: formData.visado.coordinador, fecha: formData.visado.fechaCoordinador },
                  { key: 'docente', label: 'Docente', qr: formData.visado.qrDocente, nombre: formData.visado.docente, fecha: formData.visado.fechaDocente },
                ].map((role) => (
                  <div className="visado-col" key={role.key}>
                    <div className="visado-nombre futuristic-label">{role.label}</div>
                    {role.qr && <QRCodeCanvas value={role.qr} size={80} className="visado-qr futuristic-qr" />}
                    <input
                      type="text"
                      value={role.nombre}
                      onChange={e => manejarCambioInput(e, 'visado', null, role.key)}
                      className="board-docente-input visado-input"
                      placeholder={`Nombre del ${role.label}`}
                    />
                    <input
                      type="text"
                      value={role.fecha}
                      onChange={e => manejarCambioInput(e, 'visado', null, `fecha${role.key.charAt(0).toUpperCase() + role.key.slice(1)}`)}
                      className="board-docente-input visado-input"
                      placeholder="Fecha"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={guardarJson} className="bg-blue-500 text-white px-4 py-2 rounded">
                Guardar como JSON
              </button>
              <button onClick={exportarAWord} className="bg-blue-500 text-white px-4 py-2 rounded">
                Exportar a Word
              </button>
              <button onClick={alternarVistaPrevia} className="bg-gray-500 text-white px-4 py-2 rounded">
                {vistaPrevia ? "Volver a Editar" : "Vista Previa"}
              </button>
            </div>
          </div>

          {/* Vista Previa */}
          {vistaPrevia && (
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">SYLLABUS</h2>
              <h3 className="text-lg font-semibold">1. Datos Generales y Específicos</h3>
              <p><strong>Código de Asignatura:</strong> {formData.codigo || "N/A"}</p>
              <p><strong>Nombre de la Asignatura:</strong> {formData.nombre || "N/A"}</p>
              <p><strong>Prerrequisito:</strong> {formData.prerrequisito || "N/A"}</p>
              <p><strong>Correquisito:</strong> {formData.correquisito || "N/A"}</p>
              <p><strong>Facultad:</strong> {formData.facultad || "N/A"}</p>
              <p><strong>Carrera:</strong> {formData.carrera || "N/A"}</p>
              <p><strong>Unidad Curricular:</strong> {formData.unidadCurricular || "N/A"}</p>
              <p><strong>Eje de Formación:</strong> {formData.ejeFormacion || "N/A"}</p>
              <p>
                <strong>Campo de Formación:</strong> Amplio: {formData.campoAmplio || "N/A"}, Específico: {formData.campoEspecifico || "N/A"}, Detallado: {formData.campoDetallado || "N/A"}
              </p>
              <p><strong>Modalidad:</strong> {formData.modalidad || "N/A"}</p>
              <p><strong>Periodo Académico:</strong> {formData.periodo || "N/A"}</p>
              <p><strong>Nivel:</strong> {formData.nivel || "N/A"}</p>
              <p><strong>Paralelos:</strong> {formData.paralelos.length > 0 ? formData.paralelos.map((p) => `${p.id}: ${p.horario || "N/A"}`).join(', ') : "N/A"}</p>
              <p><strong>Tutorías:</strong> {formData.tutorias || "N/A"}</p>
              <p><strong>Profesor:</strong> {formData.profesor || "N/A"}</p>
              <p><strong>Perfil del Profesor:</strong> {formData.perfilProfesor || "N/A"}</p>
              <p><strong>Total Horas/Créditos:</strong> {formData.totalHoras || "N/A"}</p>
              <p><strong>Horas Docencia:</strong> {formData.horasDocencia || "N/A"}</p>
              <p><strong>Horas PFAE:</strong> {formData.horasPFAE || "N/A"}</p>
              <p><strong>Horas TA:</strong> {formData.horasTA || "N/A"}</p>
              <p><strong>Horas PPP:</strong> {formData.horasPPP || "N/A"}</p>
              <p><strong>Horas HVS:</strong> {formData.horasHVS || "N/A"}</p>

              <h3 className="text-lg font-semibold mt-4">2. Estructura de la Asignatura</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Unidades Temáticas</th>
                    <th className="border p-2">Contenidos</th>
                    <th className="border p-2">Horas HD</th>
                    <th className="border p-2">Horas PFAE</th>
                    <th className="border p-2">Horas TA</th>
                    <th className="border p-2">Metodologías</th>
                    <th className="border p-2">Recursos</th>
                    <th className="border p-2">Escenario</th>
                    <th className="border p-2">Bibliografía</th>
                    <th className="border p-2">Fecha/Paralelo</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.unidades.map((unidad, indice) => (
                    <tr key={indice}>
                      <td className="border p-2">{unidad.nombre || "N/A"}</td>
                      <td className="border p-2">{unidad.contenidos || "N/A"}</td>
                      <td className="border p-2">{unidad.horasHD || "N/A"}</td>
                      <td className="border p-2">{unidad.horasPFAE || "N/A"}</td>
                      <td className="border p-2">{unidad.horasTA || "N/A"}</td>
                      <td className="border p-2">{unidad.metodologias || "N/A"}</td>
                      <td className="border p-2">{unidad.recursos || "N/A"}</td>
                      <td className="border p-2">{unidad.escenario || "N/A"}</td>
                      <td className="border p-2">{unidad.bibliografia || "N/A"}</td>
                      <td className="border p-2">{unidad.fecha || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mt-4">3. Resultados y Evaluación</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Unidades Temáticas</th>
                    <th className="border p-2">Contenidos</th>
                    <th className="border p-2">Resultados de Aprendizaje</th>
                    <th className="border p-2">Criterios de Evaluación</th>
                    <th className="border p-2">Instrumentos de Evaluación</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.resultados.map((resultado, indice) => (
                    <tr key={indice}>
                      <td className="border p-2">{resultado.nombre || "N/A"}</td>
                      <td className="border p-2">{resultado.contenidos || "N/A"}</td>
                      <td className="border p-2">{resultado.resultados || "N/A"}</td>
                      <td className="border p-2">{resultado.criterios || "N/A"}</td>
                      <td className="border p-2">{resultado.instrumentos || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mt-4">4. Rúbricas de Calificaciones</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Criterio</th>
                    <th className="border p-2">Puntaje</th>
                    <th className="border p-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.rubricas.map((rubrica, indice) => (
                    <tr key={indice}>
                      <td className="border p-2">{rubrica.criterio || "N/A"}</td>
                      <td className="border p-2">{rubrica.puntaje || "N/A"}</td>
                      <td className="border p-2">{rubrica.descripcion || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-semibold mt-4">5. Visado</h3>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Decano/a</th>
                    <th className="border p-2">Director/a Académico/a</th>
                    <th className="border p-2">Coordinador/a de Carrera</th>
                    <th className="border p-2">Docente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">
                      {formData.visado.decano || "N/A"}
                      <br />
                      Fecha: {formData.visado.fechaDecano || "N/A"}
                      <br />
                      {formData.visado.qrDecano && <QRCodeCanvas value={formData.visado.qrDecano} size={100} />}
                    </td>
                    <td className="border p-2">
                      {formData.visado.director || "N/A"}
                      <br />
                      Fecha: {formData.visado.fechaDirector || "N/A"}
                      <br />
                      {formData.visado.qrDirector && <QRCodeCanvas value={formData.visado.qrDirector} size={100} />}
                    </td>
                    <td className="border p-2">
                      {formData.visado.coordinador || "N/A"}
                      <br />
                      Fecha: {formData.visado.fechaCoordinador || "N/A"}
                      <br />
                      {formData.visado.qrCoordinador && <QRCodeCanvas value={formData.visado.qrCoordinador} size={100} />}
                    </td>
                    <td className="border p-2">
                      {formData.visado.docente || "N/A"}
                      <br />
                      Fecha: {formData.visado.fechaDocente || "N/A"}
                      <br />
                      {formData.visado.qrDocente && <QRCodeCanvas value={formData.visado.qrDocente} size={100} />}
                    </td>
                  </tr>
                </tbody>
              </table>

              <button onClick={alternarVistaPrevia} className="bg-gray-500 text-white px-4 py-2 rounded mt-4">
                Volver a Editar
              </button>
            </div>
          )}
        </>
      )}

     
    </div>
  );
};

export default Gestionsyllabus;