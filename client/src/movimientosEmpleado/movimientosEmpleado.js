import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './movimientosEmpleado.css';

function MovimientosEmpleado() {
  const location = useLocation();
  const navigate = useNavigate();
  const empleado = location.state?.empleado;

  const [movimientos, setMovimientos] = useState([]);
  const [currentSaldo, setCurrentSaldo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!empleado) return setLoading(false);
    const fetchMovimientos = async () => {
      try {
        const username = localStorage.getItem('username');
        const res = await fetch('/api/movimientos/listar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            valorDocumentoIdentidad: empleado.ValorDocumentoIdentidad
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error al obtener movimientos');
        setMovimientos(json.data);
        setCurrentSaldo(json.data[0]?.NuevoSaldo ?? 0);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovimientos();
  }, [empleado]);

  const handleInsertar = () => {
    navigate('/empleados/movimiento/incertar', {
      state: {
        empleado: {
          ...empleado,
          SaldoActual: currentSaldo
        }
      }
    });
  };

  if (!empleado) {
    return <p className="error">No se recibió ningún empleado. Vuelve a la lista y selecciona uno.</p>;
  }

  return (
    <div className="movimientos-container">
      <header className="movimientos-header">
        <h1>Movimientos de {empleado.Nombre}</h1>
        <button className="insert-button" onClick={handleInsertar}>
          + Insertar Movimiento
        </button>
      </header>

      <section className="empleado-info">
        <p><strong>Cédula:</strong> {empleado.ValorDocumentoIdentidad}</p>
        <p><strong>Nombre:</strong> {empleado.Nombre}</p>
        {currentSaldo !== null && (
          <p><strong>Saldo actual:</strong> {currentSaldo}</p>
        )}
      </section>

      {loading
        ? <p>Cargando movimientos...</p>
        : error
          ? <p className="error">{error}</p>
          : (
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Nuevo Saldo</th>
                  <th>Usuario</th>
                  <th>IP</th>
                  <th>PostTime</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, idx) => (
                  <tr key={idx}>
                    <td>{new Date(m.PostTime).toLocaleString()}</td>
                    <td>{m.TipoMovimientoNombre}</td>
                    <td>{m.Monto}</td>
                    <td>{m.NuevoSaldo}</td>
                    <td>{m.EmpleadoNombre}</td>
                    <td>{m.PostInIP}</td>
                    <td>{new Date(m.PostTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      }
    </div>
  );
}

export default MovimientosEmpleado;
