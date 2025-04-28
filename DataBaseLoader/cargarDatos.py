import xml.etree.ElementTree as ET
import pyodbc
from datetime import datetime

# ========== CONFIGURATION ==========
server   = 'mssql-196019-0.cloudclusters.net,10245'
database = 'BASESTAREA'
username = 'requeSoftware'
password = '#Jaime123'
driver   = '{ODBC Driver 17 for SQL Server}'
xml_file = 'datos_mejorados.xml'  # Ruta al XML que recibiste

# ========== CONNECT TO DATABASE ==========
conn = pyodbc.connect(
    f'DRIVER={driver};'
    f'SERVER={server};'
    f'DATABASE={database};'
    f'UID={username};'
    f'PWD={password}'
)
cursor = conn.cursor()

# ========== PARSE XML ==========
tree = ET.parse(xml_file)
root = tree.getroot()

# --- 1. Puestos ---
for puesto in root.find('Puestos'):
    cursor.execute(
        "INSERT INTO Puesto (Id, Nombre, SalarioxHora) VALUES (?, ?, ?)",
        int(puesto.get('Id')),
        puesto.get('Nombre'),
        float(puesto.get('SalarioxHora'))
    )

# --- 2. TiposEvento ---
for te in root.find('TiposEvento'):
    cursor.execute(
        "INSERT INTO TipoEvento (Id, Nombre) VALUES (?, ?)",
        int(te.get('Id')),
        te.get('Nombre')
    )

# --- 3. TiposMovimientos ---
tipo_accion_map = {}
for tm in root.find('TiposMovimientos'):
    tm_id = int(tm.get('Id'))
    tipo_accion = tm.get('TipoAccion')
    tipo_accion_map[tm_id] = tipo_accion
    cursor.execute(
        "INSERT INTO TipoMovimiento (Id, Nombre, TipoAccion) VALUES (?, ?, ?)",
        tm_id,
        tm.get('Nombre'),
        tipo_accion
    )

# --- 4. Empleados ---
for emp in root.find('Empleados'):
    cursor.execute(
        """
        INSERT INTO Empleado
          (IdPuesto, ValorDocumentoIdentidad, Nombre, FechaContratacion, SaldoVacaciones, EsActivo)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        int(emp.get('IdPuesto')),
        emp.get('ValorDocumentoIdentidad'),
        emp.get('Nombre'),
        emp.get('FechaContratacion'),
        int(emp.get('SaldoVacaciones')),
        int(emp.get('EsActivo'))
    )

# --- 5. Usuarios ---
for usr in root.find('Usuarios'):
    cursor.execute(
        "INSERT INTO Usuario (Id, Username, Password) VALUES (?, ?, ?)",
        int(usr.get('Id')),
        usr.get('Nombre'),
        usr.get('Pass')
    )

# --- 6. Feriados ---
for fer in root.find('Feriados'):
    cursor.execute(
        "INSERT INTO Feriado (Fecha, Descripcion) VALUES (?, ?)",
        fer.get('Fecha'),
        fer.get('Descripcion')
    )

# --- 7. Catálogo de Errores ---
for err in root.find('Error'):
    cursor.execute(
        "INSERT INTO Error (Codigo, Descripcion) VALUES (?, ?)",
        err.get('Codigo'),
        err.get('Descripcion')
    )

conn.commit()

# --- 8. Movimientos (con cálculo de nuevo saldo) ---
# Fetch all movements into a list, sort by Fecha asc
movs = []
for m in root.find('Movimientos'):
    movs.append({
        'valor_doc': m.get('ValorDocId'),
        'tipo_id': int(m.get('IdTipoMovimiento')),
        'fecha': datetime.fromisoformat(m.get('Fecha')),
        'monto': int(m.get('Monto')),
        'user': m.get('PostByUser'),
        'ip': m.get('PostInIP'),
        'time': m.get('PostTime')
    })
movs.sort(key=lambda x: x['fecha'])

for m in movs:
    # 1) Get empleado record
    cursor.execute(
        "SELECT Id, SaldoVacaciones FROM Empleado WHERE ValorDocumentoIdentidad = ?",
        m['valor_doc']
    )
    emp_row = cursor.fetchone()
    emp_id, current_saldo = emp_row.Id, emp_row.SaldoVacaciones

    # 2) Calculate new saldo
    accion = tipo_accion_map[m['tipo_id']].lower()
    if accion == 'credito':
        new_saldo = current_saldo + m['monto']
    else:
        new_saldo = current_saldo - m['monto']

    # 3) Update empleado saldo
    cursor.execute(
        "UPDATE Empleado SET SaldoVacaciones = ? WHERE Id = ?",
        new_saldo,
        emp_id
    )

    # 4) Find user ID
    cursor.execute(
        "SELECT Id FROM Usuario WHERE Username = ?",
        m['user']
    )
    user_id = cursor.fetchone().Id

    # 5) Insert movimiento
    cursor.execute(
        """
        INSERT INTO Movimiento
          (IdEmpleado, IdTipoMovimiento, Fecha, Monto, NuevoSaldo, IdPostByUser, PostInIP, PostTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        emp_id,
        m['tipo_id'],
        m['fecha'],
        m['monto'],
        new_saldo,
        user_id,
        m['ip'],
        m['time']
    )

conn.commit()
print("Carga de datos completada exitosamente.")
