import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  return (
    <>
      {/* Sección Hero */}
      <header className="py-5 text-center text-white" style={{ background: 'linear-gradient(to right, #00B894, #A3CB38)' }}>
        <div className="container">
          <h1 className="fw-bold">Bienvenidos a la Plataforma de Gestión Académica</h1>
          <p>Optimiza la creación, gestión y seguimiento de sílabos y mallas curriculares en UNESUM.</p>
          <a className="btn btn-light fw-bold mt-3" href="#">Explora Ahora</a>
        </div>
      </header>

      {/* Carrusel */}
      <div id="carouselExampleIndicators" className="carousel slide mt-4 container" data-bs-ride="carousel">
        <div className="carousel-inner rounded shadow">
          <div className="carousel-item active">
            <img src="./descarga (1).jpeg" className="d-block w-100" alt="Gestión Académica" />
          </div>
          <div className="carousel-item">
            <img src="./imagen2.jpeg" className="d-block w-100" alt="Mallas Curriculares" />
          </div>
          <div className="carousel-item">
            <img src="./imagen3.jpeg" className="d-block w-100" alt="Reportes" />
          </div>
          <div className="carousel-item">
            <img src="./imagen4.jpeg" className="d-block w-100" alt="Imagen 4" />
          </div>
          <div className="carousel-item">
            <img src="./imagen5.jpeg" className="d-block w-100" alt="Imagen 5" />
          </div>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="container my-5">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3" style={{ fontSize: '40px', color: '#007A33' }}>📘</div>
                <h5 className="card-title fw-bold">Gestión de Sílabus</h5>
                <p className="card-text">Crea y edita sílabus asegurando que cumplan con los estándares académicos de UNESUM.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3" style={{ fontSize: '40px', color: '#007A33' }}>🧭</div>
                <h5 className="card-title fw-bold">Mallas Curriculares</h5>
                <p className="card-text">Diseña y actualiza mallas curriculares adaptadas al plan de estudios.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="mb-3" style={{ fontSize: '40px', color: '#007A33' }}>📊</div>
                <h5 className="card-title fw-bold">Seguimiento y Reportes</h5>
                <p className="card-text">Genera reportes detallados para evaluar el progreso académico.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      
    </>
  );
};

export default Home;
