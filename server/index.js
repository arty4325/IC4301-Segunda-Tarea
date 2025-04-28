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

app.post('/api/empleados/listar', async (req, res) => {
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

app.post('/api/empleados/filtrarCedula', async (req, res) => {
  const { username, cedula } = req.body;

  if (!username || !cedula) {
    return res.status(400).json({ error: 'Falta username y/o cedula' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .input('inCedula',  sql.NVarChar(20), cedula)
    .input('inPostInIP', sql.VarChar(45), clientIp)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.FiltrarCedula');

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


app.post('/api/empleados/filtrarNombre', async (req, res) => {
  const { username, nombre } = req.body;

  if (!username || !nombre) {
    return res.status(400).json({ error: 'Falta username y/o cedula' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .input('inNombre',  sql.NVarChar(200), nombre)
    .input('inPostInIP', sql.VarChar(45), clientIp)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.FiltrarNombre');

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

app.post('/api/puestos/listar', async (req, res) => {
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
    .execute('dbo.GetPuestos');

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

app.post('/api/empleados/insertar', async (req, res) => {
  const { username, cedula, nombre, idPuesto } = req.body;

  if (!username || !cedula || !nombre || !idPuesto) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .input('inCedula', sql.NVarChar(20), cedula)
    .input('inNombre', sql.NVarChar(200), nombre)
    .input('inIdPuesto', sql.Int, idPuesto)
    .input('inPostInIP', sql.VarChar(45), clientIp)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.InsertarEmpleado');

    const code = result.output.outResultCode;
    const message = result.output.outMessage;

    if (code === 0) {
      return res.json({
        resultCode: code,
        message
      });
    } else {
      return res.status(400).json({
        resultCode: code,
        message
      });
    }

  } catch (err) {
    console.error('Error al conectar o ejecutar SP:', err);
    return res.status(500).json({ error: 'Error de base de datos', detalle: err.message });
  }
})


app.post('/api/empleados/actualizar', async (req, res) => {
  const { username, empleadoName, nombre,  valorDocumento, idPuesto } = req.body;

  if (!username || !empleadoName || !nombre || !valorDocumento || !idPuesto) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .input('inEmpleadoName', sql.NVarChar(200), empleadoName)
    .input('inNombre', sql.NVarChar(200), nombre)
    .input('inCedula', sql.NVarChar(20), valorDocumento)
    .input('inIdPuesto', sql.Int, idPuesto)
    .input('inPostInIP', sql.VarChar(45), clientIp)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.ActualizarEmpleado');

    const code = result.output.outResultCode;
    const message = result.output.outMessage;

    if (code === 0) {
      return res.json({
        resultCode: code,
        message
      });
    } else {
      return res.status(400).json({
        resultCode: code,
        message
      });
    }

  } catch (err) {
    console.error('Error al conectar o ejecutar SP:', err);
    return res.status(500).json({ error: 'Error de base de datos', detalle: err.message });
  }
})


app.post('/api/empleados/eliminar', async (req, res) => {
  const { username, name, exitoso } = req.body;
  if (!username || !name || exitoso == null ) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    let pool = await sql.connect(dbConfig);

    const result = await pool.request()
    .input('inUsername', sql.NVarChar(100), username)
    .input('inNombre', sql.NVarChar(200), name)
    .input('inExitoso', sql.Bit, exitoso)
    .input('inPostInIP', sql.VarChar(45), clientIp)
    .output('outResultCode', sql.Int)
    .output('outMessage', sql.NVarChar(sql.MAX))
    .execute('dbo.EliminarEmpleado');

    const code = result.output.outResultCode;
    const message = result.output.outMessage;

    if (code === 0) {
      return res.json({
        resultCode: code,
        message
      });
    } else {
      return res.status(400).json({
        resultCode: code,
        message
      });
    }

  } catch (err) {
    console.error('Error al conectar o ejecutar SP:', err);
    return res.status(500).json({ error: 'Error de base de datos', detalle: err.message });
  }
})

app.post('/api/movimientos/listar', async (req, res) => {
  const { username, valorDocumentoIdentidad } = req.body;
  if (!username || !valorDocumentoIdentidad) {
    return res.status(400).json({ error: 'Falta username y/o valorDocumentoIdentidad' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0]
                     .trim();

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('inValorDocumentoIdentidad', sql.VarChar(50), valorDocumentoIdentidad)
      .output('outResultCode', sql.Int)
      .execute('dbo.ListarMovimientosPorDocumento');

    const code = result.output.outResultCode;

    if (code === 0) {
      return res.json({
        resultCode: code,
        data: result.recordset || []
      });
    } else {
      return res.status(400).json({
        resultCode: code
      });
    }
  } catch (err) {
    console.error('Error al ejecutar SP ListarMovimientosPorDocumento:', err);
    return res.status(500).json({
      error: 'Error de base de datos',
      detalle: err.message
    });
  }
});


app.post('/api/movimientos/insertar', async (req, res) => {
  const {
    username,
    valorDocumentoIdentidad,
    idTipoMovimiento,
    monto
  } = req.body;

  if (!username || !valorDocumentoIdentidad || idTipoMovimiento == null || monto == null) {
    return res.status(400).json({ error: 'Faltan datos requeridos para insertar movimiento' });
  }

  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)
                     .split(',')[0].trim();

  try {
    const pool = await sql.connect(dbConfig);

    const userQuery = await pool.request()
      .input('Username', sql.NVarChar(100), username)
      .query('SELECT Id FROM dbo.Usuario WHERE Username = @Username');  
    if (userQuery.recordset.length === 0) {
      return res.status(400).json({ error: 'Usuario no existe en la tabla Usuario' });
    }
    const idUserPostBy = userQuery.recordset[0].Id;


    const sp = await pool.request()
      .input('inValorDocumentoIdentidad', sql.VarChar(50), valorDocumentoIdentidad)
      .input('inIdTipoMovimiento',        sql.Int,        idTipoMovimiento)
      .input('inMonto',                   sql.Decimal(18,2), monto)
      .input('inIdUserPostBy',            sql.Int,        idUserPostBy)
      .input('inPostInIP',                sql.VarChar(45), clientIp)
      .output('outResultCode',            sql.Int)
      .output('outMessage',               sql.NVarChar(sql.MAX))
      .execute('dbo.InsertarMovimiento');

    const code    = sp.output.outResultCode;
    const message = sp.output.outMessage;

    return code === 0
      ? res.json({ resultCode: code, message })
      : res.status(400).json({ resultCode: code, message });

  } catch (err) {
    return res.status(500).json({ error: 'Error de base de datos', detalle: err.message });
  }
});



app.post('/api/tiposMovimientos/listar', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Falta username' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('inUsername',   sql.NVarChar(100), username)
      .output('outResultCode', sql.Int)
      .output('outMessage',    sql.NVarChar(sql.MAX))
      .execute('dbo.ListarTipoMovimientos');

    const code    = result.output.outResultCode;
    const message = result.output.outMessage;
    const data    = result.recordset || [];

    if (code === 0) {
      return res.json({ resultCode: code, data });
    } else {
      return res.status(400).json({ resultCode: code, message });
    }

  } catch (err) {
    console.error('Error al ejecutar SP ListarTipoMovimientos:', err);
    return res.status(500).json({
      error: 'Error de base de datos',
      detalle: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
