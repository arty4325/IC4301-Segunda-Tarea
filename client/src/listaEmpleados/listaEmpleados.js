import React, { useEffect, useState } from 'react';
import './listaEmpleados.css';

const empleadosEjemplo = [
  { nombre: 'Ana Pérez', docIdentidad: '12345678', puesto: 'Cajero' },
  { nombre: 'Luis Gómez', docIdentidad: '87654321', puesto: 'Asistente' },
];

function EmployeeList() {
  const [filtro, setFiltro] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarConsulta, setMostrarConsulta] = useState(false);
  const [error, setError]       = useState('');

    useEffect(() => {
        const payload = {
            username: "Arturo"//TODO: coger del localStorage el username
        };
        const response = fetch('http://localhost:5000/api/listarEmpleados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(res => res.json())
        .then(data => {
          if (data.resultCode === 0) {
            setEmpleados(data.data);
          } else {
            setError(data.message);
          }
        });
    }, []);
  

  const seleccionarEmpleado = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setMostrarConsulta(false);
  };

  const consultar = () => {
    if (empleadoSeleccionado) {
      setMostrarConsulta(true);
    }
  };

  return (
    <div className="container">
      <div className="left-panel">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <button>Filtrar</button>
        </div>
  
        <table className="employee-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Puesto</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp, idx) => (
              <tr
                key={idx}
                className={
                  empleadoSeleccionado?.ValorDocumentoIdentidad === emp.ValorDocumentoIdentidad
                    ? 'selected'
                    : ''
                }
                onClick={() => seleccionarEmpleado(emp)}
              >
                <td>{emp.Nombre}</td>
                <td>{emp.ValorDocumentoIdentidad}</td>
                <td>{emp.Puesto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="right-panel">
        <div className="consulta-panel">
          {mostrarConsulta && empleadoSeleccionado ? (
            <div>
              <h4>Detalle del Empleado</h4>
              <p><strong>Documento:</strong> {empleadoSeleccionado.ValorDocumentoIdentidad}</p>
              <p><strong>Nombre:</strong> {empleadoSeleccionado.Nombre}</p>
              <p><strong>Puesto:</strong> {empleadoSeleccionado.Puesto}</p>
              <p><strong>Saldo Vacaciones:</strong> 10 días</p>
            </div>
          ) : (
            <p>Selecciona un empleado y haz clic en "Consultar"</p>
          )}
        </div>
  
        <div className="actions-right">
          <button onClick={consultar} disabled={!empleadoSeleccionado}>Consultar</button>
          <button disabled={!empleadoSeleccionado}>Update</button>
          <button disabled={!empleadoSeleccionado}>Delete</button>
          <button disabled={!empleadoSeleccionado}>Listar Movimientos</button>
          <button>Insertar</button>
        </div>
      </div>
    </div>
  );
  
}

export default EmployeeList;
