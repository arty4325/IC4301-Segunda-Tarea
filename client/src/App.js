import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios.get('/api/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Lista de Usuarios</h1>
      <ul>
        {usuarios.map(u => (
          <li key={u.IdUsuario}>{u.Nombre} ({u.Email})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
