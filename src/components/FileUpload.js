import React from "react";

const FileUpload = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div>
      <h2>Subir plantilla Excel</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;
