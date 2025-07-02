import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import mammoth from 'mammoth';
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

  useEffect(() => {
    const generateQRCodes = async () => {
      const roles = ['decano', 'director', 'coordinador', 'docente'];
      const qrData = {};
      for (const role of roles) {
        const qrText = `Firma ${role} para ${formData.asignatura} - ${formData.periodo}`;
        try {
          const qrUrl = await QRCode.toDataURL(qrText);
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
            descripcion: unitText.trim(),
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
    } catch (err) {
      // No mostrar error, solo no hacer nada
      console.error(err);
    }
  };

  const exportToJSON = () => {
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'syllabus.json');
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'PROGRAMA ANALÍTICO DE ASIGNATURA', bold: true, size: 28 })],
              alignment: 'center',
              spacing: { after: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'single', size: 4 },
                bottom: { style: 'single', size: 4 },
                left: { style: 'single', size: 4 },
                right: { style: 'single', size: 4 },
                insideHorizontal: { style: 'single', size: 4 },
                insideVertical: { style: 'single', size: 4 },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'ASIGNATURA', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.asignatura)],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'PERIODO ACADÉMICO ORDINARIO (PAO)', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.periodo)],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [new Paragraph({ text: 'NIVEL', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.nivel)],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'CARACTERIZACIÓN', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.caracterizacion)],
                      columnSpan: 3,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'OBJETIVOS DE LA ASIGNATURA', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.objetivos)],
                      columnSpan: 3,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'COMPETENCIAS', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.competencias)],
                      columnSpan: 3,
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: 'RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Actitudinales: ${formData.resultados.actitudinales || 'N/A'}` })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Cognitivos: ${formData.resultados.cognitivos}` })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Procedimentales: ${formData.resultados.procedimentales}` })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: 'CONTENIDOS DE LA ASIGNATURA', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'single', size: 4 },
                bottom: { style: 'single', size: 4 },
                left: { style: 'single', size: 4 },
                right: { style: 'single', size: 4 },
                insideHorizontal: { style: 'single', size: 4 },
                insideVertical: { style: 'single', size: 4 },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'UNIDADES TEMÁTICAS', bold: true })],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'DESCRIPCIÓN', bold: true })],
                      width: { size: 70, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                ...formData.unidades.map((unidad) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(unidad.nombre)],
                      }),
                      new TableCell({
                        children: [new Paragraph(unidad.descripcion)],
                      }),
                    ],
                  })
                ),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: 'METODOLOGÍA', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.metodologia || 'N/A' })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: 'PROCEDIMIENTOS DE EVALUACIÓN', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Valores en:' }),
                new TextRun({ text: '\nDocencia: ' }),
                new TextRun({ text: formData.procedimientos.docencia || 'N/A' }),
                new TextRun({ text: '\nPrácticas Formativas de Aplicación y Experimentación: ' }),
                new TextRun({ text: formData.procedimientos.practicas || 'N/A' }),
                new TextRun({ text: '\nTrabajo Autónomo: ' }),
                new TextRun({ text: formData.procedimientos.autonomo || 'N/A' }),
                new TextRun({ text: '\nExamen: ' }),
                new TextRun({ text: formData.procedimientos.examen }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: 'BIBLIOGRAFÍA - FUENTES DE CONSULTA', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: 'BIBLIOGRAFÍA BÁSICA', bold: true })],
              spacing: { after: 200 },
            }),
            ...formData.bibliografia.basica.map((item) =>
              new Paragraph({
                children: [new TextRun({ text: item })],
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            ),
            new Paragraph({
              children: [new TextRun({ text: 'BIBLIOGRAFÍA COMPLEMENTARIA', bold: true })],
              spacing: { after: 200 },
            }),
            ...formData.bibliografia.complementaria.map((item) =>
              new Paragraph({
                children: [new TextRun({ text: item })],
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            ),
            new Paragraph({
              children: [new TextRun({ text: 'VISADO:', bold: true, size: 24 })],
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: 'single', size: 4 },
                bottom: { style: 'single', size: 4 },
                left: { style: 'single', size: 4 },
                right: { style: 'single', size: 4 },
                insideHorizontal: { style: 'single', size: 4 },
                insideVertical: { style: 'single', size: 4 },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'DECANO/A DE FACULTAD', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'DIRECTOR/A ACADÉMICO/A', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'COORDINADOR/A DE CARRERA', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'DOCENTE', bold: true })],
                      width: { size: 25, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: '',
                          children: [
                            new ImageRun({
                              data: qrCodes.decano,
                              transformation: { width: 100, height: 100 },
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: '',
                          children: [
                            new ImageRun({
                              data: qrCodes.director,
                              transformation: { width: 100, height: 100 },
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: '',
                          children: [
                            new ImageRun({
                              data: qrCodes.coordinador,
                              transformation: { width: 100, height: 100 },
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: '',
                          children: [
                            new ImageRun({
                              data: qrCodes.docente,
                              transformation: { width: 100, height: 100 },
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Fecha:', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.visado.fechas.decano || startDatesDB[formData.periodo] || '')],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Fecha:', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.visado.fechas.director || startDatesDB[formData.periodo] || '')],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Fecha:', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph(formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || '')],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }),
                    new TableCell({ children: [] }),
                    new TableCell({
                      children: [new Paragraph(formData.visado.fechas.docente || startDatesDB[formData.periodo] || '')],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'syllabus.docx');
    });
  };

  const exportToPDF = () => {
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
      head: [['ASIGNATURA', formData.asignatura, 'PERIODO ACADÉMICO ORDINARIO (PAO)', formData.periodo]],
      body: [
        ['', '', 'NIVEL', formData.nivel],
        ['CARACTERIZACIÓN', { content: formData.caracterizacion, colSpan: 3 }],
        ['OBJETIVOS DE LA ASIGNATURA', { content: formData.objetivos, colSpan: 3 }],
        ['COMPETENCIAS', { content: formData.competencias, colSpan: 3 }],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 175 },
        2: { cellWidth: 120 },
        3: { cellWidth: 175 },
      },
    });
    y = doc.lastAutoTable.finalY + 20;

    addText('RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA', { bold: true, size: 12 });
    addText(`Actitudinales: ${formData.resultados.actitudinales || 'N/A'}`);
    addText(`Cognitivos: ${formData.resultados.cognitivos}`);
    addText(`Procedimentales: ${formData.resultados.procedimentales}`);
    y += 10;

    addText('CONTENIDOS DE LA ASIGNATURA', { bold: true, size: 12 });
    doc.autoTable({
      startY: y,
      head: [['UNIDADES TEMÁTICAS', 'DESCRIPCIÓN']],
      body: formData.unidades.map((unidad) => [unidad.nombre, unidad.descripcion]),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 445 } },
    });
    y = doc.lastAutoTable.finalY + 20;

    addText('METODOLOGÍA', { bold: true, size: 12 });
    addText(formData.metodologia || 'N/A');
    y += 10;

    addText('PROCEDIMIENTOS DE EVALUACIÓN', { bold: true, size: 12 });
    addText(`Docencia: ${formData.procedimientos.docencia || 'N/A'}`);
    addText(`Prácticas Formativas: ${formData.procedimientos.practicas || 'N/A'}`);
    addText(`Trabajo Autónomo: ${formData.procedimientos.autonomo || 'N/A'}`);
    addText(`Examen: ${formData.procedimientos.examen}`);
    y += 10;

    addText('BIBLIOGRAFÍA - FUENTES DE CONSULTA', { bold: true, size: 12 });
    addText('BIBLIOGRAFÍA BÁSICA', { bold: true });
    formData.bibliografia.basica.forEach((item) => addText(`- ${item}`));
    addText('BIBLIOGRAFÍA COMPLEMENTARIA', { bold: true });
    formData.bibliografia.complementaria.forEach((item) => addText(`- ${item}`));
    y += 10;

    addText('VISADO:', { bold: true, size: 12 });
    doc.autoTable({
      startY: y,
      head: [['DECANO/A', 'DIRECTOR/A ACADÉMICO/A', 'COORDINADOR/A DE CARRERA', 'DOCENTE']],
      body: [
        [
          { content: '', image: qrCodes.decano, imageWidth: 80, imageHeight: 80 },
          { content: '', image: qrCodes.director, imageWidth: 80, imageHeight: 80 },
          { content: '', image: qrCodes.coordinador, imageWidth: 80, imageHeight: 80 },
          { content: '', image: qrCodes.docente, imageWidth: 80, imageHeight: 80 },
        ],
        ['Fecha:', formData.visado.fechas.decano || startDatesDB[formData.periodo] || '', 'Fecha:', formData.visado.fechas.director || startDatesDB[formData.periodo] || ''],
        ['', '', 'Fecha:', formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || ''],
        ['', '', '', formData.visado.fechas.docente || startDatesDB[formData.periodo] || ''],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [200, 200, 200], fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 149 }, 1: { cellWidth: 149 }, 2: { cellWidth: 149 }, 3: { cellWidth: 149 } },
    });

    doc.save('syllabus.pdf');
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const loadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (jsonData.asignatura !== selectedSubject) {
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

  const renderPreview = () => (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-xl shadow-lg text-black">
      <h1 className="text-3xl font-bold text-center mb-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>PROGRAMA ANALÍTICO DE ASIGNATURA</h1>
      <table className="w-full border-collapse mb-6 bg-white rounded-lg overflow-hidden shadow-md">
        <tbody>
          <tr className="bg-gray-100">
            <td className="border border-gray-300 p-4 font-semibold text-gray-700 w-1/4">ASIGNATURA</td>
            <td className="border border-gray-300 p-4 w-1/4 text-black">{formData.asignatura}</td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700 w-1/4">PERIODO ACADÉMICO ORDINARIO (PAO)</td>
            <td className="border border-gray-300 p-4 w-1/4 text-black">{formData.periodo}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">NIVEL</td>
            <td className="border border-gray-300 p-4 text-black">{formData.nivel}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">CARACTERIZACIÓN</td>
            <td className="border border-gray-300 p-4 text-black" colSpan={3}>{formData.caracterizacion}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">OBJETIVOS DE LA ASIGNATURA</td>
            <td className="border border-gray-300 p-4 text-black" colSpan={3}>{formData.objetivos}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">COMPETENCIAS</td>
            <td className="border border-gray-300 p-4 text-black" colSpan={3}>{formData.competencias}</td>
          </tr>
        </tbody>
      </table>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA</h2>
      <p className="mb-2"><strong>Actitudinales:</strong> <span className="text-black">{formData.resultados.actitudinales || 'N/A'}</span></p>
      <p className="mb-2"><strong>Cognitivos:</strong> <span className="text-black">{formData.resultados.cognitivos}</span></p>
      <p className="mb-2"><strong>Procedimentales:</strong> <span className="text-black">{formData.resultados.procedimentales}</span></p>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>CONTENIDOS DE LA ASIGNATURA</h2>
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-4 text-gray-700 w-1/3">UNIDADES TEMÁTICAS</th>
            <th className="border border-gray-300 p-4 text-gray-700 w-2/3">DESCRIPCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {formData.unidades.map((unidad, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="border border-gray-300 p-4 text-black">{unidad.nombre}</td>
              <td className="border border-gray-300 p-4 text-black">{unidad.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>METODOLOGÍA</h2>
      <p className="mb-4 text-black">{formData.metodologia || 'N/A'}</p>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>PROCEDIMIENTOS DE EVALUACIÓN</h2>
      <p className="mb-2"><strong>Docencia:</strong> <span className="text-black">{formData.procedimientos.docencia || 'N/A'}</span></p>
      <p className="mb-2"><strong>Prácticas Formativas:</strong> <span className="text-black">{formData.procedimientos.practicas || 'N/A'}</span></p>
      <p className="mb-2"><strong>Trabajo Autónomo:</strong> <span className="text-black">{formData.procedimientos.autonomo || 'N/A'}</span></p>
      <p className="mb-2"><strong>Examen:</strong> <span className="text-black">{formData.procedimientos.examen}</span></p>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>BIBLIOGRAFÍA - FUENTES DE CONSULTA</h2>
      <p className="font-semibold mb-2" style={{ color: 'var(--color-primary, #2E7D32)' }}>BIBLIOGRAFÍA BÁSICA</p>
      <ul className="list-disc list-inside mb-4 pl-5">
        {formData.bibliografia.basica.map((item, index) => (
          <li key={index} className="mb-1 text-black">{item}</li>
        ))}
      </ul>
      <p className="font-semibold mb-2" style={{ color: 'var(--color-primary, #2E7D32)' }}>BIBLIOGRAFÍA COMPLEMENTARIA</p>
      <ul className="list-disc list-inside mb-4 pl-5">
        {formData.bibliografia.complementaria.map((item, index) => (
          <li key={index} className="mb-1 text-black">{item}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold mb-4 mt-6 futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>VISADO:</h2>
      <div className="visado-row">
        {['decano', 'director', 'coordinador', 'docente'].map((role) => (
          <div className="visado-col" key={role}>
            <div className="visado-nombre futuristic-label" style={{ color: 'var(--color-primary, #2E7D32)' }}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>
            <img
              src={qrCodes[role]}
              alt={`QR ${role}`}
              className="visado-qr futuristic-qr"
              width="80"
            />
            <div className="visado-nombre-preview text-black">{formData.visado[role]}</div>
            <div className="visado-fecha-preview text-black">{formData.visado.fechas[role] || startDatesDB[formData.periodo] || ''}</div>
          </div>
        ))}
      </div>
      <button
        onClick={togglePreview}
        className="mt-6 futuristic-btn"
      >
        Editar
      </button>
    </div>
  );

  return (
    <div className="board-docente-container">
      {previewMode ? (
        renderPreview()
      ) : (
        <div className="board-docente-card">
          <h1 className="board-docente-title">
            <span className="material-icons board-docente-icon">menu_book</span>
            PROGRAMA ANALÍTICO DE ASIGNATURA
          </h1>
          {/* Sección: Selección de Asignatura */}
          <div className="board-docente-section">
            <label className="board-docente-label">
              Seleccionar Asignatura
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="board-docente-select"
            >
              <option value="">Seleccione una asignatura</option>
              {subjectsDB.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          {/* Sección: Cargar Word */}
          <div className="board-docente-section">
            <label className="board-docente-label">
              Cargar Documento Word
            </label>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="board-docente-input"
            />
            {fileName && (
              <div className="board-docente-file-info">
                Archivo cargado: {fileName}
              </div>
            )}
          </div>
          {/* Sección: Cargar JSON */}
          <div className="board-docente-section">
            <label className="board-docente-label">
              Cargar JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={loadJSON}
              className="board-docente-input"
            />
          </div>
          {/* Sección: Datos principales */}
          <div className="board-docente-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="board-docente-label">Asignatura</label>
                <input
                  type="text"
                  value={formData.asignatura}
                  onChange={(e) => handleInputChange(e, null, 'asignatura')}
                  className="board-docente-input"
                  readOnly={!!selectedSubject}
                />
              </div>
              <div>
                <label className="board-docente-label">Periodo Académico Ordinario (PAO)</label>
                <select
                  value={formData.periodo}
                  onChange={(e) => handleInputChange(e, null, 'periodo')}
                  className="board-docente-select"
                >
                  <option value="">Seleccione un periodo</option>
                  {periodsDB.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="board-docente-label">Nivel</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => handleInputChange(e, null, 'nivel')}
                  className="board-docente-select"
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
          <div className="board-docente-section">
            <label className="board-docente-label">Caracterización</label>
            <textarea
              value={formData.caracterizacion}
              onChange={(e) => handleInputChange(e, null, 'caracterizacion')}
              className="board-docente-textarea"
              rows="3"
            />
            <label className="board-docente-label">Objetivos de la Asignatura</label>
            <textarea
              value={formData.objetivos}
              onChange={(e) => handleInputChange(e, null, 'objetivos')}
              className="board-docente-textarea"
              rows="3"
            />
            <label className="board-docente-label">Competencias</label>
            <textarea
              value={formData.competencias}
              onChange={(e) => handleInputChange(e, null, 'competencias')}
              className="board-docente-textarea"
              rows="3"
            />
          </div>
          {/* Sección: Resultados de Aprendizaje */}
          <div className="board-docente-section">
            <label className="board-docente-label">Resultados de Aprendizaje</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="board-docente-label">Actitudinales</label>
                <textarea
                  value={formData.resultados.actitudinales}
                  onChange={(e) => handleInputChange(e, 'resultados', 'actitudinales')}
                  className="board-docente-textarea"
                  rows="2"
                />
              </div>
              <div>
                <label className="board-docente-label">Cognitivos</label>
                <textarea
                  value={formData.resultados.cognitivos}
                  onChange={(e) => handleInputChange(e, 'resultados', 'cognitivos')}
                  className="board-docente-textarea"
                  rows="2"
                />
              </div>
              <div>
                <label className="board-docente-label">Procedimentales</label>
                <textarea
                  value={formData.resultados.procedimentales}
                  onChange={(e) => handleInputChange(e, 'resultados', 'procedimentales')}
                  className="board-docente-textarea"
                  rows="2"
                />
              </div>
            </div>
          </div>
          {/* Sección: Unidades Temáticas */}
          <div className="board-docente-section">
            <label className="board-docente-label">Contenidos de la Asignatura</label>
            {formData.unidades.map((unidad, index) => (
              <div key={index} className="board-docente-unidad">
                <input
                  type="text"
                  value={unidad.nombre}
                  readOnly
                  className="board-docente-input"
                />
                <textarea
                  value={unidad.descripcion}
                  onChange={(e) => handleInputChange(e, 'unidades', 'descripcion', index)}
                  className="board-docente-textarea"
                  rows="2"
                />
                <button
                  type="button"
                  onClick={() => removeUnit(index)}
                  className="board-docente-btn board-docente-btn-danger futuristic-btn"
                  title="Eliminar Unidad"
                >
                  <span className="material-icons board-docente-icon">delete</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addUnit}
              className="board-docente-btn futuristic-btn"
            >
              Agregar Unidad
            </button>
          </div>
          {/* Sección: Metodología */}
          <div className="board-docente-section">
            <label className="board-docente-label">Metodología</label>
            <textarea
              value={formData.metodologia}
              onChange={(e) => handleInputChange(e, null, 'metodologia')}
              className="board-docente-textarea"
              rows="3"
            />
          </div>
          {/* Sección: Procedimientos de Evaluación */}
          <div className="board-docente-section">
            <label className="board-docente-label">Procedimientos de Evaluación</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="board-docente-label">Docencia</label>
                <input
                  type="text"
                  value={formData.procedimientos.docencia}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'docencia')}
                  className="board-docente-input"
                />
              </div>
              <div>
                <label className="board-docente-label">Prácticas Formativas</label>
                <input
                  type="text"
                  value={formData.procedimientos.practicas}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'practicas')}
                  className="board-docente-input"
                />
              </div>
              <div>
                <label className="board-docente-label">Trabajo Autónomo</label>
                <input
                  type="text"
                  value={formData.procedimientos.autonomo}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'autonomo')}
                  className="board-docente-input"
                />
              </div>
              <div>
                <label className="board-docente-label">Examen</label>
                <input
                  type="text"
                  value={formData.procedimientos.examen}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'examen')}
                  className="board-docente-input"
                />
              </div>
            </div>
          </div>
          {/* Sección: Bibliografía */}
          <div className="board-docente-section">
            <label className="board-docente-label">Bibliografía - Fuentes de Consulta</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="board-docente-label">Básica</label>
                {formData.bibliografia.basica.map((item, index) => (
                  <select
                    key={index}
                    value={item}
                    onChange={(e) => handleInputChange(e, 'bibliografia', 'basica', index)}
                    className="board-docente-select"
                  >
                    <option value="">Seleccione una referencia</option>
                    {bibliographyDB.basica.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                ))}
                <button
                  type="button"
                  onClick={() => addBibliography('basica')}
                  className="board-docente-btn futuristic-btn"
                >
                  Agregar Referencia
                </button>
              </div>
              <div>
                <label className="board-docente-label">Complementaria</label>
                {formData.bibliografia.complementaria.map((item, index) => (
                  <select
                    key={index}
                    value={item}
                    onChange={(e) => handleInputChange(e, 'bibliografia', 'complementaria', index)}
                    className="board-docente-select"
                  >
                    <option value="">Seleccione una referencia</option>
                    {bibliographyDB.complementaria.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                ))}
                <button
                  type="button"
                  onClick={() => addBibliography('complementaria')}
                  className="board-docente-btn futuristic-btn"
                >
                  Agregar Referencia
                </button>
              </div>
            </div>
          </div>
          {/* Sección: Visado */}
          <div className="board-docente-section visado-grid-futuristic">
            <label className="board-docente-label">Visado</label>
            <div className="visado-row">
              {['decano', 'director', 'coordinador', 'docente'].map((role) => (
                <div className="visado-col" key={role}>
                  <div className="visado-nombre futuristic-label">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                  <img
                    src={qrCodes[role]}
                    alt={`QR ${role}`}
                    className="visado-qr futuristic-qr"
                    width="80"
                  />
                  <input
                    type="text"
                    value={formData.visado[role] || ''}
                    onChange={(e) => handleInputChange(e, 'visado', role)}
                    className="board-docente-input visado-input"
                    placeholder={`Nombre del ${role}`}
                  />
                  <input
                    type="text"
                    value={formData.visado.fechas[role] || startDatesDB[formData.periodo] || ''}
                    onChange={(e) => handleInputChange(e, 'visado.fechas', role)}
                    className="board-docente-input visado-input"
                    placeholder="Fecha"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Botones de acción */}
          <div className="futuristic-btn-group">
            <button
              type="button"
              onClick={exportToJSON}
              className="board-docente-btn futuristic-btn"
            >
              <span className="material-icons board-docente-icon">download</span>
              Exportar a JSON
            </button>
            <button
              type="button"
              onClick={exportToWord}
              className="board-docente-btn futuristic-btn"
            >
              <span className="material-icons board-docente-icon">description</span>
              Exportar a Word
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="board-docente-btn futuristic-btn"
            >
              <span className="material-icons board-docente-icon">picture_as_pdf</span>
              Exportar a PDF
            </button>
            <button
              type="button"
              onClick={togglePreview}
              className="board-docente-btn futuristic-btn"
            >
              <span className="material-icons board-docente-icon">visibility</span>
              Previsualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDocente;