// Home.jsx
import React from 'react';
import { FaBookOpen } from 'react-icons/fa'; // Icon representing syllabus or curriculum
import './Home.css';

const Home = () => (
    <div className="welcome-message">
        <FaBookOpen className="welcome-icon" />
        <h1>Bienvenidos</h1>
        <p>El proceso a llevar a cabo es la creación del sílabo educativo.</p>
    </div>
);

export default Home;