// server/index.js
require('dotenv').config();
const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión
const dbConfig = {
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  server:             process.env.DB_SERVER,
  port:               parseInt(process.env.DB_PORT, 10),
  database:           process.env.DB_NAME,
  options: {
    encrypt: true,              // si usas Azure
    trustServerCertificate: true // útil en dev local
  }
};

// Endpoint de prueba
app.get('/api/usuarios', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT TOP 10 * FROM EMPLEADO`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de base de datos' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
