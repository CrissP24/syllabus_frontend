import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // CONFIGURACION DEL PLAN DE ESTUDIO 
import "./DataTable.css"; // Estilos externos
import { Document, Packer, Table, TableRow, TableCell, Paragraph } from "docx";
import { saveAs } from "file-saver";

const DataTable = ({ data, onSelectionChange }) => {
  const [tableData, setTableData] = useState([]);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState({ rowIndex: null, colIndex: null });

  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  const handleCellChange = (rowIndex, colKey, value) => {
    const updatedData = tableData.map((row, index) =>
      index === rowIndex ? { ...row, [colKey]: value } : row
    );
    setTableData(updatedData);
    onSelectionChange(updatedData);
  };

  const addRow = (position = "after") => {
    const newRow = Object.keys(tableData[0] || {}).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});

    const updatedData = [...tableData];
    if (position === "before") {
      updatedData.unshift(newRow);
    } else {
      updatedData.push(newRow);
    }
    setTableData(updatedData);
  };

  const addColumn = (position = "after") => {
    const columnName = prompt(
      "Ingresa el nombre de la nueva columna:",
      `Columna ${Object.keys(tableData[0] || {}).length + 1}`
    );
    if (!columnName) return;

    const updatedData = tableData.map((row) => {
      const newRow = { ...row };
      if (position === "before") {
        return { [columnName]: "", ...newRow };
      } else {
        newRow[columnName] = "";
        return newRow;
      }
    });
    setTableData(updatedData);
  };

  const toggleCellSelection = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const updatedSelection = new Set(selectedCells);
    if (updatedSelection.has(cellKey)) {
      updatedSelection.delete(cellKey);
    } else {
      updatedSelection.add(cellKey);
    }
    setSelectedCells(updatedSelection);
    setSelectedCell({ rowIndex, colIndex });
  };

  const deleteSelected = () => {
    const updatedData = tableData.map((row, rowIndex) => {
      const updatedRow = { ...row };
      Object.keys(row).forEach((colKey, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        if (selectedCells.has(cellKey)) {
          updatedRow[colKey] = ""; // Eliminar contenido
        }
      });
      return updatedRow;
    });
    setTableData(updatedData);
    setSelectedCells(new Set());
  };

  const addCellAbove = () => {
    if (selectedCell.rowIndex === null || selectedCell.colIndex === null) return;

    const updatedData = [...tableData];
    const newRow = Object.keys(tableData[0]).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});

    updatedData.splice(selectedCell.rowIndex, 0, newRow);
    setTableData(updatedData);
  };

  const addCellBelow = () => {
    if (selectedCell.rowIndex === null || selectedCell.colIndex === null) return;

    const updatedData = [...tableData];
    const newRow = Object.keys(tableData[0]).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});

    updatedData.splice(selectedCell.rowIndex + 1, 0, newRow);
    setTableData(updatedData);
  };

  const addCellLeft = () => {
    if (selectedCell.colIndex === null || selectedCell.rowIndex === null) return;

    const updatedData = tableData.map((row) => {
      const newRow = { ...row };
      const keys = Object.keys(newRow);
      const leftPart = keys.slice(0, selectedCell.colIndex);
      const rightPart = keys.slice(selectedCell.colIndex);

      const newKey = `Columna ${keys.length + 1}`;

      // Inserta la nueva celda a la izquierda
      newRow[newKey] = "";
      const newRowArray = [
        ...leftPart.map((key) => ({ [key]: newRow[key] })),
        { [newKey]: "" },
        ...rightPart.map((key) => ({ [key]: newRow[key] })),
      ];

      return Object.assign({}, ...newRowArray);
    });
    setTableData(updatedData);
  };

  const addCellRight = () => {
    if (selectedCell.colIndex === null || selectedCell.rowIndex === null) return;

    const updatedData = tableData.map((row) => {
      const newRow = { ...row };
      const keys = Object.keys(newRow);
      const newKey = `Columna ${keys.length + 1}`;

      newRow[newKey] = "";
      return newRow;
    });
    setTableData(updatedData);
  };

  // Función para manejar la carga del archivo Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const abuf = reader.result;
      const wb = XLSX.read(abuf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      setTableData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
    XLSX.writeFile(wb, "TablaDeDatos.xlsx");
  };

  const exportToWord = () => {
    const rows = tableData.map(row => {
      return new TableRow({
        children: Object.values(row).map(cellValue => {
          return new TableCell({
            children: [new Paragraph({ text: cellValue.toString() })],
          });
        }),
      });
    });

    const doc = new Document({
      sections: [{
        children: [
          new Table({
            rows: rows
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "TablaDeDatos.docx");
    });
  };

  return (
    <div className="datatable-container">
      <h2>Tabla de Datos</h2>
      <div className="datatable-actions">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        
        <select onChange={(e) => {
          const action = e.target.value;
          switch(action) {
            case 'addRowBefore': addRow("before"); break;
            case 'addRowAfter': addRow("after"); break;
            case 'addColumnBefore': addColumn("before"); break;
            case 'addColumnAfter': addColumn("after"); break;
            case 'addCellAbove': addCellAbove(); break;
            case 'addCellBelow': addCellBelow(); break;
            case 'addCellLeft': addCellLeft(); break;
            case 'addCellRight': addCellRight(); break;
            case 'exportExcel': exportToExcel(); break;
            case 'exportWord': exportToWord(); break;
            case 'deleteSelected': deleteSelected(); break;
          }
          e.target.value = ''; // Reset select after action
        }}>
          <option value="">Seleccionar acción...</option>
          <option value="addRowBefore">Añadir Fila Antes</option>
          <option value="addRowAfter">Añadir Fila Después</option>
          <option value="addColumnBefore">Añadir Columna Antes</option>
          <option value="addColumnAfter">Añadir Columna Después</option>
          <option value="addCellAbove">Añadir Celda Arriba</option>
          <option value="addCellBelow">Añadir Celda Abajo</option>
          <option value="addCellLeft">Añadir Celda Izquierda</option>
          <option value="addCellRight">Añadir Celda Derecha</option>
          <option value="exportExcel">Exportar a Excel</option>
          <option value="exportWord">Exportar a Word</option>
          <option value="deleteSelected">Eliminar Seleccionados</option>
        </select>
      </div>
      <table className="datatable">
        <thead>
          <tr>
            <th></th>
            {Object.keys(tableData[0] || {}).map((key, colIndex) => (
              <th key={key}>{String.fromCharCode(65 + colIndex)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex + 1}</td>
              {Object.entries(row).map(([colKey, value], colIndex) => (
                <td
                  key={colKey}
                  className={selectedCells.has(`${rowIndex}-${colIndex}`) ? "selected" : ""}
                  onClick={() => toggleCellSelection(rowIndex, colIndex)}
                >
                  <input
                    type="text"
                    value={value || ""}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colKey, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
