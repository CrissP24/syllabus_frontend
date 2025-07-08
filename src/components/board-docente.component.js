import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, ImageRun, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import mammoth from 'mammoth';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/BoardDocente.css';

const BoardDocente = () => {
  const subjectsDB = [
    "Fundamentos de Programación",
    "Programación II",
    "Bases de Datos",
    "Programación Avanzada",
  ];
  const levelsDB = ["Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo"];
  const periodsDB = ["PI 2025", "PII 2025", "PI 2026", "PII 2026"];
  const bibliographyDB = {
    basica: [
      "Introduction to Algorithms - Cormen",
      "Programming in C - Kernighan",
      "Python Crash Course - Matthes",
    ],
    complementaria: [
      "Clean Code - Martin",
      "The Pragmatic Programmer - Hunt",
      "Design Patterns - Gamma",
    ],
  };
  const startDatesDB = {
    "PI 2025": "2025-01-15",
    "PII 2025": "2025-07-01",
    "PI 2026": "2026-01-15",
    "PII 2026": "2026-07-01",
  };

  const [selectedSubject, setSelectedSubject] = useState("");
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    asignatura: '',
    periodo: '',
    nivel: '',
    caracterizacion: '',
    objetivos: '',
    competencias: '',
    resultados: { actitudinales: '', cognitivos: '', procedimentales: '' },
    unidades: [{ nombre: 'UT 1', descripcion: '' }],
    metodologia: '',
    procedimientos: { docencia: '', practicas: '', autonomo: '', examen: '' },
    bibliografia: { basica: [''], complementaria: [''] },
    visado: {
      decano: '', director: '', coordinador: '', docente: '',
      fechas: { decano: '', director: '', coordinador: '', docente: '' },
    },
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [qrCodes, setQrCodes] = useState({ decano: '', director: '', coordinador: '', docente: '' });
  const [error, setError] = useState('');
  const [isLoadingWord, setIsLoadingWord] = useState(false);

  useEffect(() => {
    const generateQRCodes = async () => {
      const roles = ['decano', 'director', 'coordinador', 'docente'];
      const qrData = {};
      for (const role of roles) {
        const qrText = `Firma ${role} para ${formData.asignatura} - ${formData.periodo}`;
        try {
          const qrUrl = await QRCode.toDataURL(qrText, { width: 100, height: 100 });
          qrData[role] = qrUrl;
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
      setQrCodes(qrData);
    };
    if (formData.asignatura && formData.periodo) {
      generateQRCodes();
    }
  }, [formData.asignatura, formData.periodo]);

  const handleInputChange = (e, section, field, index = null) => {
    setFormData((prev) => {
      if (index !== null) {
        if (section === 'unidades') {
          const updatedUnidades = [...prev.unidades];
          updatedUnidades[index] = { ...updatedUnidades[index], [field]: e.target.value };
          return { ...prev, unidades: updatedUnidades };
        }
        if (section === 'bibliografia') {
          const updatedBib = { ...prev.bibliografia };
          updatedBib[field][index] = e.target.value;
          return { ...prev, bibliografia: updatedBib };
        }
      }
      if (section) {
        if (section === 'visado.fechas') {
          return {
            ...prev,
            visado: { ...prev.visado, fechas: { ...prev.visado.fechas, [field]: e.target.value } },
          };
        }
        return { ...prev, [section]: { ...prev[section], [field]: e.target.value } };
      }
      return { ...prev, [field]: e.target.value };
    });
  };

  const addUnit = () => {
    setFormData((prev) => ({
      ...prev,
      unidades: [...prev.unidades, { nombre: `UT ${prev.unidades.length + 1}`, descripcion: '' }],
    }));
  };

  const removeUnit = (index) => {
    setFormData((prev) => {
      const updatedUnidades = prev.unidades.filter((_, i) => i !== index).map((unit, i) => ({
        ...unit,
        nombre: `UT ${i + 1}`,
      }));
      return { ...prev, unidades: updatedUnidades };
    });
  };

  const addBibliography = (type) => {
    setFormData((prev) => ({
      ...prev,
      bibliografia: {
        ...prev.bibliografia,
        [type]: [...prev.bibliografia[type], ''],
      },
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      const parsedData = {
        asignatura: text.match(/ASIGNATURA\s*([^\n]*)/)?.[1]?.trim() || '',
        periodo: text.match(/PERIODO ACADÉMICO ORDINARIO \(PAO\)\s*([^\n]*)/)?.[1]?.trim() || '',
        nivel: text.match(/NIVEL\s*([^\n]*)/)?.[1]?.trim() || '',
        caracterizacion: text.match(/CARACTERIZACIÓN\s*([\s\S]*?)OBJETIVOS/)?.[1]?.trim() || '',
        objetivos: text.match(/OBJETIVOS DE LA ASIGNATURA\s*([\s\S]*?)COMPETENCIAS/)?.[1]?.trim() || '',
        competencias: text.match(/COMPETENCIAS\s*([\s\S]*?)RESULTADOS/)?.[1]?.trim() || '',
        resultados: {
          actitudinales: text.match(/Actitudinales:([\s\S]*?)Cognitivos:/)?.[1]?.trim() || '',
          cognitivos: text.match(/Cognitivos:([\s\S]*?)Procedimentales:/)?.[1]?.trim() || '',
          procedimentales: text.match(/Procedimentales:([\s\S]*?)CONTENIDOS/)?.[1]?.trim() || '',
        },
        unidades: text
          .match(/UNIDADES TEMÁTICAS\s*DESCRIPCIÓN([\s\S]*?)METODOLOGÍA/)?.[1]
          ?.split('UT')
          .slice(1)
          .map((unitText, index) => ({
            nombre: `UT ${index + 1}`,
            descripcion: unitText.trim().replace(/^[\d\s]+/, '').trim(),
          })) || [{ nombre: 'UT 1', descripcion: '' }],
        metodologia: text.match(/METODOLOGÍA\s*([\s\S]*?)PROCEDIMIENTOS/)?.[1]?.trim() || '',
        procedimientos: {
          docencia: text.match(/Docencia:\s*([^\n]*)/)?.[1]?.trim() || '',
          practicas: text.match(/Prácticas Formativas:\s*([^\n]*)/)?.[1]?.trim() || '',
          autonomo: text.match(/Trabajo Autónomo:\s*([^\n]*)/)?.[1]?.trim() || '',
          examen: text.match(/Examen:\s*([^\n]*)/)?.[1]?.trim() || '',
        },
        bibliografia: {
          basica: text
            .match(/BIBLIOGRAFÍA BÁSICA([\s\S]*?)BIBLIOGRAFÍA COMPLEMENTARIA/)?.[1]
            ?.split('-')
            .map((item) => item.trim())
            .filter(Boolean) || [''],
          complementaria: text
            .match(/BIBLIOGRAFÍA COMPLEMENTARIA([\s\S]*?)VISADO/)?.[1]
            ?.split('-')
            .map((item) => item.trim())
            .filter(Boolean) || [''],
        },
        visado: {
          decano: text.match(/DECANO\/A\s*([^\n]*)/)?.[1]?.trim() || '',
          director: text.match(/DIRECTOR\/A ACADÉMICO\/A\s*([^\n]*)/)?.[1]?.trim() || '',
          coordinador: text.match(/COORDINADOR\/A DE CARRERA\s*([^\n]*)/)?.[1]?.trim() || '',
          docente: text.match(/DOCENTE\s*([^\n]*)/)?.[1]?.trim() || '',
          fechas: {
            decano: text.match(/DECANO\/A\s*Fecha:\s*([^\n]*)/)?.[1]?.trim() || '',
            director: text.match(/DIRECTOR\/A ACADÉMICO\/A\s*Fecha:\s*([^\n]*)/)?.[1]?.trim() || '',
            coordinador: text.match(/COORDINADOR\/A DE CARRERA\s*Fecha:\s*([^\n]*)/)?.[1]?.trim() || '',
            docente: text.match(/DOCENTE\s*Fecha:\s*([^\n]*)/)?.[1]?.trim() || '',
          },
        },
      };
      setFormData(parsedData);
      setError('');
    } catch (err) {
      setError('Error al procesar el archivo Word.');
      console.error(err);
    }
  };

  const exportToJSON = () => {
    if (!formData.asignatura) {
      setError('Por favor, complete el campo de asignatura antes de exportar.');
      return;
    }
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${formData.asignatura}_syllabus.json`);
  };

  const exportToWord = async () => {
    if (!formData.asignatura) {
      setError('Por favor, complete el campo de asignatura antes de exportar.');
      return;
    }
    
    setIsLoadingWord(true);
    try {
      const response = await fetch('/Anexo No. 1 Formato Programa Analítico.docx');
      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      const data = {
        asignatura: formData.asignatura || "N/A",
        periodo: formData.periodo || "N/A",
        nivel: formData.nivel || "N/A",
        caracterizacion: formData.caracterizacion || "N/A",
        objetivos: formData.objetivos || "N/A",
        competencias: formData.competencias || "N/A",
        resultadosActitudinales: formData.resultados.actitudinales || "N/A",
        resultadosCognitivos: formData.resultados.cognitivos || "N/A",
        resultadosProcedimentales: formData.resultados.procedimentales || "N/A",
        metodologia: formData.metodologia || "N/A",
        procedimientosDocencia: formData.procedimientos.docencia || "____",
        procedimientosPracticas: formData.procedimientos.practicas || "____",
        procedimientosAutonomo: formData.procedimientos.autonomo || "____",
        procedimientosExamen: formData.procedimientos.examen || "4",
        bibliografiaBasica: formData.bibliografia.basica.length > 0
          ? formData.bibliografia.basica.map((item, index) => `B.B.${index + 1}. ${item || ""}`).join('\n')
          : "N/A",
        bibliografiaComplementaria: formData.bibliografia.complementaria.length > 0
          ? formData.bibliografia.complementaria.map((item, index) => `B.C.${index + 1}. ${item || ""}`).join('\n')
          : "N/A",
        unidades: formData.unidades.map((u) => ({
          nombre: u.nombre || "N/A",
          descripcion: u.descripcion || "N/A",
        })),
        visado: {
          decano: formData.visado.decano || "N/A",
          director: formData.visado.director || "N/A",
          coordinador: formData.visado.coordinador || "N/A",
          docente: formData.visado.docente || "N/A",
          fechaDecano: formData.visado.fechas.decano || startDatesDB[formData.periodo] || "N/A",
          fechaDirector: formData.visado.fechas.director || startDatesDB[formData.periodo] || "N/A",
          fechaCoordinador: formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || "N/A",
          fechaDocente: formData.visado.fechas.docente || startDatesDB[formData.periodo] || "N/A",
          qrDecano: qrCodes.decano ? "QR_DECANO" : "N/A",
          qrDirector: qrCodes.director ? "QR_DIRECTOR" : "N/A",
          qrCoordinador: qrCodes.coordinador ? "QR_COORDINADOR" : "N/A",
          qrDocente: qrCodes.docente ? "QR_DOCENTE" : "N/A",
        },
      };

      doc.setData(data);
      doc.render();
      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const nombreArchivo = `programa_analitico_${formData.asignatura.replace(/\s+/g, '_')}_${Date.now()}.docx`;
      saveAs(out, nombreArchivo);
      setError("");
    } catch (err) {
      setError(`Error al exportar el documento: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoadingWord(false);
    }
  };

  const exportToPDF = () => {
    if (!formData.asignatura) {
      setError('Por favor, complete el campo de asignatura antes de exportar.');
      return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    let y = 40;
    const addText = (text, options = {}) => {
      const { bold = false, size = 12, maxWidth = 500 } = options;
      doc.setFontSize(size);
      doc.setFont('Helvetica', bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, 40, y);
      y += lines.length * (size + 2);
    };

    addText('PROGRAMA ANALÍTICO DE ASIGNATURA', { bold: true, size: 14 });
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(40, y, 555, y);
    y += 20;

    doc.autoTable({
      startY: y,
      head: [['ASIGNATURA', formData.asignatura || 'N/A', 'PERIODO ACADÉMICO ORDINARIO (PAO)', formData.periodo || 'N/A']],
      body: [
        ['', '', 'NIVEL', formData.nivel || 'N/A'],
        ['CARACTERIZACIÓN', { content: formData.caracterizacion || 'N/A', colSpan: 3 }],
        ['OBJETIVOS DE LA ASIGNATURA', { content: formData.objetivos || 'N/A', colSpan: 3 }],
        ['COMPETENCIAS', { content: formData.competencias || 'N/A', colSpan: 3 }],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 87, 184], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 175 },
        2: { cellWidth: 120 },
        3: { cellWidth: 175 },
      },
    });
    y = doc.lastAutoTable.finalY + 20;

    addText('RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA', { bold: true, size: 12 });
    addText(`Actitudinales (valores y habilidades blandas): ${formData.resultados.actitudinales || 'N/A'}`);
    addText(`Cognitivos: ${formData.resultados.cognitivos || 'N/A'}`);
    addText(`Procedimentales: ${formData.resultados.procedimentales || 'N/A'}`);
    y += 10;

    addText('CONTENIDOS DE LA ASIGNATURA', { bold: true, size: 12 });
    doc.autoTable({
      startY: y,
      head: [['UNIDADES TEMÁTICAS', 'DESCRIPCIÓN']],
      body: formData.unidades.map((unidad) => [unidad.nombre || 'N/A', unidad.descripcion || 'N/A']),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 87, 184], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 445 } },
    });
    y = doc.lastAutoTable.finalY + 20;

    addText('METODOLOGÍA', { bold: true, size: 12 });
    addText(formData.metodologia || 'N/A');
    y += 10;

    addText('PROCEDIMIENTOS DE EVALUACIÓN', { bold: true, size: 12 });
    addText(`Valores en:`);
    addText(`Docencia: ${formData.procedimientos.docencia || '____'}`);
    addText(`Prácticas Formativas de Aplicación y Experimentación: ${formData.procedimientos.practicas || '____'}`);
    addText(`Trabajo Autónomo: ${formData.procedimientos.autonomo || '____'}`);
    addText(`Examen: ${formData.procedimientos.examen || '4'}`);
    y += 10;

    addText('BIBLIOGRAFÍA - FUENTES DE CONSULTA', { bold: true, size: 12 });
    addText('BIBLIOGRAFÍA BÁSICA', { bold: true });
    formData.bibliografia.basica.forEach((item, index) => addText(`- B.B.${index + 1}. ${item || ''}`));
    addText('BIBLIOGRAFÍA COMPLEMENTARIA', { bold: true });
    formData.bibliografia.complementaria.forEach((item, index) => addText(`- B.C.${index + 1}. ${item || ''}`));
    y += 10;

    addText('VISADO:', { bold: true, size: 12 });
    doc.autoTable({
      startY: y,
      head: [['DECANO/A DE FACULTAD', 'DIRECTOR/A ACADÉMICO/A', 'COORDINADOR/A DE CARRERA', 'DOCENTE']],
      body: [
        [
          { content: formData.visado.decano || '', image: qrCodes.decano, imageWidth: 80, imageHeight: 80 },
          { content: formData.visado.director || '', image: qrCodes.director, imageWidth: 80, imageHeight: 80 },
          { content: formData.visado.coordinador || '', image: qrCodes.coordinador, imageWidth: 80, imageHeight: 80 },
          { content: formData.visado.docente || '', image: qrCodes.docente, imageWidth: 80, imageHeight: 80 },
        ],
        [
          `Fecha: ${formData.visado.fechas.decano || startDatesDB[formData.periodo] || 'N/A'}`,
          `Fecha: ${formData.visado.fechas.director || startDatesDB[formData.periodo] || 'N/A'}`,
          `Fecha: ${formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || 'N/A'}`,
          `Fecha: ${formData.visado.fechas.docente || startDatesDB[formData.periodo] || 'N/A'}`,
        ],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 87, 184], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 149 }, 1: { cellWidth: 149 }, 2: { cellWidth: 149 }, 3: { cellWidth: 149 } },
    });

    doc.save(`${formData.asignatura}_syllabus.pdf`);
    setError('');
  };

  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (jsonData.asignatura !== selectedSubject && selectedSubject) {
          setError('La asignatura del JSON no coincide con la seleccionada.');
          return;
        }
        setFormData(jsonData);
        setError('');
      } catch (err) {
        setError('Error al cargar el archivo JSON.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const renderPreview = () => (
    <div className="syllabus-container p-4">
      <div className="card shadow-lg">
        <div className="card-header text-white text-center">
          <h2 className="mb-0">Programa Analítico de Asignatura</h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-hover">
              <tbody>
                <tr className="table-primary">
                  <th scope="row" className="w-25">Asignatura</th>
                  <td className="w-25">{formData.asignatura || 'N/A'}</td>
                  <th className="w-25">Periodo Académico (PAO)</th>
                  <td className="w-25">{formData.periodo || 'N/A'}</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <th>Nivel</th>
                  <td>{formData.nivel || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Caracterización</th>
                  <td colSpan={3}>{formData.caracterizacion || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Objetivos de la Asignatura</th>
                  <td colSpan={3}>{formData.objetivos || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Competencias</th>
                  <td colSpan={3}>{formData.competencias || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-4 mb-3">Resultados de Aprendizaje</h3>
          <ul className="list-group mb-4">
            <li className="list-group-item"><strong>Actitudinales (valores y habilidades blandas):</strong> {formData.resultados.actitudinales || 'N/A'}</li>
            <li className="list-group-item"><strong>Cognitivos:</strong> {formData.resultados.cognitivos || 'N/A'}</li>
            <li className="list-group-item"><strong>Procedimentales:</strong> {formData.resultados.procedimentales || 'N/A'}</li>
          </ul>

          <h3 className="mt-4 mb-3">Contenidos de la Asignatura</h3>
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-hover">
              <thead className="table-primary">
                <tr>
                  <th className="w-25">Unidades Temáticas</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {formData.unidades.map((unidad, index) => (
                  <tr key={index}>
                    <td>{unidad.nombre || 'N/A'}</td>
                    <td>{unidad.descripcion || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-4 mb-3">Metodología</h3>
          <p className="mb-4">{formData.metodologia || 'N/A'}</p>

          <h3 className="mt-4 mb-3">Procedimientos de Evaluación</h3>
          <ul className="list-group mb-4">
            <li className="list-group-item"><strong>Valores en:</strong></li>
            <li className="list-group-item"><strong>Docencia:</strong> {formData.procedimientos.docencia || '____'}</li>
            <li className="list-group-item"><strong>Prácticas Formativas de Aplicación y Experimentación:</strong> {formData.procedimientos.practicas || '____'}</li>
            <li className="list-group-item"><strong>Trabajo Autónomo:</strong> {formData.procedimientos.autonomo || '____'}</li>
            <li className="list-group-item"><strong>Examen:</strong> {formData.procedimientos.examen || '4'}</li>
          </ul>

          <h3 className="mt-4 mb-3">Bibliografía - Fuentes de Consulta</h3>
          <div className="row">
            <div className="col-md-6">
              <h4>Bibliografía Básica</h4>
              <ul className="list-group mb-4">
                {formData.bibliografia.basica.map((item, index) => (
                  <li key={index} className="list-group-item">{`- B.B.${index + 1}. ${item || ''}`}</li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <h4>Bibliografía Complementaria</h4>
              <ul className="list-group mb-4">
                {formData.bibliografia.complementaria.map((item, index) => (
                  <li key={index} className="list-group-item">{`- B.C.${index + 1}. ${item || ''}`}</li>
                ))}
              </ul>
            </div>
          </div>

          <h3 className="mt-4 mb-3">Visado</h3>
          <div className="visado-row">
            {['decano', 'director', 'coordinador', 'docente'].map((role) => (
              <div className="visado-col" key={role}>
                <h5 className="text-capitalize">{role}</h5>
                <img src={qrCodes[role]} alt={`QR ${role}`} className="visado-qr" />
                <p>{formData.visado[role] || 'N/A'}</p>
                <p>{formData.visado.fechas[role] || startDatesDB[formData.periodo] || 'N/A'}</p>
              </div>
            ))}
          </div>

          <button className="btn btn-primary mt-4" onClick={togglePreview}>
            <i className="bi bi-pencil-square me-2"></i>Editar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="syllabus-container p-4">
      {previewMode ? (
        renderPreview()
      ) : (
        <div className="card shadow-lg">
          <div className="card-header text-white text-center">
            <h2 className="mb-0">
              <i className="bi bi-book me-2"></i>Programa Analítico de Asignatura
            </h2>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                {error}
              </div>
            )}

            {/* Sección: Selección de Asignatura */}
            <div className="mb-4">
              <label className="form-label fw-bold">Seleccionar Asignatura</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setFormData((prev) => ({ ...prev, asignatura: e.target.value }));
                }}
              >
                <option value="">Seleccione una asignatura</option>
                {subjectsDB.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Sección: Cargar Archivos */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Cargar Documento Word</label>
                <input
                  type="file"
                  accept=".docx"
                  className="form-control"
                  onChange={handleFileUpload}
                />
                {fileName && (
                  <small className="form-text text-muted mt-2">
                    Archivo cargado: {fileName}
                  </small>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Cargar JSON</label>
                <input
                  type="file"
                  accept=".json"
                  className="form-control"
                  onChange={loadJSON}
                />
              </div>
            </div>
            
            {/* Información sobre la plantilla */}
            <div className="alert alert-info mb-4" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Información:</strong> Al exportar a Word, se utilizará la plantilla oficial "Anexo No. 1 Formato Programa Analítico.docx" 
              ubicada en la carpeta pública. Los datos del formulario se insertarán automáticamente en la plantilla.
            </div>

            {/* Sección: Datos Principales */}
            <div className="mb-4">
              <h3 className="mb-3">Datos Principales</h3>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Asignatura</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.asignatura}
                    onChange={(e) => handleInputChange(e, null, 'asignatura')}
                    readOnly={!!selectedSubject}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Periodo Académico (PAO)</label>
                  <select
                    className="form-select"
                    value={formData.periodo}
                    onChange={(e) => handleInputChange(e, null, 'periodo')}
                  >
                    <option value="">Seleccione un periodo</option>
                    {periodsDB.map((period) => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Nivel</label>
                  <select
                    className="form-select"
                    value={formData.nivel}
                    onChange={(e) => handleInputChange(e, null, 'nivel')}
                  >
                    <option value="">Seleccione un nivel</option>
                    {levelsDB.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Caracterización, Objetivos, Competencias */}
            <div className="mb-4">
              <h3 className="mb-3">Descripción General</h3>
              <div className="mb-3">
                <label className="form-label fw-bold">Caracterización</label>
                <textarea
                  className="form-control"
                  value={formData.caracterizacion}
                  onChange={(e) => handleInputChange(e, null, 'caracterizacion')}
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Objetivos de la Asignatura</label>
                <textarea
                  className="form-control"
                  value={formData.objetivos}
                  onChange={(e) => handleInputChange(e, null, 'objetivos')}
                  rows="4"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Competencias</label>
                <textarea
                  className="form-control"
                  value={formData.competencias}
                  onChange={(e) => handleInputChange(e, null, 'competencias')}
                  rows="4"
                />
              </div>
            </div>

            {/* Sección: Resultados de Aprendizaje */}
            <div className="mb-4">
              <h3 className="mb-3">Resultados de Aprendizaje</h3>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Actitudinales (valores y habilidades blandas)</label>
                  <textarea
                    className="form-control"
                    value={formData.resultados.actitudinales}
                    onChange={(e) => handleInputChange(e, 'resultados', 'actitudinales')}
                    rows="3"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Cognitivos</label>
                  <textarea
                    className="form-control"
                    value={formData.resultados.cognitivos}
                    onChange={(e) => handleInputChange(e, 'resultados', 'cognitivos')}
                    rows="3"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Procedimentales</label>
                  <textarea
                    className="form-control"
                    value={formData.resultados.procedimentales}
                    onChange={(e) => handleInputChange(e, 'resultados', 'procedimentales')}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Unidades Temáticas */}
            <div className="mb-4">
              <h3 className="mb-3">Contenidos de la Asignatura</h3>
              {formData.unidades.map((unidad, index) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          value={unidad.nombre}
                          readOnly
                        />
                      </div>
                      <div className="col-md-8">
                        <textarea
                          className="form-control"
                          value={unidad.descripcion}
                          onChange={(e) => handleInputChange(e, 'unidades', 'descripcion', index)}
                          rows="2"
                        />
                      </div>
                      <div className="col-md-1 text-end">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeUnit(index)}
                          title="Eliminar Unidad"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-success" onClick={addUnit}>
                <i className="bi bi-plus-circle me-2"></i>Agregar Unidad
              </button>
            </div>

            {/* Sección: Metodología */}
            <div className="mb-4">
              <h3 className="mb-3">Metodología</h3>
              <textarea
                className="form-control"
                value={formData.metodologia}
                onChange={(e) => handleInputChange(e, null, 'metodologia')}
                rows="4"
              />
            </div>

            {/* Sección: Procedimientos de Evaluación */}
            <div className="mb-4">
              <h3 className="mb-3">Procedimientos de Evaluación</h3>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Docencia</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.procedimientos.docencia}
                    onChange={(e) => handleInputChange(e, 'procedimientos', 'docencia')}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Prácticas Formativas de Aplicación y Experimentación</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.procedimientos.practicas}
                    onChange={(e) => handleInputChange(e, 'procedimientos', 'practicas')}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Trabajo Autónomo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.procedimientos.autonomo}
                    onChange={(e) => handleInputChange(e, 'procedimientos', 'autonomo')}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Examen</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.procedimientos.examen}
                    onChange={(e) => handleInputChange(e, 'procedimientos', 'examen')}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Bibliografía */}
            <div className="mb-4">
              <h3 className="mb-3">Bibliografía - Fuentes de Consulta</h3>
              <div className="row">
                <div className="col-md-6">
                  <h4>Bibliografía Básica</h4>
                  {formData.bibliografia.basica.map((item, index) => (
                    <div key={index} className="input-group mb-2">
                      <select
                        className="form-select"
                        value={item}
                        onChange={(e) => handleInputChange(e, 'bibliografia', 'basica', index)}
                      >
                        <option value="">Seleccione una referencia</option>
                        {bibliographyDB.basica.map((ref) => (
                          <option key={ref} value={ref}>{ref}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => addBibliography('basica')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Agregar Referencia
                  </button>
                </div>
                <div className="col-md-6">
                  <h4>Bibliografía Complementaria</h4>
                  {formData.bibliografia.complementaria.map((item, index) => (
                    <div key={index} className="input-group mb-2">
                      <select
                        className="form-select"
                        value={item}
                        onChange={(e) => handleInputChange(e, 'bibliografia', 'complementaria', index)}
                      >
                        <option value="">Seleccione una referencia</option>
                        {bibliographyDB.complementaria.map((ref) => (
                          <option key={ref} value={ref}>{ref}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => addBibliography('complementaria')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Agregar Referencia
                  </button>
                </div>
              </div>
            </div>

            {/* Sección: Visado */}
            <div className="mb-4">
              <h3 className="mb-3">Visado</h3>
              <div className="visado-row">
                {['decano', 'director', 'coordinador', 'docente'].map((role) => (
                  <div className="visado-col" key={role}>
                    <h5 className="text-capitalize">{role}</h5>
                    <img src={qrCodes[role]} alt={`QR ${role}`} className="visado-qr" />
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={formData.visado[role] || ''}
                      onChange={(e) => handleInputChange(e, 'visado', role)}
                      placeholder={`Nombre del ${role}`}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={formData.visado.fechas[role] || startDatesDB[formData.periodo] || ''}
                      onChange={(e) => handleInputChange(e, 'visado.fechas', role)}
                      placeholder="Fecha"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-primary" onClick={exportToJSON}>
                <i className="bi bi-file-earmark-code me-2"></i>Exportar a JSON
              </button>
              <button 
                className="btn btn-success" 
                onClick={exportToWord}
                disabled={isLoadingWord}
              >
                {isLoadingWord ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-word me-2"></i>Exportar a Word
                  </>
                )}
              </button>
              <button className="btn btn-success" onClick={exportToPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Exportar a PDF
              </button>
              <button className="btn btn-secondary" onClick={togglePreview}>
                <i className="bi bi-eye me-2"></i>Previsualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDocente;
