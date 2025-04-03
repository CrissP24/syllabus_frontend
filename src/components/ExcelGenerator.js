import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExcelGenerator = ({ selectedData }) => {
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nueva Plantilla");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "nueva_plantilla.xlsx");
  };

  return (
    <div>
      <h2>Generar nueva plantilla</h2>
      <button onClick={generateExcel} disabled={selectedData.length === 0}>
        Descargar nueva plantilla
      </button>
    </div>
  );
};

export default ExcelGenerator;
