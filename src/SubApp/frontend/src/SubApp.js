import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/home"; // Asegúrate de que la ruta sea correcta

function SubAppMain() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* Agrega más rutas según sea necesario */}
            </Routes>
        </Router>
    );
}

export default SubAppMain;