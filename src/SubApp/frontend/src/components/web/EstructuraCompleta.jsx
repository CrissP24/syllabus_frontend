import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../css/Completa.css';

const EstructuraCompleta = () => {
    const [data, setData] = useState({});
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        fetch('http://localhost:5000/api/estructura-completa')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error al obtener los datos:', error));
    }, []);

    const generateUniqueCode = (nombre, horas) => {
        const initial = nombre.charAt(0).toUpperCase();
        const randomString = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `${initial}${horas}${randomString}`;
    };

    const getUnidadClass = (index) => {
        return index === 0 ? 'unidad-amarillo' : index === 1 ? 'unidad-verde' : 'unidad-azul';
    };

    const renderRows = () => {
        const rows = [];
        let unidadIndex = 0;
        for (const facultad in data) {
            for (const carrera in data[facultad]) {
                for (const malla in data[facultad][carrera]) {
                    // Encabezado de Facultad, Carrera y Versión de Malla
                    rows.push(
                        <tr key={`${facultad}-${carrera}-${malla}`} className="table-header">
                            <td colSpan="4"><strong>Facultad:</strong> {facultad} | <strong>Carrera:</strong> {carrera} | <strong>Versión Malla:</strong> {malla}</td>
                        </tr>
                    );

                    // Generamos los temarios por unidad
                    for (const unidad in data[facultad][carrera][malla]) {
                        const niveles = data[facultad][carrera][malla][unidad]?.niveles || {};

                        // Obtener temarios únicos para la unidad
                        const unidadTemarios = new Set();
                        for (const nivel in niveles) {
                            niveles[nivel].asignaturas.forEach(asignatura => {
                                unidadTemarios.add(asignatura.nombre_temario);
                            });
                        }

                        // Crear una fila por cada temario
                        Array.from(unidadTemarios).forEach((temario, index) => {
                            // Añadir una fila con el Temario
                            rows.push(
                                <tr key={`${facultad}-${carrera}-${malla}-${unidad}-${index}-temario`} className="table-temario-row">
                                    <td></td> {/* Celda vacía para la Unidad */}
                                    <td colSpan={3}>{temario}</td> {/* El Temario empieza a partir de la columna Nivel */}
                                </tr>
                            );

                            // Añadir una fila por cada nivel con sus asignaturas
                            for (const nivel in niveles) {
                                const asignaturas = niveles[nivel].asignaturas.filter(asignatura => asignatura.nombre_temario === temario);
                                const predecesoras = niveles[nivel].predecesoras.filter(predecesora => predecesora.nombre_temario === temario);

                                if (asignaturas.length > 0 || predecesoras.length > 0) {
                                    const asignaturasColumnas = asignaturas.map(asignatura => (
                                        <td key={asignatura.id_asignatura}>
                                            <div>{asignatura.nombre_asignatura}</div>
                                            <div className="small-text">
                                                <span>{asignatura.codigo_unico}</span>
                                                <span>{asignatura.horas}</span>
                                            </div>
                                        </td>
                                    ));

                                    const predecesorasColumnas = predecesoras.map(predecesora => (
                                        <td key={generateUniqueCode(predecesora.nombre_asignatura_prece, predecesora.horas)}>
                                            <div>{predecesora.nombre_asignatura_prece}</div>
                                            <div className="small-text">
                                                <span>{generateUniqueCode(predecesora.nombre_asignatura_prece, predecesora.horas)}</span>
                                                <span>{predecesora.horas}</span>
                                            </div>
                                        </td>
                                    ));

                                    rows.push(
                                        <tr key={`${facultad}-${carrera}-${malla}-${unidad}-${nivel}`} className="table-row">
                                            {/* La celda de Unidad solo se inserta en la primera fila y abarca todas las filas siguientes */}
                                            {index === 0 && nivel === Object.keys(niveles)[0] && (
                                                <td rowSpan={Object.keys(niveles).length} className={getUnidadClass(unidadIndex)}><strong>Unidad:</strong> {unidad}</td>
                                            )}
                                            <td><strong>Nivel:</strong> {nivel}</td>
                                            {asignaturasColumnas}
                                            {predecesorasColumnas}
                                        </tr>
                                    );
                                }
                            }
                        });
                        unidadIndex++;
                    }
                }
            }
        }
        return rows;
    };

    const downloadPDF = (facultad, carrera) => {
        const doc = new jsPDF('landscape');

        const imgData = 'data:image/png;base64,...'; // Reemplaza con tu imagen en base64
        doc.addImage(imgData, 'PNG', 10, 10, 30, 30); // Ajusta la posición y tamaño de la imagen

        doc.setFont('Cooper Black', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('Universidad Estatal del Sur de Manabí', 50, 20);
        doc.setFontSize(16);
        doc.text('Malla Curricular', 50, 30);
        doc.setFont('Georgia', 'normal');
        doc.setFontSize(14);
        doc.text('Distribución de asignaturas por unidades de organización curricular', 50, 40);

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        let unidadIndex = 0;

        for (const malla in data[facultad][carrera]) {
            // Encabezado de Facultad, Carrera y Versión de Malla
            const headerRow = document.createElement('tr');
            headerRow.className = 'table-header';
            const headerCell = document.createElement('td');
            headerCell.colSpan = 4;
            headerCell.innerHTML = `<strong>Facultad:</strong> ${facultad} | <strong>Carrera:</strong> ${carrera} | <strong>Versión Malla:</strong> ${malla}`;
            headerRow.appendChild(headerCell);
            tbody.appendChild(headerRow);

            // Generamos los temarios por unidad
            for (const unidad in data[facultad][carrera][malla]) {
                const niveles = data[facultad][carrera][malla][unidad]?.niveles || {};

                // Obtener temarios únicos para la unidad
                const unidadTemarios = new Set();
                for (const nivel in niveles) {
                    niveles[nivel].asignaturas.forEach(asignatura => {
                        unidadTemarios.add(asignatura.nombre_temario);
                    });
                }

                // Crear una fila por cada temario
                Array.from(unidadTemarios).forEach((temario, index) => {
                    // Añadir una fila con el Temario
                    const temarioRow = document.createElement('tr');
                    temarioRow.className = 'table-temario-row';
                    const temarioCell = document.createElement('td');
                    temarioCell.colSpan = 3;
                    temarioCell.innerHTML = temario;
                    temarioRow.appendChild(document.createElement('td')); // Celda vacía para la Unidad
                    temarioRow.appendChild(temarioCell);
                    tbody.appendChild(temarioRow);

                    // Añadir una fila por cada nivel con sus asignaturas
                    for (const nivel in niveles) {
                        const asignaturas = niveles[nivel].asignaturas.filter(asignatura => asignatura.nombre_temario === temario);
                        const predecesoras = niveles[nivel].predecesoras.filter(predecesora => predecesora.nombre_temario === temario);

                        if (asignaturas.length > 0 || predecesoras.length > 0) {
                            const row = document.createElement('tr');
                            row.className = 'table-row';

                            // La celda de Unidad solo se inserta en la primera fila y abarca todas las filas siguientes
                            if (index === 0 && nivel === Object.keys(niveles)[0]) {
                                const unidadCell = document.createElement('td');
                                unidadCell.rowSpan = Object.keys(niveles).length;
                                unidadCell.className = getUnidadClass(unidadIndex);
                                unidadCell.innerHTML = `<strong>Unidad:</strong> ${unidad}`;
                                row.appendChild(unidadCell);
                            }

                            const nivelCell = document.createElement('td');
                            nivelCell.innerHTML = `<strong>Nivel:</strong> ${nivel}`;
                            row.appendChild(nivelCell);

                            asignaturas.forEach(asignatura => {
                                const asignaturaCell = document.createElement('td');
                                asignaturaCell.innerHTML = `
                                    <div>${asignatura.nombre_asignatura}</div>
                                    <div className="small-text">
                                        <span>${asignatura.codigo_unico}</span>
                                        <span>${asignatura.horas}</span>
                                    </div>
                                `;
                                row.appendChild(asignaturaCell);
                            });

                            predecesoras.forEach(predecesora => {
                                const predecesoraCell = document.createElement('td');
                                predecesoraCell.innerHTML = `
                                    <div>${predecesora.nombre_asignatura_prece}</div>
                                    <div className="small-text">
                                        <span>${generateUniqueCode(predecesora.nombre_asignatura_prece, predecesora.horas)}</span>
                                        <span>${predecesora.horas}</span>
                                    </div>
                                `;
                                row.appendChild(predecesoraCell);
                            });

                            tbody.appendChild(row);
                        }
                    }
                });
                unidadIndex++;
            }
        }

        table.appendChild(tbody);
        doc.autoTable({
            html: table,
            startY: 60, // Ajusta la posición de inicio de la tabla
            styles: {
                fontSize: 12, // Tamaño de letra más grande
                cellPadding: 5, // Espaciado de celdas más grande
            },
            headStyles: {
                fillColor: [46, 90, 48], // Color de fondo de encabezado
                textColor: [255, 255, 255], // Color de texto de encabezado
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // Color de fondo de cuerpo
                textColor: [0, 0, 0], // Color de texto de cuerpo
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240], // Color de fondo de filas alternas
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Ajuste automático de ancho de columna
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
            },
            didDrawCell: (data) => {
                // Aplicar colores a las columnas según la clase
                if (data.column.index === 0 && data.cell.raw) {
                    const className = data.cell.raw.className;
                    if (className.includes('unidad-amarillo')) {
                        data.cell.styles.fillColor = [255, 255, 0];
                    } else if (className.includes('unidad-verde')) {
                        data.cell.styles.fillColor = [0, 255, 0];
                    } else if (className.includes('unidad-azul')) {
                        data.cell.styles.fillColor = [0, 0, 255];
                    }
                }
            },
        });

        // Pie de página
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(0, 35, 102);
        doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');
        doc.text('© TI - Carrera de tecnologías de la Información', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });

        doc.save(`estructura-completa-${carrera}.pdf`);
    };

    const handleZoomOut = () => {
        setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    };

    const handleZoomIn = () => {
        setZoom(prevZoom => Math.min(prevZoom + 0.1, 2));
    };

    return (
        <div>
            <div className="zoom-buttons">
                <button onClick={handleZoomOut} className="zoom-button" title="Disminuir Zoom">
                    <i className="fas fa-search-minus"></i>
                </button>
                <button onClick={handleZoomIn} className="zoom-button" title="Aumentar Zoom">
                    <i className="fas fa-search-plus"></i>
                </button>
            </div>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <table id="estructura-completa-table">
                    <tbody>
                        {renderRows()}
                    </tbody>
                </table>
                <div className="button-container">
                    {Object.keys(data).map(facultad =>
                        Object.keys(data[facultad]).map(carrera => (
                            <button key={`${facultad}-${carrera}`} onClick={() => downloadPDF(facultad, carrera)} className="download-button">
                                Descargar PDF de {carrera}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EstructuraCompleta;