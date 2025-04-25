import React, { useEffect, useState } from 'react';
import './listaEmpleados.css';

function EmployeeList() {
  const [filtro, setFiltro] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarConsulta, setMostrarConsulta] = useState(false);
  const [error, setError]       = useState('');

    useEffect(() => {
       listAll();
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

  function listAll(){
    const payload = {
      username: "Arturo"//TODO: coger del localStorage el username
    };
    fetch('http://localhost:5000/api/empleados/listar', {
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
  }

  function filterID(id) {
    const payload = {
      username: "Arturo",//TODO: coger del localStorage el username
      cedula : id
    };
    fetch('http://localhost:5000/api/empleados/filtrarCedula', {
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
  }

  function filterName(name) {
    const payload = {
      username: "Arturo",//TODO: coger del localStorage el username
      nombre : name
    };
    fetch('http://localhost:5000/api/empleados/filtrarNombre', {
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
  }

  const filtrar = () => {
    setError('');
    if (!filtro.trim()) {
      listAll();
    } 
    else if (/^\d{1,20}$/.test(filtro)){ //si es solo números
      filterID(filtro);
    } else if (/^[A-Za-z\s]{1,200}$/.test(filtro)) { //si es solo letras
      filterName(filtro);
    }
    else {
      setError('Entrada de filtro no válida.');
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
          <button onClick={filtrar}>Filtrar</button>
        </div>
  
        {error && <div className="filter-error">{error}</div>}
  
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
              <p><strong>Saldo Vacaciones:</strong> {empleadoSeleccionado.SaldoVacaciones}</p>
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
