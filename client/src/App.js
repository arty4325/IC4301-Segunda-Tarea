// src/App.js
import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './login/Login';
import EmployeeList from './listaEmpleados/listaEmpleados';

import './App.css';

const BASE_ROUTE = '/login';

export default function App() {
  // ¡Ahora useNavigate() ya está dentro de un <BrowserRouter>!
  const navigate = useNavigate();

  return (
    <div>

      {/* Definición de rutas */}
      <Routes>
        {/* Ruta principal de Login */}
        <Route path={BASE_ROUTE} element={<Login onSuccess={() => navigate('/empleados')} />} />


        {/* Redirige "/" a "/login" */}
        <Route path="/" element={<Navigate to={BASE_ROUTE} replace />} />
        <Route path="/empleados" element={<EmployeeList />} />

        {/* Cualquier otra ruta, de nuevo a login */}
        <Route path="*" element={<Navigate to={BASE_ROUTE} replace />} />
      </Routes>
    </div>
  );
}
