import React, { useState, useEffect } from 'react';
import { FaBook, FaFileDownload, FaPlus, FaEye, FaFileWord, FaFileCode, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { QRCodeCanvas } from 'qrcode.react';
import mammoth from 'mammoth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/syllabus.css';

// Base de datos de ejemplo
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
  const [openSections, setOpenSections] = useState({
    general: true,
    paralelos: false,
    unidades: false,
    resultados: false,
    rubricas: false,
    visado: false,
  });
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem("documentosSyllabus") || "[]");
      setDocumentosGuardados(guardados);
    } catch (err) {
      setError("Error al cargar documentos guardados: " + err.message);
    }
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const cargarDatosAsignatura = () => {
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
      setIsDataLoaded(true);
    } else {
      setError("Asignatura no encontrada.");
    }
  };

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

  const exportarAWord = async () => {
    try {
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
    } catch (err) {
      setError(`Error al exportar el documento: ${err.message}`);
    }
  };

  const alternarVistaPrevia = () => {
    setVistaPrevia(!vistaPrevia);
    setError("");
  };

  const handleWordUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoadingWord(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      const parsedData = {
        codigo: text.match(/CÓDIGO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        nombre: text.match(/NOMBRE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        prerrequisito: text.match(/PRERREQUISITO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        correquisito: text.match(/CORREQUISITO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        facultad: text.match(/FACULTAD\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        carrera: text.match(/CARRERA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        unidadCurricular: text.match(/UNIDAD CURRICULAR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        ejeFormacion: text.match(/EJE DE FORMACIÓN\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        campoAmplio: text.match(/CAMPO AMPLIO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        campoEspecifico: text.match(/CAMPO ESPECÍFICO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        campoDetallado: text.match(/CAMPO DETALLADO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        modalidad: text.match(/MODALIDAD\s*:\s*([^\n]*)/i)?.[1]?.trim() || "Presencial",
        periodo: text.match(/PERÍODO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "PI 2025",
        nivel: text.match(/NIVEL\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        tutorias: text.match(/TUTORÍAS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        profesor: text.match(/PROFESOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        perfilProfesor: text.match(/PERFIL DEL PROFESOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        totalHoras: text.match(/TOTAL HORAS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        horasDocencia: text.match(/HORAS DOCENCIA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        horasPFAE: text.match(/HORAS PFAE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        horasTA: text.match(/HORAS TA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        horasPPP: text.match(/HORAS PPP\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        horasHVS: text.match(/HORAS HVS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
        paralelos: [],
        unidades: [],
        resultados: [],
        rubricas: [],
        visado: {
          decano: text.match(/DECANO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          director: text.match(/DIRECTOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          coordinador: text.match(/COORDINADOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          docente: text.match(/DOCENTE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          fechaDecano: text.match(/FECHA DECANO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          fechaDirector: text.match(/FECHA DIRECTOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          fechaCoordinador: text.match(/FECHA COORDINADOR\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          fechaDocente: text.match(/FECHA DOCENTE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          qrDecano: "",
          qrDirector: "",
          qrCoordinador: "",
          qrDocente: "",
        },
      };

      const paralelosMatch = text.match(/PARALELOS\s*:\s*([\s\S]*?)(?=\n\s*(?:UNIDADES|RESULTADOS|$))/i);
      if (paralelosMatch) {
        const paralelosText = paralelosMatch[1].trim();
        const paralelos = paralelosText.split('\n').map((line) => {
          const [id, horario] = line.split(':').map((s) => s.trim());
          return { id: id || `A${parsedData.paralelos.length + 1}`, horario: horario || "" };
        });
        parsedData.paralelos = paralelos.length > 0 ? paralelos : [{ id: "A", horario: "" }];
      }

      const unidadesMatch = text.match(/UNIDADES TEMÁTICAS\s*([\s\S]*?)(?=\n\s*(?:RESULTADOS|RÚBRICAS|$))/i);
      if (unidadesMatch) {
        const unidadesText = unidadesMatch[1].trim();
        const unidades = unidadesText.split(/(?=UT\d+)/).map((unitText, index) => {
          return {
            nombre: unitText.match(/UT\d+/)?.[0] || `UT${index + 1}`,
            contenidos: unitText.match(/CONTENIDOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            horasHD: unitText.match(/HORAS HD\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            horasPFAE: unitText.match(/HORAS PFAE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            horasTA: unitText.match(/HORAS TA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            metodologias: unitText.match(/METODOLOGÍAS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            recursos: unitText.match(/RECURSOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            escenario: unitText.match(/ESCENARIO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "Presencial",
            bibliografia: unitText.match(/BIBLIOGRAFÍA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            fecha: unitText.match(/FECHA\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          };
        });
        parsedData.unidades = unidades.length > 0 ? unidades : [
          { nombre: "UT1", contenidos: "", horasHD: "", horasPFAE: "", horasTA: "", metodologias: "", recursos: "", escenario: "Presencial", bibliografia: "", fecha: "" },
        ];
        parsedData.resultados = unidades.map((u, i) => ({
          nombre: u.nombre,
          contenidos: u.contenidos,
          resultados: parsedData.resultados[i]?.resultados || "",
          criterios: parsedData.resultados[i]?.criterios || "",
          instrumentos: parsedData.resultados[i]?.instrumentos || "",
        }));
      }

      const resultadosMatch = text.match(/RESULTADOS DE APRENDIZAJE\s*([\s\S]*?)(?=\n\s*(?:RÚBRICAS|VISADO|$))/i);
      if (resultadosMatch) {
        const resultadosText = resultadosMatch[1].trim();
        const resultados = resultadosText.split(/(?=UT\d+)/).map((resText, index) => {
          return {
            nombre: resText.match(/UT\d+/)?.[0] || `UT${index + 1}`,
            contenidos: resText.match(/CONTENIDOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            resultados: resText.match(/RESULTADOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            criterios: resText.match(/CRITERIOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            instrumentos: resText.match(/INSTRUMENTOS\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          };
        });
        parsedData.resultados = resultados.length > 0 ? resultados : parsedData.resultados;
      }

      const rubricasMatch = text.match(/RÚBRICAS\s*([\s\S]*?)(?=\n\s*(?:VISADO|$))/i);
      if (rubricasMatch) {
        const rubricasText = rubricasMatch[1].trim();
        const rubricas = rubricasText.split(/\n\s*CRITERIO\s*:/i).slice(1).map((rubText) => {
          return {
            criterio: rubText.match(/CRITERIO\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            puntaje: rubText.match(/PUNTAJE\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
            descripcion: rubText.match(/DESCRIPCIÓN\s*:\s*([^\n]*)/i)?.[1]?.trim() || "",
          };
        });
        parsedData.rubricas = rubricas.length > 0 ? rubricas : [{ criterio: "", puntaje: "", descripcion: "" }];
      }

      parsedData.visado.qrDecano = parsedData.visado.decano ? `Firma de decano: ${parsedData.visado.decano}, Fecha: ${parsedData.visado.fechaDecano || "N/A"}` : "";
      parsedData.visado.qrDirector = parsedData.visado.director ? `Firma de director: ${parsedData.visado.director}, Fecha: ${parsedData.visado.fechaDirector || "N/A"}` : "";
      parsedData.visado.qrCoordinador = parsedData.visado.coordinador ? `Firma de coordinador: ${parsedData.visado.coordinador}, Fecha: ${parsedData.visado.fechaCoordinador || "N/A"}` : "";
      parsedData.visado.qrDocente = parsedData.visado.docente ? `Firma de docente: ${parsedData.visado.docente}, Fecha: ${parsedData.visado.fechaDocente || "N/A"}` : "";

      setFormData(parsedData);
      setAsignaturaSeleccionada(parsedData.codigo);
      setError("");
      setIsDataLoaded(true);
    } catch (err) {
      setError("Error al procesar el documento Word: " + err.message);
    } finally {
      setIsLoadingWord(false);
    }
  };

  const handleAsignaturaChange = (e) => {
    setAsignaturaSeleccionada(e.target.value);
    setIsDataLoaded(false); // Reset data loaded state when changing asignatura
    setFormData({
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
  };

  return (
    <div className="container-fluid py-5 syllabus-container">
      <h1 className="display-5 fw-bold text-primary mb-5 text-center">
        <FaBook className="me-2" /> Gestión de Syllabus
      </h1>

      {/* Selección de Asignatura y Carga de Word */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <label htmlFor="asignaturaSelect" className="form-label fw-semibold">Seleccione Asignatura</label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white"><FaBook /></span>
                <select
                  id="asignaturaSelect"
                  value={asignaturaSeleccionada}
                  onChange={handleAsignaturaChange}
                  className="form-select"
                >
                  <option value="">Seleccione...</option>
                  {db.asignaturas.map((asignatura) => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={cargarDatosAsignatura}
                className="btn btn-primary mt-3 w-100"
                disabled={!asignaturaSeleccionada || isLoadingWord}
              >
                <FaFileDownload className="me-2" /> Cargar Datos
              </button>
            </div>
            <div className="col-md-6">
              <label htmlFor="wordUpload" className="form-label fw-semibold">Cargar Documento Word</label>
              <div className="input-group">
                <span className="input-group-text bg-primary text-white"><FaFileWord /></span>
                <input
                  id="wordUpload"
                  type="file"
                  accept=".docx"
                  onChange={handleWordUpload}
                  className="form-control"
                  disabled={isLoadingWord}
                />
              </div>
              {isLoadingWord && (
                <div className="text-primary mt-2">
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Procesando documento...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documentos Guardados */}
      {documentosGuardados.length > 0 && (
        <div className="card shadow-sm mb-5">
          <div className="card-body p-4">
            <h2 className="h4 fw-semibold text-secondary mb-4">Documentos Guardados</h2>
            <ul className="list-group">
              {documentosGuardados.map((doc, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{doc.nombre} ({doc.id}) - {new Date(doc.fecha).toLocaleString()}</span>
                  <a href={`/${doc.archivo}`} download className="btn btn-outline-primary btn-sm">
                    <FaFileDownload className="me-1" /> Descargar
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-5" role="alert">
          <FaExclamationTriangle className="me-2" />
          {error}
        </div>
      )}

      {isDataLoaded && (
        <>
          {/* Formulario con Secciones Colapsables */}
          <div className={vistaPrevia ? "d-none" : ""}>
            {/* Datos Generales */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">1. Datos Generales</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("general")}>
                  <FaChevronDown className={`transition-transform ${openSections.general ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.general && (
                <div className="card-body p-4">
                  <div className="row g-4">
                    {[
                      { label: "Código de Asignatura", value: formData.codigo, campo: "codigo", readOnly: true },
                      { label: "Nombre de la Asignatura", value: formData.nombre, campo: "nombre", readOnly: true },
                      { label: "Prerrequisito", value: formData.prerrequisito, campo: "prerrequisito", readOnly: true },
                      { label: "Correquisito", value: formData.correquisito, campo: "correquisito", readOnly: true },
                      { label: "Facultad", value: formData.facultad, campo: "facultad", readOnly: true },
                      { label: "Carrera", value: formData.carrera, campo: "carrera", readOnly: true },
                      { label: "Unidad Curricular", value: formData.unidadCurricular, campo: "unidadCurricular", readOnly: true },
                      { label: "Eje de Formación", value: formData.ejeFormacion, campo: "ejeFormacion", readOnly: true },
                      { label: "Campo Amplio", value: formData.campoAmplio, campo: "campoAmplio", readOnly: true },
                      { label: "Campo Específico", value: formData.campoEspecifico, campo: "campoEspecifico", readOnly: true },
                      { label: "Campo Detallado", value: formData.campoDetallado, campo: "campoDetallado", readOnly: true },
                      {
                        label: "Modalidad",
                        value: formData.modalidad,
                        campo: "modalidad",
                        type: "select",
                        options: ["Presencial", "Semipresencial", "En línea"],
                      },
                      {
                        label: "Período",
                        value: formData.periodo,
                        campo: "periodo",
                        type: "select",
                        options: ["PI 2025", "PII 2025"],
                      },
                      { label: "Nivel", value: formData.nivel, campo: "nivel", readOnly: true },
                      { label: "Tutorías", value: formData.tutorias, campo: "tutorias" },
                      { label: "Profesor", value: formData.profesor, campo: "profesor" },
                      { label: "Perfil del Profesor", value: formData.perfilProfesor, campo: "perfilProfesor" },
                      { label: "Total Horas/Créditos", value: formData.totalHoras, campo: "totalHoras", readOnly: true },
                      { label: "Horas Docencia", value: formData.horasDocencia, campo: "horasDocencia", readOnly: true },
                      { label: "Horas PFAE", value: formData.horasPFAE, campo: "horasPFAE", readOnly: true },
                      { label: "Horas TA", value: formData.horasTA, campo: "horasTA", readOnly: true },
                      { label: "Horas PPP", value: formData.horasPPP, campo: "horasPPP", readOnly: true },
                      { label: "Horas HVS", value: formData.horasHVS, campo: "horasHVS", readOnly: true },
                    ].map((field, index) => (
                      <div key={index} className="col-md-6">
                        <label className="form-label fw-semibold">{field.label}</label>
                        {field.type === "select" ? (
                          <div className="input-group">
                            <span className="input-group-text bg-secondary text-white"><FaBook /></span>
                            <select
                              value={field.value}
                              onChange={(e) => manejarCambioInput(e, null, null, field.campo)}
                              className="form-select"
                            >
                              {field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="input-group">
                            <span className="input-group-text bg-secondary text-white"><FaBook /></span>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => manejarCambioInput(e, null, null, field.campo)}
                              readOnly={field.readOnly}
                              className={`form-control ${field.readOnly ? "bg-light" : ""}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Paralelos */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">2. Paralelos</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("paralelos")}>
                  <FaChevronDown className={`transition-transform ${openSections.paralelos ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.paralelos && (
                <div className="card-body p-4">
                  {formData.paralelos.map((paralelo, indice) => (
                    <div key={indice} className="row g-4 mb-3">
                      <div className="col-md-3">
                        <div className="input-group">
                          <span className="input-group-text bg-secondary text-white">ID</span>
                          <input
                            type="text"
                            placeholder="Paralelo"
                            value={paralelo.id}
                            onChange={(e) => manejarCambioInput(e, "paralelos", indice, "id")}
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="col-md-9">
                        <div className="input-group">
                          <span className="input-group-text bg-secondary text-white">Horario</span>
                          <input
                            type="text"
                            placeholder="Horario"
                            value={paralelo.horario}
                            onChange={(e) => manejarCambioInput(e, "paralelos", indice, "horario")}
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => agregarItem("paralelos")}
                    className="btn btn-success"
                  >
                    <FaPlus className="me-2" /> Agregar Paralelo
                  </button>
                </div>
              )}
            </div>

            {/* Unidades */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">3. Estructura de la Asignatura</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("unidades")}>
                  <FaChevronDown className={`transition-transform ${openSections.unidades ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.unidades && (
                <div className="card-body p-4">
                  {formData.unidades.map((unidad, indice) => (
                    <div key={indice} className="card shadow-sm mb-3">
                      <div className="card-body">
                        <div className="row g-4">
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Unidad</span>
                              <input
                                type="text"
                                placeholder="Unidad Temática"
                                value={unidad.nombre}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "nombre")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Contenidos</span>
                              <textarea
                                placeholder="Contenidos"
                                value={unidad.contenidos}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "contenidos")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Horas HD</span>
                              <input
                                type="text"
                                placeholder="Horas HD"
                                value={unidad.horasHD}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasHD")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Horas PFAE</span>
                              <input
                                type="text"
                                placeholder="Horas PFAE"
                                value={unidad.horasPFAE}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasPFAE")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Horas TA</span>
                              <input
                                type="text"
                                placeholder="Horas TA"
                                value={unidad.horasTA}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "horasTA")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Metodologías</span>
                              <textarea
                                placeholder="Metodologías"
                                value={unidad.metodologias}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "metodologias")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Recursos</span>
                              <textarea
                                placeholder="Recursos Didácticos"
                                value={unidad.recursos}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "recursos")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Escenario</span>
                              <select
                                value={unidad.escenario}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "escenario")}
                                className="form-select"
                              >
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Real">Real</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Bibliografía</span>
                              <textarea
                                placeholder="Bibliografía"
                                value={unidad.bibliografia}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "bibliografia")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Fecha</span>
                              <input
                                type="text"
                                placeholder="Fecha/Paralelo"
                                value={unidad.fecha}
                                onChange={(e) => manejarCambioInput(e, "unidades", indice, "fecha")}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => agregarItem("unidades")}
                    className="btn btn-success"
                  >
                    <FaPlus className="me-2" /> Agregar Unidad
                  </button>
                </div>
              )}
            </div>

            {/* Resultados */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">4. Resultados y Evaluación</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("resultados")}>
                  <FaChevronDown className={`transition-transform ${openSections.resultados ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.resultados && (
                <div className="card-body p-4">
                  {formData.resultados.map((resultado, indice) => (
                    <div key={indice} className="card shadow-sm mb-3">
                      <div className="card-body">
                        <div className="row g-4">
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Unidad</span>
                              <input
                                type="text"
                                placeholder="Unidad Temática"
                                value={resultado.nombre}
                                readOnly
                                className="form-control bg-light"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Contenidos</span>
                              <textarea
                                placeholder="Contenidos"
                                value={resultado.contenidos}
                                readOnly
                                className="form-control bg-light"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Resultados</span>
                              <textarea
                                placeholder="Resultados de Aprendizaje"
                                value={resultado.resultados}
                                onChange={(e) => manejarCambioInput(e, "resultados", indice, "resultados")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Criterios</span>
                              <textarea
                                placeholder="Criterios de Evaluación"
                                value={resultado.criterios}
                                onChange={(e) => manejarCambioInput(e, "resultados", indice, "criterios")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Instrumentos</span>
                              <textarea
                                placeholder="Instrumentos de Evaluación"
                                value={resultado.instrumentos}
                                onChange={(e) => manejarCambioInput(e, "resultados", indice, "instrumentos")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rúbricas */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">5. Rúbricas de Calificaciones</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("rubricas")}>
                  <FaChevronDown className={`transition-transform ${openSections.rubricas ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.rubricas && (
                <div className="card-body p-4">
                  {formData.rubricas.map((rubrica, indice) => (
                    <div key={indice} className="card shadow-sm mb-3">
                      <div className="card-body">
                        <div className="row g-4">
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Criterio</span>
                              <input
                                type="text"
                                placeholder="Criterio"
                                value={rubrica.criterio}
                                onChange={(e) => manejarCambioInput(e, "rubricas", indice, "criterio")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Puntaje</span>
                              <input
                                type="text"
                                placeholder="Puntaje"
                                value={rubrica.puntaje}
                                onChange={(e) => manejarCambioInput(e, "rubricas", indice, "puntaje")}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-secondary text-white">Descripción</span>
                              <textarea
                                placeholder="Descripción"
                                value={rubrica.descripcion}
                                onChange={(e) => manejarCambioInput(e, "rubricas", indice, "descripcion")}
                                className="form-control"
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => agregarItem("rubricas")}
                    className="btn btn-success"
                  >
                    <FaPlus className="me-2" /> Agregar Rúbrica
                  </button>
                </div>
              )}
            </div>

            {/* Visado */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h5 mb-0">6. Visado</h2>
                <button className="btn btn-link text-white" onClick={() => toggleSection("visado")}>
                  <FaChevronDown className={`transition-transform ${openSections.visado ? "rotate-180" : ""}`} />
                </button>
              </div>
              {openSections.visado && (
                <div className="card-body p-4">
                  <div className="row g-4">
                    {[
                      { key: 'decano', label: 'Decano/a', qr: formData.visado.qrDecano, nombre: formData.visado.decano, fecha: formData.visado.fechaDecano },
                      { key: 'director', label: 'Director/a Académico/a', qr: formData.visado.qrDirector, nombre: formData.visado.director, fecha: formData.visado.fechaDirector },
                      { key: 'coordinador', label: 'Coordinador/a de Carrera', qr: formData.visado.qrCoordinador, nombre: formData.visado.coordinador, fecha: formData.visado.fechaCoordinador },
                      { key: 'docente', label: 'Docente', qr: formData.visado.qrDocente, nombre: formData.visado.docente, fecha: formData.visado.fechaDocente },
                    ].map((role) => (
                      <div key={role.key} className="col-md-3 text-center">
                        <label className="form-label fw-semibold">{role.label}</label>
                        {role.qr && <QRCodeCanvas value={role.qr} size={80} className="mb-3" />}
                        <div className="input-group mb-2">
                          <span className="input-group-text bg-secondary text-white">Nombre</span>
                          <input
                            type="text"
                            value={role.nombre}
                            onChange={(e) => manejarCambioInput(e, 'visado', null, role.key)}
                            className="form-control"
                            placeholder={`Nombre del ${role.label}`}
                          />
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-secondary text-white">Fecha</span>
                          <input
                            type="text"
                            value={role.fecha}
                            onChange={(e) => manejarCambioInput(e, 'visado', null, `fecha${role.key.charAt(0).toUpperCase() + role.key.slice(1)}`)}
                            className="form-control"
                            placeholder="Fecha"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="d-flex flex-wrap gap-3 mt-5 justify-content-center">
              <button
                onClick={guardarJson}
                className="btn btn-primary"
              >
                <FaFileCode className="me-2" /> Guardar como JSON
              </button>
              <button
                onClick={exportarAWord}
                className="btn btn-primary"
              >
                <FaFileWord className="me-2" /> Exportar a Word
              </button>
              <button
                onClick={alternarVistaPrevia}
                className="btn btn-secondary"
              >
                <FaEye className="me-2" /> {vistaPrevia ? "Volver a Editar" : "Vista Previa"}
              </button>
            </div>
          </div>

          {/* Vista Previa */}
          {vistaPrevia && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold text-primary mb-4">SYLLABUS</h2>
                <div className="accordion" id="previewAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="previewGeneral">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGeneral">
                        1. Datos Generales y Específicos
                      </button>
                    </h2>
                    <div id="collapseGeneral" className="accordion-collapse collapse show" data-bs-parent="#previewAccordion">
                      <div className="accordion-body">
                        <div className="row g-4">
                          {[
                            { label: "Código de Asignatura", value: formData.codigo },
                            { label: "Nombre de la Asignatura", value: formData.nombre },
                            { label: "Prerrequisito", value: formData.prerrequisito },
                            { label: "Correquisito", value: formData.correquisito },
                            { label: "Facultad", value: formData.facultad },
                            { label: "Carrera", value: formData.carrera },
                            { label: "Unidad Curricular", value: formData.unidadCurricular },
                            { label: "Eje de Formación", value: formData.ejeFormacion },
                            {
                              label: "Campo de Formación",
                              value: `Amplio: ${formData.campoAmplio || "N/A"}, Específico: ${formData.campoEspecifico || "N/A"}, Detallado: ${formData.campoDetallado || "N/A"}`,
                            },
                            { label: "Modalidad", value: formData.modalidad },
                            { label: "Período Académico", value: formData.periodo },
                            { label: "Nivel", value: formData.nivel },
                            { label: "Paralelos", value: formData.paralelos.length > 0 ? formData.paralelos.map((p) => `${p.id}: ${p.horario || "N/A"}`).join(', ') : "N/A" },
                            { label: "Tutorías", value: formData.tutorias },
                            { label: "Profesor", value: formData.profesor },
                            { label: "Perfil del Profesor", value: formData.perfilProfesor },
                            { label: "Total Horas/Créditos", value: formData.totalHoras },
                            { label: "Horas Docencia", value: formData.horasDocencia },
                            { label: "Horas PFAE", value: formData.horasPFAE },
                            { label: "Horas TA", value: formData.horasTA },
                            { label: "Horas PPP", value: formData.horasPPP },
                            { label: "Horas HVS", value: formData.horasHVS },
                          ].map((field, index) => (
                            <div key={index} className="col-md-6">
                              <p><strong>{field.label}:</strong> {field.value || "N/A"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="previewUnidades">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseUnidades">
                        2. Estructura de la Asignatura
                      </button>
                    </h2>
                    <div id="collapseUnidades" className="accordion-collapse collapse" data-bs-parent="#previewAccordion">
                      <div className="accordion-body">
                        {formData.unidades.map((unidad, index) => (
                          <div key={index} className="mb-3">
                            <h5>Unidad Temática: {unidad.nombre}</h5>
                            <p><strong>Contenidos:</strong> {unidad.contenidos || "N/A"}</p>
                            <p><strong>Horas HD:</strong> {unidad.horasHD || "N/A"}</p>
                            <p><strong>Horas PFAE:</strong> {unidad.horasPFAE || "N/A"}</p>
                            <p><strong>Horas TA:</strong> {unidad.horasTA || "N/A"}</p>
                            <p><strong>Metodologías:</strong> {unidad.metodologias || "N/A"}</p>
                            <p><strong>Recursos:</strong> {unidad.recursos || "N/A"}</p>
                            <p><strong>Escenario:</strong> {unidad.escenario || "N/A"}</p>
                            <p><strong>Bibliografía:</strong> {unidad.bibliografia || "N/A"}</p>
                            <p><strong>Fecha/Paralelo:</strong> {unidad.fecha || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="previewResultados">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseResultados">
                        3. Resultados y Evaluación
                      </button>
                    </h2>
                    <div id="collapseResultados" className="accordion-collapse collapse" data-bs-parent="#previewAccordion">
                      <div className="accordion-body">
                        {formData.resultados.map((resultado, index) => (
                          <div key={index} className="mb-3">
                            <h5>Unidad: {resultado.nombre}</h5>
                            <p><strong>Contenidos:</strong> {resultado.contenidos || "N/A"}</p>
                            <p><strong>Resultados:</strong> {resultado.resultados || "N/A"}</p>
                            <p><strong>Criterios:</strong> {resultado.criterios || "N/A"}</p>
                            <p><strong>Instrumentos:</strong> {resultado.instrumentos || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="previewRubricas">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRubricas">
                        4. Rúbricas de Calificaciones
                      </button>
                    </h2>
                    <div id="collapseRubricas" className="accordion-collapse collapse" data-bs-parent="#previewAccordion">
                      <div className="accordion-body">
                        {formData.rubricas.map((rubrica, index) => (
                          <div key={index} className="mb-3">
                            <p><strong>Criterio:</strong> {rubrica.criterio || "N/A"}</p>
                            <p><strong>Puntaje:</strong> {rubrica.puntaje || "N/A"}</p>
                            <p><strong>Descripción:</strong> {rubrica.descripcion || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="previewVisado">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVisado">
                        5. Visado
                      </button>
                    </h2>
                    <div id="collapseVisado" className="accordion-collapse collapse" data-bs-parent="#previewAccordion">
                      <div className="accordion-body">
                        <div className="row g-4">
                          {[
                            { label: "Decano/a", nombre: formData.visado.decano, fecha: formData.visado.fechaDecano, qr: formData.visado.qrDecano },
                            { label: "Director/a Académico/a", nombre: formData.visado.director, fecha: formData.visado.fechaDirector, qr: formData.visado.qrDirector },
                            { label: "Coordinador/a de Carrera", nombre: formData.visado.coordinador, fecha: formData.visado.fechaCoordinador, qr: formData.visado.qrCoordinador },
                            { label: "Docente", nombre: formData.visado.docente, fecha: formData.visado.fechaDocente, qr: formData.visado.qrDocente },
                          ].map((role, index) => (
                            <div key={index} className="col-md-3 text-center">
                              <h5>{role.label}</h5>
                              {role.qr && <QRCodeCanvas value={role.qr} size={80} className="mb-3" />}
                              <p><strong>Nombre:</strong> {role.nombre || "N/A"}</p>
                              <p><strong>Fecha:</strong> {role.fecha || "N/A"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={alternarVistaPrevia}
                    className="btn btn-secondary"
                  >
                    <FaEye className="me-2" /> Volver a Editar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gestionsyllabus;