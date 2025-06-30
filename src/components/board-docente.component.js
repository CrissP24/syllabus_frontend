import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import mammoth from 'mammoth';

const BoardDocente = () => {
  const subjectsDB = [
    "Fundamentos de Programación",
    "",
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
      if (parsedData.asignatura !== selectedSubject) {
        setError('La asignatura del documento no coincide con la seleccionada.');
        return;
      }

      setError('');
      setFormData(parsedData);
    } catch (err) {
      setError('Error al procesar el documento.');
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">PROGRAMA ANALÍTICO DE ASIGNATURA</h1>
      <table className="w-full border-collapse mb-6 bg-white rounded-lg overflow-hidden shadow-md">
        <tbody>
          <tr className="bg-gray-100">
            <td className="border border-gray-300 p-4 font-semibold text-gray-700 w-1/4">ASIGNATURA</td>
            <td className="border border-gray-300 p-4 w-1/4">{formData.asignatura}</td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700 w-1/4">PERIODO ACADÉMICO ORDINARIO (PAO)</td>
            <td className="border border-gray-300 p-4 w-1/4">{formData.periodo}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">NIVEL</td>
            <td className="border border-gray-300 p-4">{formData.nivel}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">CARACTERIZACIÓN</td>
            <td className="border border-gray-300 p-4" colSpan={3}>{formData.caracterizacion}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">OBJETIVOS DE LA ASIGNATURA</td>
            <td className="border border-gray-300 p-4" colSpan={3}>{formData.objetivos}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">COMPETENCIAS</td>
            <td className="border border-gray-300 p-4" colSpan={3}>{formData.competencias}</td>
          </tr>
        </tbody>
      </table>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA</h2>
      <p className="text-gray-700 mb-2"><strong>Actitudinales:</strong> {formData.resultados.actitudinales || 'N/A'}</p>
      <p className="text-gray-700 mb-2"><strong>Cognitivos:</strong> {formData.resultados.cognitivos}</p>
      <p className="text-gray-700 mb-2"><strong>Procedimentales:</strong> {formData.resultados.procedimentales}</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">CONTENIDOS DE LA ASIGNATURA</h2>
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
              <td className="border border-gray-300 p-4">{unidad.nombre}</td>
              <td className="border border-gray-300 p-4">{unidad.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">METODOLOGÍA</h2>
      <p className="text-gray-700 mb-4">{formData.metodologia || 'N/A'}</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">PROCEDIMIENTOS DE EVALUACIÓN</h2>
      <p className="text-gray-700 mb-2"><strong>Docencia:</strong> {formData.procedimientos.docencia || 'N/A'}</p>
      <p className="text-gray-700 mb-2"><strong>Prácticas Formativas:</strong> {formData.procedimientos.practicas || 'N/A'}</p>
      <p className="text-gray-700 mb-2"><strong>Trabajo Autónomo:</strong> {formData.procedimientos.autonomo || 'N/A'}</p>
      <p className="text-gray-700 mb-2"><strong>Examen:</strong> {formData.procedimientos.examen}</p>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">BIBLIOGRAFÍA - FUENTES DE CONSULTA</h2>
      <p className="text-gray-700 font-semibold mb-2">BIBLIOGRAFÍA BÁSICA</p>
      <ul className="list-disc list-inside text-gray-700 mb-4 pl-5">
        {formData.bibliografia.basica.map((item, index) => (
          <li key={index} className="mb-1">{item}</li>
        ))}
      </ul>
      <p className="text-gray-700 font-semibold mb-2">BIBLIOGRAFÍA COMPLEMENTARIA</p>
      <ul className="list-disc list-inside text-gray-700 mb-4 pl-5">
        {formData.bibliografia.complementaria.map((item, index) => (
          <li key={index} className="mb-1">{item}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6">VISADO:</h2>
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-4 text-gray-700">DECANO/A</th>
            <th className="border border-gray-300 p-4 text-gray-700">DIRECTOR/A ACADÉMICO/A</th>
            <th className="border border-gray-300 p-4 text-gray-700">COORDINADOR/A DE CARRERA</th>
            <th className="border border-gray-300 p-4 text-gray-700">DOCENTE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-4"><img src={qrCodes.decano} alt="QR Decano" width="80" /></td>
            <td className="border border-gray-300 p-4"><img src={qrCodes.director} alt="QR Director" width="80" /></td>
            <td className="border border-gray-300 p-4"><img src={qrCodes.coordinador} alt="QR Coordinador" width="80" /></td>
            <td className="border border-gray-300 p-4"><img src={qrCodes.docente} alt="QR Docente" width="80" /></td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">Fecha:</td>
            <td className="border border-gray-300 p-4">{formData.visado.fechas.decano || startDatesDB[formData.periodo] || ''}</td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">Fecha:</td>
            <td className="border border-gray-300 p-4">{formData.visado.fechas.director || startDatesDB[formData.periodo] || ''}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4 font-semibold text-gray-700">Fecha:</td>
            <td className="border border-gray-300 p-4">{formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || ''}</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4"></td>
            <td className="border border-gray-300 p-4">{formData.visado.fechas.docente || startDatesDB[formData.periodo] || ''}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={togglePreview}
        className="mt-6 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition duration-300 transform hover:scale-105"
      >
        Editar
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {previewMode ? (
        renderPreview()
      ) : (
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-10 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">PROGRAMA ANALÍTICO DE ASIGNATURA</h1>
          {error && <p className="text-red-600 mb-6 text-center">{error}</p>}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Seleccionar Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Seleccione una asignatura</option>
              {subjectsDB.map((subject) => (
                <option key={subject} value={subject} className="py-2">{subject}</option>
              ))}
            </select>
          </div>
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Cargar Documento Word</label>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Cargar JSON</label>
            <input
              type="file"
              accept=".json"
              onChange={loadJSON}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div className="border-t-4 border-b-4 border-gray-200 py-6 mb-8 bg-gray-50 rounded-lg shadow-inner">
            <div className="grid grid-cols-4 gap-6 border border-gray-200 rounded-lg p-6 bg-white shadow-md">
              <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">ASIGNATURA</div>
              <div className="p-4">
                <input
                  type="text"
                  value={formData.asignatura}
                  onChange={(e) => handleInputChange(e, null, 'asignatura')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly={!!selectedSubject}
                />
              </div>
              <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">PERIODO ACADÉMICO ORDINARIO (PAO)</div>
              <div className="p-4">
                <select
                  value={formData.periodo}
                  onChange={(e) => handleInputChange(e, null, 'periodo')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione un periodo</option>
                  {periodsDB.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <div className="p-4"></div>
              <div className="p-4"></div>
              <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">NIVEL</div>
              <div className="p-4">
                <select
                  value={formData.nivel}
                  onChange={(e) => handleInputChange(e, null, 'nivel')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione un nivel</option>
                  {levelsDB.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 font-semibold text-gray-700 border-r border-t border-gray-200">CARACTERIZACIÓN</div>
              <div className="p-4 col-span-3 border-t border-gray-200">
                <textarea
                  value={formData.caracterizacion}
                  onChange={(e) => handleInputChange(e, null, 'caracterizacion')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
              </div>
              <div className="p-4 font-semibold text-gray-700 border-r border-t border-gray-200">OBJETIVOS DE LA ASIGNATURA</div>
              <div className="p-4 col-span-3 border-t border-gray-200">
                <textarea
                  value={formData.objetivos}
                  onChange={(e) => handleInputChange(e, null, 'objetivos')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="p-4 font-semibold text-gray-700 border-r border-t border-gray-200">COMPETENCIAS</div>
              <div className="p-4 col-span-3 border-t border-gray-200">
                <textarea
                  value={formData.competencias}
                  onChange={(e) => handleInputChange(e, null, 'competencias')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700">Actitudinales</label>
                <textarea
                  value={formData.resultados.actitudinales}
                  onChange={(e) => handleInputChange(e, 'resultados', 'actitudinales')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Cognitivos</label>
                <textarea
                  value={formData.resultados.cognitivos}
                  onChange={(e) => handleInputChange(e, 'resultados', 'cognitivos')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Procedimentales</label>
                <textarea
                  value={formData.resultados.procedimentales}
                  onChange={(e) => handleInputChange(e, 'resultados', 'procedimentales')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">CONTENIDOS DE LA ASIGNATURA</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <div className="grid grid-cols-3 gap-0 border-b border-gray-200 bg-gray-50">
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200 col-span-1">UNIDADES TEMÁTICAS</div>
                <div className="p-4 font-semibold text-gray-700 col-span-2">DESCRIPCIÓN</div>
              </div>
              {formData.unidades.map((unidad, index) => (
                <div key={index} className="grid grid-cols-3 gap-0 border-t border-gray-200 bg-white">
                  <div className="p-4 border-r border-gray-200">
                    <input
                      type="text"
                      value={unidad.nombre}
                      readOnly
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button
                      onClick={() => removeUnit(index)}
                      className="mt-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="p-4 col-span-2">
                    <textarea
                      value={unidad.descripcion}
                      onChange={(e) => handleInputChange(e, 'unidades', 'descripcion', index)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addUnit}
                className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Agregar Unidad
              </button>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">METODOLOGÍA</h2>
            <textarea
              value={formData.metodologia}
              onChange={(e) => handleInputChange(e, null, 'metodologia')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">PROCEDIMIENTOS DE EVALUACIÓN</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700">Docencia</label>
                <input
                  type="text"
                  value={formData.procedimientos.docencia}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'docencia')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Prácticas Formativas de Aplicación y Experimentación</label>
                <input
                  type="text"
                  value={formData.procedimientos.practicas}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'practicas')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Trabajo Autónomo</label>
                <input
                  type="text"
                  value={formData.procedimientos.autonomo}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'autonomo')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Examen</label>
                <input
                  type="text"
                  value={formData.procedimientos.examen}
                  onChange={(e) => handleInputChange(e, 'procedimientos', 'examen')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">BIBLIOGRAFÍA - FUENTES DE CONSULTA</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700">BIBLIOGRAFÍA BÁSICA</label>
                {formData.bibliografia.basica.map((item, index) => (
                  <select
                    key={index}
                    value={item}
                    onChange={(e) => handleInputChange(e, 'bibliografia', 'basica', index)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione una referencia</option>
                    {bibliographyDB.basica.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                ))}
                <button
                  onClick={() => addBibliography('basica')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Agregar Referencia
                </button>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700">BIBLIOGRAFÍA COMPLEMENTARIA</label>
                {formData.bibliografia.complementaria.map((item, index) => (
                  <select
                    key={index}
                    value={item}
                    onChange={(e) => handleInputChange(e, 'bibliografia', 'complementaria', index)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione una referencia</option>
                    {bibliographyDB.complementaria.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                ))}
                <button
                  onClick={() => addBibliography('complementaria')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Agregar Referencia
                </button>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">VISADO:</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <div className="grid grid-cols-4 gap-0 border-b border-gray-200 bg-gray-50">
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">DECANO/A</div>
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">DIRECTOR/A ACADÉMICO/A</div>
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">COORDINADOR/A DE CARRERA</div>
                <div className="p-4 font-semibold text-gray-700">DOCENTE</div>
              </div>
              <div className="grid grid-cols-4 gap-0 border-t border-gray-200 bg-white">
                <div className="p-4 border-r border-gray-200"><img src={qrCodes.decano} alt="QR Decano" width="80" /></div>
                <div className="p-4 border-r border-gray-200"><img src={qrCodes.director} alt="QR Director" width="80" /></div>
                <div className="p-4 border-r border-gray-200"><img src={qrCodes.coordinador} alt="QR Coordinador" width="80" /></div>
                <div className="p-4"><img src={qrCodes.docente} alt="QR Docente" width="80" /></div>
              </div>
              <div className="grid grid-cols-4 gap-0 border-t border-gray-200 bg-gray-50">
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">Fecha:</div>
                <div className="p-4 border-r border-gray-200">
                  <input
                    type="text"
                    value={formData.visado.fechas.decano || startDatesDB[formData.periodo] || ''}
                    onChange={(e) => handleInputChange(e, 'visado.fechas', 'decano')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">Fecha:</div>
                <div className="p-4">
                  <input
                    type="text"
                    value={formData.visado.fechas.director || startDatesDB[formData.periodo] || ''}
                    onChange={(e) => handleInputChange(e, 'visado.fechas', 'director')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-0 border-t border-gray-200">
                <div className="p-4"></div>
                <div className="p-4"></div>
                <div className="p-4 font-semibold text-gray-700 border-r border-gray-200">Fecha:</div>
                <div className="p-4">
                  <input
                    type="text"
                    value={formData.visado.fechas.coordinador || startDatesDB[formData.periodo] || ''}
                    onChange={(e) => handleInputChange(e, 'visado.fechas', 'coordinador')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-0 border-t border-gray-200 bg-gray-50">
                <div className="p-4"></div>
                <div className="p-4"></div>
                <div className="p-4"></div>
                <div className="p-4">
                  <input
                    type="text"
                    value={formData.visado.fechas.docente || startDatesDB[formData.periodo] || ''}
                    onChange={(e) => handleInputChange(e, 'visado.fechas', 'docente')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-6">
            <button
              type="button"
              onClick={exportToJSON}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 transform hover:scale-105"
            >
              Exportar a JSON
            </button>
            <button
              type="button"
              onClick={exportToWord}
              className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-900 transition duration-300 transform hover:scale-105"
            >
              Exportar a Word
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-900 transition duration-300 transform hover:scale-105"
            >
              Exportar a PDF
            </button>
            <button
              type="button"
              onClick={togglePreview}
              className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-900 transition duration-300 transform hover:scale-105"
            >
              Previsualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDocente;

//Previsualizacion de carga, y ver asignaturas de carga// dos botone//