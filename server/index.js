require('dotenv').config();
const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());


const dbConfig = {
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  server:             process.env.DB_SERVER,
  port:               parseInt(process.env.DB_PORT, 10),
  database:           process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan username o password' });
  }


  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    await sql.connect(dbConfig);

    const dbReq = new sql.Request();
    dbReq
      .input('inUsername',    sql.NVarChar(100), username)
      .input('inPassword',    sql.NVarChar(256), password)
      .input('inPostInIP',    sql.VarChar(45),   clientIp)
      .output('outResultCode', sql.Int)
      .output('outMessage',    sql.NVarChar(sql.MAX));

    const result = await dbReq.execute('dbo.Login');
    const code    = result.output.outResultCode;
    const message = result.output.outMessage;

    if (code === 0) {
      return res.json({ resultCode: code, message });
    } else {
      return res.status(401).json({ resultCode: code, message });
    }
  } catch (err) {
    console.error('Error al conectar o ejecutar SP:', err);
    return res.status(500).json({ error: 'Error de base de datos' });
  }
});

app.post('/api/listarEmpleados', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Falta username' });
  }

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.ListarEmpleados');

    const code = result.output.outResultCode;
    const message = result.output.outMessage;

    if (code === 0) {
      return res.json({
        resultCode: code,
        data: result.recordset || []
      });
    } else {
      return res.status(400).json({
        resultCode: code,
        message: message
      });
    }

  } catch (err) {
    console.error('Error al conectar o ejecutar SP:', err);
    return res.status(500).json({ error: 'Error de base de datos', detalle: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
