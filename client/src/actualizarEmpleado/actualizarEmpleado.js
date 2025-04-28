import React, { useState, useEffect } from 'react';
import './actualizarEmpleado.css';
import { useNavigate, useLocation } from 'react-router-dom';

function ActualizarEmpleado(){
  const location = useLocation();
  const [username] = useState(localStorage.getItem('username') || '');
  const {empleado} = location.state || { empleado: null }; 
  const [nombre, setNombre] = useState('');
  const [valorDocumento, setValorDocumento] = useState('');
  const [idPuesto, setIdPuesto] = useState();
  const [puestos, setPuestos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();


    useEffect(() => {
      listarPuestos();
    }, []);

    const onActualizar = () => {
      setError('');
      if (!validar()) return;
      fetch('http://localhost:5000/api/empleados/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          empleadoName: empleado.Nombre,
          nombre,
          valorDocumento,
          idPuesto
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
    }

    const onCancelar = () => {
      navigate('/empleados');
    }
  
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
      if (!/^\d{1,20}$/.test(valorDocumento)) {
        setError('La cédula debe contener solo números (máx 20).');
        return false;
      }
  
      if (!/^[A-Za-z\s]{1,200}$/.test(nombre)) {
        setError('El nombre debe contener solo letras y espacios (máx 200).');
        return false;
      }
  
      if (!idPuesto) {
        setError('Debe seleccionar un puesto.');
        return false;
      }
  
      return true;
    };


  return (
    <div className="update-form-container">
      <h2>Actualizar Empleado</h2>

      <div className="form-group">
        <label>Nombre:</label>
        <input 
          type="text" 
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Valor Documento de Identidad:</label>
        <input 
          type="text" 
          value={valorDocumento}
          onChange={(e) => setValorDocumento(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Puesto:</label>
        <select 
          value={idPuesto}
          onChange={(e) => setIdPuesto(e.target.value)}
        >
          <option value="">Seleccione un puesto</option>
          {puestos.map((puesto) => (
            <option key={puesto.Id} value={puesto.Id}>
              {puesto.Nombre}
            </option>
          ))}
        </select>

        
      </div>
      {error && <div className="insertar-error">{error}</div>}
      <div className="form-buttons">
        <button onClick={() => onActualizar({ nombre, valorDocumento, idPuesto })}>
          Actualizar
        </button>
        <button onClick={onCancelar} className="cancel-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
export default ActualizarEmpleado;