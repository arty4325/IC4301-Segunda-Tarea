import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './login/Login';
import EmployeeList from './listaEmpleados/listaEmpleados';

import './App.css';
import InsertarEmpleado from './insertarEmpleado/insertarEmpleado';
import MovimientosEmpleado from './movimientosEmpleado/movimientosEmpleado';
import ActualizarEmpleado from './actualizarEmpleado/actualizarEmpleado';
import InsertarMovimiento from './insertarMovimiento/insertarMovimiento';

const BASE_ROUTE = '/login';

export default function App() {
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
        <Route path="/empleados/insertar" element={<InsertarEmpleado />} />
        <Route path="/empleados/movimientos" element={<MovimientosEmpleado />} />
        <Route path="/empleados/actualizar" element={<ActualizarEmpleado />} />
        <Route path="/empleados/movimiento/incertar" element={<InsertarMovimiento/>}/>
        {/* Cualquier otra ruta, de nuevo a login */}
        <Route path="*" element={<Navigate to={BASE_ROUTE} replace />} />
      </Routes>
    </div>
  );
}
