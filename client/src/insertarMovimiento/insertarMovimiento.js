import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './insertarMovimiento.css';

function InsertarMovimiento() {
  const { state } = useLocation();
  const empleado  = state?.empleado;
  const navigate  = useNavigate();

  const [tipos, setTipos]                       = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [monto, setMonto]                       = useState('');
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState('');
  const [submitting, setSubmitting]             = useState(false);

  const friendly = {
    50011: 'El monto ingresado dejaría el saldo en negativo. Ajusta el monto o el tipo de movimiento.',
    50014: 'Tipo de movimiento o empleado inválido.',
    50002: 'Empleado no encontrado.',
    50003: 'Tipo de movimiento no existe.'
  };

  useEffect(() => {
    if (!empleado) { setLoading(false); return; }
    fetch('/api/tiposMovimientos/listar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: localStorage.getItem('username') })
    })
      .then(r => r.json())
      .then(j => {
        if (j.resultCode === 0) setTipos(j.data);
        else throw new Error(j.message);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [empleado]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!tipoSeleccionado || !monto) { setError('Debe seleccionar tipo y monto'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch('/api/movimientos/insertar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: localStorage.getItem('username'),
          valorDocumentoIdentidad: empleado.ValorDocumentoIdentidad,
          idTipoMovimiento: Number(tipoSeleccionado),
          monto: Number(monto)
        })
      });
      const json = await res.json();
      if (res.ok && json.resultCode === 0) {
        navigate(-1);
      } else {
        const msg = friendly[json.resultCode] || json.message || 'Error al insertar movimiento';
        throw new Error(msg);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!empleado) return <p className="im-error">No hay empleado seleccionado.</p>;

  return (
    <div className="im-container">
      <h2>Insertar Movimiento</h2>
      <div className="im-empleado-info">
        <p><strong>Cédula:</strong> {empleado.ValorDocumentoIdentidad}</p>
        <p><strong>Nombre:</strong> {empleado.Nombre}</p>
        <p><strong>Saldo actual:</strong> {empleado.SaldoActual}</p>
      </div>
      {loading ? (
        <p>Cargando tipos de movimiento...</p>
      ) : (
        <form className="im-form" onSubmit={handleSubmit}>
          {error && <p className="im-error">{error}</p>}
          <label>
            Tipo de Movimiento
            <select
              value={tipoSeleccionado}
              onChange={e => setTipoSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione --</option>
              {tipos.map(t => (
                <option key={t.Id} value={t.Id}>
                  {t.Nombre} ({t.TipoAccion})
                </option>
              ))}
            </select>
          </label>
          <label>
            Monto
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="0.00"
            />
          </label>
          <div className="im-buttons">
            <button type="button" className="im-cancel" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="im-submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Insertar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default InsertarMovimiento;
