import React from "react";

const Malla = () => {
  return (
    <div style={{ width: "100%", height: "100vh", border: "none" }}>
      <iframe
        src="http://localhost:3000"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Vista Localhost"
      ></iframe>
    </div>
  );
};

export default Malla;
