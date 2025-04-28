import React, { useState, useEffect } from 'react';
import './insertarEmpleado.css';
import { useNavigate } from 'react-router-dom';

function InsertarEmpleado() {
  const [username] = useState(localStorage.getItem('username') || '');
  const [puestos, setPuestos] = useState([]);
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [puestoSeleccionado, setPuestoSeleccionado] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listarPuestos();
  }, []);

  function listarPuestos() {
    fetch('http://localhost:5000/api/puestos/listar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.resultCode === 0) {
        setPuestos(data.data);
      } else {
        setError(data.message);
      }
    });
  }

  const validar = () => {
    if (!/^\d{1,20}$/.test(cedula)) {
      setError('La cédula debe contener solo números (máx 20).');
      return false;
    }

    if (!/^[A-Za-z\s]{1,200}$/.test(nombre)) {
      setError('El nombre debe contener solo letras y espacios (máx 200).');
      return false;
    }

    if (!puestoSeleccionado) {
      setError('Debe seleccionar un puesto.');
      return false;
    }

    return true;
  };

  const handleInsertar = () => {
    setError('');
    if (!validar()) return;
    fetch('http://localhost:5000/api/empleados/insertar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        cedula,
        nombre,
        idPuesto: puestoSeleccionado,
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.resultCode === 0) {
        navigate('/empleados'); 
      } else {
        setError(data.message);
      }
    })
    .catch(err => {
      console.error(err);
      setError('Error de conexión al servidor.');
    });
  };

  return (
    <div className="insertar-container">
      <h3>Insertar Nuevo Empleado</h3>

      <label>Cédula</label>
      <input
        type="text"
        value={cedula}
        onChange={e => setCedula(e.target.value)}
      />

      <label>Nombre completo</label>
      <input
        type="text"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <label>Puesto</label>
      <select
        value={puestoSeleccionado}
        onChange={e => setPuestoSeleccionado(e.target.value)}
      >
        <option value="">-- Seleccione un puesto --</option>
        {puestos.map((p) => (
          <option key={p.Id} value={p.Id}>
            {p.Nombre}
          </option>
        ))}
      </select>

      {error && <div className="insertar-error">{error}</div>}

      <button onClick={handleInsertar}>Insertar</button>
    </div>
  );
}

export default InsertarEmpleado;
