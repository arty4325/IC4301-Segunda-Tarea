// src/App.js
import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './login/Login';
import './App.css';

const BASE_ROUTE = '/login';

export default function App() {
  // ¡Ahora useNavigate() ya está dentro de un <BrowserRouter>!
  const navigate = useNavigate();

  // Ejemplo: navegar programáticamente
  const irARegister = () => {
    navigate('/register', { replace: true });
  };

  return (
    <div>
      {/* Barra de navegación de ejemplo */}
      <nav className="nav-bar">
        <Link to={BASE_ROUTE}>Login</Link>
        {/* en el futuro, si creas /register, bastará con esto: */}
        {/* <Link to="/register">Register</Link> */}
        <button onClick={irARegister}>Ir a Register</button>
      </nav>

      {/* Definición de rutas */}
      <Routes>
        {/* Ruta principal de Login */}
        <Route path={BASE_ROUTE} element={<Login />} />

        {/* Redirige "/" a "/login" */}
        <Route path="/" element={<Navigate to={BASE_ROUTE} replace />} />

        {/* Cualquier otra ruta, de nuevo a login */}
        <Route path="*" element={<Navigate to={BASE_ROUTE} replace />} />
      </Routes>
    </div>
  );
}
