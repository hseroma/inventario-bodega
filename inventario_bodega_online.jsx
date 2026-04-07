
import { useState, useEffect, useRef, useCallback } from "react";

// ── Storage helpers ──────────────────────────────────────────────
const DB_KEY = 'roma_inv_db_v3';

async function loadDB() {
  try {
    const r = await window.storage.get(DB_KEY, true);
    if (r && r.value) {
      const parsed = JSON.parse(r.value);
      if (!parsed.usuarios) parsed.usuarios = initUsuarios();
      if (!parsed.equipos || parsed.equipos.length === 0) parsed.equipos = initEquipos();
      if (!parsed.epp) parsed.epp = initEpp();
      if (!parsed.asignacionesEpp) parsed.asignacionesEpp = [];
      if (!parsed.stock) parsed.stock = initStock();
      if (!parsed.registroUso) parsed.registroUso = [];
      if (!parsed.movimientos) parsed.movimientos = [];
      return parsed;
    }
  } catch (e) {}
  return { usuarios: initUsuarios(), equipos: initEquipos(), movimientos: [], stock: initStock(), epp: initEpp(), asignacionesEpp: [], registroUso: [] };
}

async function saveDB(db) {
  try { await window.storage.set(DB_KEY, JSON.stringify(db), true); } catch (e) { console.error('Save error', e); }
}

function today() { return new Date().toISOString().split('T')[0]; }
function nuevoId() { return Date.now() + Math.floor(Math.random() * 9999); }

function initUsuarios() {
  return [
    { id: 1, nombre: 'Administrador', user: 'admin', pass: '1234', rol: 'admin' },
    { id: 2, nombre: 'Operador Bodega', user: 'bodega', pass: 'bodega2024', rol: 'operador' }
  ];
}

function initEquipos() {
  return initStock().filter(s => s.prefijo === 'EQP' || s.prefijo === 'HTA' || s.prefijo === 'HRA').map((s, idx) => ({
    id: idx + 1, codigo: s.codigo, nombre: s.descripcion,
    tipo: s.prefijo === 'EQP' ? 'Equipo' : 'Herramienta',
    condicion: 'Bueno', estado: 'disponible', cantidad: s.enBodega || 0
  }));
}

function initStock() {
  return [{"id":1,"codigo":"EQP-COM-01","descripcion":"COMPRESOR DE 100 LB MOTOR 1 HP CON POLEA AZUL","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":2,"codigo":"EQP-COM-02","descripcion":"COMPRESOR DE 100 LB MOTOR 1 HP CON POLEA ROJO","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":3,"codigo":"EQP-CNG-01","descripcion":"CONGELADOR","unidad":"UND","enBodega":0,"stockMinimo":1,"prefijo":"EQP"},{"id":4,"codigo":"EQP-CNG-02","descripcion":"CONGELADOR","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":5,"codigo":"EQP-DEM-01","descripcion":"DEMOLEDOR DEWALT SDS-MAX","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":6,"codigo":"EQP-CAN-01","descripcion":"CANGURO ECOROAD REF. TO80D","unidad":"UND","enBodega":0,"stockMinimo":1,"prefijo":"EQP"},{"id":7,"codigo":"EQP-DIF-01","descripcion":"DIFERENCIAL TOOLCRAFT 3 TON TC0856 ROJA","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":8,"codigo":"EQP-DIF-02","descripcion":"DIFERENCIAL UYUSTOOLS 2 TON DAÑADO","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":9,"codigo":"EQP-DIF-03","descripcion":"DIFERENCIAL UYUSTOOLS 3 TON TEC 203","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":10,"codigo":"EQP-DIF-04","descripcion":"DIFERENCIAL UYUSTOOLS 1 TON","unidad":"UND","enBodega":0,"stockMinimo":1,"prefijo":"EQP"},{"id":36,"codigo":"EQP-MTB-01","descripcion":"MOTOBOMBA DE 2\" DIESEL (COMPLETA)","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":37,"codigo":"EQP-MTB-02","descripcion":"MOTOBOMBA DE 2\" DIESEL (COMPLETA)","unidad":"UND","enBodega":0,"stockMinimo":1,"prefijo":"EQP"},{"id":38,"codigo":"EQP-MTB-03","descripcion":"MOTOBOMBA DE 2\" GASOLINA","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":42,"codigo":"EQP-MTS-03","descripcion":"MOTOSOLDADOR LINCON 300 INVERSOR ROJO","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":50,"codigo":"EQP-PG9-02","descripcion":"PULIDORA DE 9\" DEWALT DWE491-B3","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":55,"codigo":"EQP-PG7-07","descripcion":"PULIDORA DE 7\" INGCO CON GUARDA","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":76,"codigo":"EQP-TAL-01","descripcion":"TALADRO STANLEY STDH8013-B3","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":77,"codigo":"EQP-TAL-02","descripcion":"TALADRO INGCO UID8508","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":88,"codigo":"EQP-TRZ-01","descripcion":"TRONZADORA BOSCH GCO 14-24","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"EQP"},{"id":92,"codigo":"HTA-ALC-01","descripcion":"ALICATE","unidad":"UND","enBodega":2,"stockMinimo":2,"prefijo":"HTA"},{"id":96,"codigo":"HTA-BAL-01","descripcion":"BALDE DE 5 GAL","unidad":"UND","enBodega":10,"stockMinimo":3,"prefijo":"HTA"},{"id":98,"codigo":"HTA-BAR-01","descripcion":"BARRAS","unidad":"UND","enBodega":5,"stockMinimo":2,"prefijo":"HTA"},{"id":106,"codigo":"HTA-BDC-01","descripcion":"BALDE DE CONSTRUCCION NEGRO","unidad":"UND","enBodega":21,"stockMinimo":5,"prefijo":"HTA"},{"id":129,"codigo":"HTA-BUR-03","descripcion":"BURRO DE PREFABRICAR TUBERIA","unidad":"UND","enBodega":15,"stockMinimo":5,"prefijo":"HTA"},{"id":139,"codigo":"HTA-CAN-55","descripcion":"CANECA 55 GAL","unidad":"UND","enBodega":5,"stockMinimo":3,"prefijo":"HTA"},{"id":154,"codigo":"HTA-CIZ-01","descripcion":"CIZALLA DE 24\"","unidad":"UND","enBodega":4,"stockMinimo":2,"prefijo":"HTA"},{"id":168,"codigo":"HTA-CON-G","descripcion":"CONOS DE SEÑALIZACION GRANDE","unidad":"UND","enBodega":7,"stockMinimo":3,"prefijo":"HTA"},{"id":187,"codigo":"HTA-CRR-01","descripcion":"CARRETILLA BELLOTA METAL AMARILLA","unidad":"UND","enBodega":1,"stockMinimo":1,"prefijo":"HTA"},{"id":249,"codigo":"HTA-MAR-01","descripcion":"MARTILLO","unidad":"UND","enBodega":4,"stockMinimo":2,"prefijo":"HTA"},{"id":265,"codigo":"HTA-MRS-01","descripcion":"MARCO DE SEGUETA","unidad":"UND","enBodega":2,"stockMinimo":2,"prefijo":"HTA"},{"id":266,"codigo":"HTA-NVM-01","descripcion":"NIVEL DE MANO","unidad":"UND","enBodega":4,"stockMinimo":2,"prefijo":"HTA"},{"id":269,"codigo":"HTA-PCS","descripcion":"PICAS","unidad":"UND","enBodega":13,"stockMinimo":3,"prefijo":"HTA"},{"id":279,"codigo":"HTA-PLA","descripcion":"PALAS","unidad":"UND","enBodega":14,"stockMinimo":5,"prefijo":"HTA"},{"id":304,"codigo":"HRA-SILL-01","descripcion":"SILLAS PLASTICAS DE BODEGA","unidad":"UND","enBodega":7,"stockMinimo":2,"prefijo":"HRA"},{"id":305,"codigo":"HTA-SER-01","descripcion":"SERRUCHO 18\"","unidad":"UND","enBodega":6,"stockMinimo":2,"prefijo":"HTA"},{"id":321,"codigo":"MAT-ACE-MB","descripcion":"ACEITE MOBIL DELVAC 15W-40","unidad":"GAL","enBodega":0,"stockMinimo":2,"prefijo":"MAT"},{"id":334,"codigo":"MAT-CEM","descripcion":"CEMENTO","unidad":"BLT","enBodega":0,"stockMinimo":5,"prefijo":"MAT"},{"id":363,"codigo":"MAT-SOL-01","descripcion":"SOLDADURA WEST ARCO 6010 3/32","unidad":"KG","enBodega":0,"stockMinimo":5,"prefijo":"MAT"},{"id":364,"codigo":"MAT-SOL-02","descripcion":"SOLDADURA WEST ARCO 6010 1/8","unidad":"KG","enBodega":0,"stockMinimo":5,"prefijo":"MAT"}];
}

function initEpp() {
  return [
    {id:1,codigo:"EPP-CSC-01",descripcion:"CASCO DE SEGURIDAD",unidad:"UND",enBodega:15,stockMinimo:5,talla:"",prefijo:"EPP"},
    {id:2,codigo:"EPP-LEN-01",descripcion:"LENTES DE SEGURIDAD",unidad:"UND",enBodega:20,stockMinimo:10,talla:"",prefijo:"EPP"},
    {id:3,codigo:"EPP-GUA-01",descripcion:"GUANTES DE CARNAZA",unidad:"PAR",enBodega:12,stockMinimo:5,talla:"L",prefijo:"EPP"},
    {id:4,codigo:"EPP-GUA-02",descripcion:"GUANTES DE CARNAZA",unidad:"PAR",enBodega:8,stockMinimo:5,talla:"XL",prefijo:"EPP"},
    {id:5,codigo:"EPP-BOT-01",descripcion:"BOTAS DE SEGURIDAD PUNTA ACERO",unidad:"PAR",enBodega:6,stockMinimo:3,talla:"40",prefijo:"EPP"},
    {id:6,codigo:"EPP-BOT-02",descripcion:"BOTAS DE SEGURIDAD PUNTA ACERO",unidad:"PAR",enBodega:4,stockMinimo:3,talla:"42",prefijo:"EPP"},
    {id:7,codigo:"EPP-ARN-01",descripcion:"ARNES DE SEGURIDAD",unidad:"UND",enBodega:5,stockMinimo:2,talla:"",prefijo:"EPP"},
    {id:8,codigo:"EPP-TAP-01",descripcion:"TAPAOIDOS",unidad:"UND",enBodega:30,stockMinimo:10,talla:"",prefijo:"EPP"},
    {id:9,codigo:"EPP-MAS-01",descripcion:"MASCARA PARA SOLDAR",unidad:"UND",enBodega:4,stockMinimo:2,talla:"",prefijo:"EPP"},
    {id:10,codigo:"EPP-CAM-01",descripcion:"CARETA FACIAL",unidad:"UND",enBodega:3,stockMinimo:1,talla:"",prefijo:"EPP"},
    {id:11,codigo:"EPP-OVE-01",descripcion:"OVEROL DE TRABAJO",unidad:"UND",enBodega:10,stockMinimo:5,talla:"L",prefijo:"EPP"},
    {id:12,codigo:"EPP-CHQ-01",descripcion:"CHALECO REFLECTIVO",unidad:"UND",enBodega:15,stockMinimo:5,talla:"",prefijo:"EPP"},
  ];
}

// ── Styles ───────────────────────────────────────────────────────
const CSS = `
*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}
body{background:#f0f2f5;color:#222;font-size:15px}
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#1a4d6e 0%,#0d2f45 100%)}
.login-card{background:white;border-radius:16px;padding:40px 36px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.login-logo{text-align:center;margin-bottom:28px}
.login-logo h1{font-size:20px;font-weight:600;color:#1B6B2F;margin-top:10px}
.login-logo p{font-size:13px;color:#888;margin-top:4px}
.lf{margin-bottom:16px}
.lf label{display:block;font-size:13px;font-weight:500;color:#555;margin-bottom:6px}
.lf input{width:100%;padding:10px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none}
.lf input:focus{border-color:#1a4d6e}
.btn-login{width:100%;padding:12px;background:#1a4d6e;color:white;border:none;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;margin-top:4px}
.btn-login:hover{background:#163f5a}
.lerr{background:#FCEBEB;color:#A32D2D;border:1px solid #F7C1C1;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:14px}
header{background:#1a4d6e;color:white;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:54px}
header h1{font-size:17px;font-weight:500}
.hdr-right{display:flex;align-items:center;gap:12px;font-size:13px}
.user-pill{background:rgba(255,255,255,.15);padding:5px 12px;border-radius:20px}
.btn-logout{background:none;border:1px solid rgba(255,255,255,.4);color:white;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px}
.app-body{display:flex;min-height:calc(100vh - 54px)}
nav{background:white;border-right:1.5px solid #e8e8e8;width:204px;flex-shrink:0;padding:12px 0;overflow-y:auto}
.nav-btn{width:100%;padding:11px 20px;border:none;background:none;cursor:pointer;font-size:13px;color:#555;text-align:left;border-left:3px solid transparent;font-family:inherit;display:flex;align-items:center;gap:8px}
.nav-btn.active{color:#1a4d6e;border-left-color:#1a4d6e;background:#f0f5fa;font-weight:600}
.nav-btn:hover:not(.active){background:#f8f8f8}
.nav-sep{height:1px;background:#f0f0f0;margin:8px 12px}
.badge-red{background:#E24B4A;color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:auto}
main{flex:1;padding:24px 20px;overflow-x:auto;background:#f0f2f5;min-width:0}
.notif{padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;font-weight:500}
.notif.ok{background:#EAF3DE;color:#3B6D11;border:1px solid #C0DD97}
.notif.err{background:#FCEBEB;color:#A32D2D;border:1px solid #F7C1C1}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:22px}
.mc{background:white;border-radius:10px;padding:16px 14px;border:1px solid #eee}
.mc .lbl{font-size:12px;color:#999;margin-bottom:6px}
.mc .val{font-size:28px;font-weight:700}
.card{background:white;border-radius:10px;border:1px solid #eee;overflow:hidden;margin-bottom:18px}
.card-header{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;flex-wrap:wrap;gap:10px}
.card-header h2{font-size:15px;font-weight:600}
.search{padding:7px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;width:230px;font-family:inherit;outline:none}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#f8f8f8;padding:10px 12px;text-align:left;font-weight:600;color:#555;font-size:12px;white-space:nowrap}
td{padding:9px 12px;border-top:1px solid #f2f2f2;vertical-align:middle}
tr:hover td{background:#fafcff}
.bdg{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
.bdg.disponible{background:#EAF3DE;color:#3B6D11}
.bdg.proyecto{background:#EEEDFE;color:#3C3489}
.bdg.taller{background:#FAECE7;color:#993C1D}
.bdg.alquilado{background:#E6F1FB;color:#0C447C}
.form-card{background:white;border-radius:10px;border:1px solid #eee;padding:24px;max-width:700px}
.form-card h2{font-size:16px;font-weight:600;margin-bottom:20px;color:#1a4d6e}
.fg{margin-bottom:15px}
.fg label{display:block;font-size:13px;font-weight:500;color:#555;margin-bottom:5px}
.fg input,.fg select,.fg textarea{width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;outline:none}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#1a4d6e}
.fg textarea{resize:vertical;min-height:75px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.btn{padding:9px 20px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit}
.btn-primary{background:#1a4d6e;color:white}
.btn-primary:hover{background:#163f5a}
.btn-danger{background:#D85A30;color:white}
.btn-outline{background:white;border:1px solid #ddd;color:#555}
.btn-sm{padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #ddd;background:white;cursor:pointer;font-family:inherit}
.btn-sm:hover{background:#f5f5f5}
.btn-edit{border-color:#378ADD;color:#185FA5}
.eq-item{padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid #f5f5f5;display:flex;gap:8px;align-items:center}
.eq-item:hover{background:#f0f5fa}
.eq-item-cod{font-weight:700;color:#1a4d6e;min-width:120px;font-size:12px}
.eq-item-nom{color:#333;flex:1}
.hist-item{padding:14px 18px;border-bottom:1px solid #f2f2f2;display:flex;gap:14px;align-items:flex-start}
.hdot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:5px}
.hdot.entrada{background:#639922}.hdot.salida{background:#D85A30}.hdot.retorno{background:#378ADD}.hdot.ajuste{background:#854F0B}
.alert-bar{background:#FCEBEB;border:1px solid #F7C1C1;border-radius:10px;padding:14px 18px;margin-bottom:18px}
.filter-tabs{display:flex;gap:6px;flex-wrap:wrap}
.ftab{padding:6px 14px;border-radius:20px;border:1px solid #ddd;background:white;cursor:pointer;font-size:12px;font-family:inherit}
.ftab.active{background:#1a4d6e;color:white;border-color:#1a4d6e}
.empty-state{text-align:center;padding:40px;color:#bbb;font-size:14px}
.user-item{background:white;border-radius:10px;border:1px solid #eee;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.user-avatar{width:42px;height:42px;border-radius:50%;background:#E6F1FB;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#0C447C;flex-shrink:0}
.loading-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#1a4d6e 0%,#0d2f45 100%);color:white;font-size:18px;gap:12px}
`;

// ── Logo base64 (small inline SVG as placeholder) ─────────────────
const LOGO_SVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iIzFCNkIyRiIvPjx0ZXh0IHg9IjQwIiB5PSI1MCIgZm9udC1zaXplPSIzNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UjwvdGV4dD48L3N2Zz4=`;

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [db, setDB] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [section, setSection] = useState('salida');
  const [notif, setNotif] = useState(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState(false);
  const notifTimer = useRef(null);

  // Poll for changes every 15 seconds when logged in
  useEffect(() => {
    loadDB().then(data => { setDB(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      const fresh = await loadDB();
      setDB(fresh);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const save = useCallback(async (newDB) => {
    setDB({ ...newDB });
    await saveDB(newDB);
  }, []);

  const showNotif = useCallback((msg, tipo = 'ok') => {
    setNotif({ msg, tipo });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 3500);
  }, []);

  const doLogin = () => {
    const found = db.usuarios.find(u => u.user === loginUser.trim() && u.pass === loginPass.trim());
    if (!found) { setLoginErr(true); return; }
    setCurrentUser(found);
    setLoginErr(false);
    setLoginUser('');
    setLoginPass('');
    setSection('salida');
  };

  const doLogout = () => { setCurrentUser(null); setSection('salida'); };

  if (loading) return (
    <div className="loading-wrap">
      <style>{CSS}</style>
      <span>⏳ Cargando inventario...</span>
    </div>
  );

  if (!currentUser) return (
    <div className="login-wrap">
      <style>{CSS}</style>
      <div className="login-card">
        <div className="login-logo">
          <img src={LOGO_SVG} style={{ height: 60 }} alt="Roma" />
          <h1>Roma Integral Group</h1>
          <p>Sistema de Inventario — Bodega</p>
        </div>
        {loginErr && <div className="lerr">Usuario o contraseña incorrectos.</div>}
        <div className="lf">
          <label>Usuario</label>
          <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ingresa tu usuario" autoComplete="username" />
        </div>
        <div className="lf">
          <label>Contraseña</label>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Ingresa tu contraseña" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <button className="btn-login" onClick={doLogin}>Ingresar</button>
      </div>
    </div>
  );

  const isAdmin = currentUser.rol === 'admin';
  const eppAlertas = (db.epp || []).filter(e => e.enBodega < e.stockMinimo);
  const stockAlertas = (db.stock || []).filter(s => s.enBodega < s.stockMinimo);

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'salida', label: '📤 Registrar Salida' },
    { id: 'ingreso', label: '📥 Registrar Ingreso' },
    { id: 'equipos', label: '🔧 Equipos / Herramientas' },
    { id: 'stock', label: '📦 Stock Materiales', badge: stockAlertas.length },
    null,
    { id: 'epp', label: '🦺 EPPs', badge: eppAlertas.length },
    { id: 'asignar-epp', label: '👷 Asignar EPP' },
    { id: 'ingreso-epp', label: '📥 Ingreso EPPs' },
    null,
    { id: 'registro-uso', label: '📋 Registro de Uso' },
    { id: 'historial', label: '📜 Historial' },
    { id: 'reporte', label: '📈 Reportes' },
    ...(isAdmin ? [null, { id: 'usuarios', label: '👥 Usuarios' }] : []),
  ];

  return (
    <div>
      <style>{CSS}</style>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={LOGO_SVG} style={{ height: 36, borderRadius: 6 }} alt="Roma" />
          <span style={{ fontSize: 15, fontWeight: 400, opacity: 0.85 }}>Inventario Bodega</span>
        </div>
        <div className="hdr-right">
          <div className="user-pill">👤 {currentUser.nombre}</div>
          <button className="btn-logout" onClick={doLogout}>Cerrar sesión</button>
        </div>
      </header>
      <div className="app-body">
        <nav>
          {navItems.map((item, i) => item === null
            ? <div key={i} className="nav-sep" />
            : <button key={item.id} className={`nav-btn${section === item.id ? ' active' : ''}`} onClick={() => setSection(item.id)}>
                {item.label}
                {item.badge > 0 && <span className="badge-red">{item.badge}</span>}
              </button>
          )}
        </nav>
        <main>
          {notif && <div className={`notif ${notif.tipo}`}>{notif.msg}</div>}
          {section === 'dashboard' && <Dashboard db={db} />}
          {section === 'salida' && <Salida db={db} save={save} user={currentUser} showNotif={showNotif} />}
          {section === 'ingreso' && <Ingreso db={db} save={save} user={currentUser} showNotif={showNotif} />}
          {section === 'equipos' && <Equipos db={db} save={save} user={currentUser} showNotif={showNotif} isAdmin={isAdmin} />}
          {section === 'stock' && <Stock db={db} save={save} user={currentUser} showNotif={showNotif} isAdmin={isAdmin} />}
          {section === 'epp' && <Epp db={db} save={save} user={currentUser} showNotif={showNotif} isAdmin={isAdmin} />}
          {section === 'asignar-epp' && <AsignarEpp db={db} save={save} user={currentUser} showNotif={showNotif} />}
          {section === 'ingreso-epp' && <IngresoEpp db={db} save={save} user={currentUser} showNotif={showNotif} />}
          {section === 'registro-uso' && <RegistroUso db={db} save={save} user={currentUser} showNotif={showNotif} isAdmin={isAdmin} />}
          {section === 'historial' && <Historial db={db} />}
          {section === 'reporte' && <Reporte db={db} />}
          {section === 'usuarios' && isAdmin && <Usuarios db={db} save={save} showNotif={showNotif} />}
        </main>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────
function Dashboard({ db }) {
  const eq = db.equipos || [];
  const total = eq.length;
  const disp = eq.filter(e => (e.cantidad || 0) > 0).length;
  const stockAl = (db.stock || []).filter(s => s.enBodega < s.stockMinimo);
  const eppAl = (db.epp || []).filter(e => e.enBodega < e.stockMinimo);
  return (
    <div>
      <h2 style={{ marginBottom: 16, color: '#1a4d6e' }}>📊 Dashboard</h2>
      <div className="metrics">
        <div className="mc"><div className="lbl">Total equipos</div><div className="val" style={{ color: '#1a4d6e' }}>{total}</div></div>
        <div className="mc"><div className="lbl">Con stock</div><div className="val" style={{ color: '#3B6D11' }}>{disp}</div></div>
        <div className="mc"><div className="lbl">Stock bajo (materiales)</div><div className="val" style={{ color: '#E24B4A' }}>{stockAl.length}</div></div>
        <div className="mc"><div className="lbl">EPPs bajo stock</div><div className="val" style={{ color: '#E24B4A' }}>{eppAl.length}</div></div>
        <div className="mc"><div className="lbl">Movimientos totales</div><div className="val" style={{ color: '#534AB7' }}>{(db.movimientos || []).length}</div></div>
        <div className="mc"><div className="lbl">Usuarios</div><div className="val" style={{ color: '#0C447C' }}>{(db.usuarios || []).length}</div></div>
      </div>
      {stockAl.length > 0 && (
        <div className="alert-bar">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#A32D2D', marginBottom: 10 }}>⚠️ Stock bajo — Materiales</h3>
          {stockAl.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(163,45,45,0.1)', fontSize: 13 }}>
              <span><b>{s.codigo}</b> — {s.descripcion}</span>
              <span>Bodega: <b>{s.enBodega}</b> / Mín: {s.stockMinimo}</span>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="card-header"><h2>Últimos movimientos</h2></div>
        <div>
          {(db.movimientos || []).slice(0, 10).map(m => (
            <div key={m.id} className="hist-item">
              <div className={`hdot ${m.tipo}`} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{m.equipo} <span style={{ fontSize: 12, color: '#888' }}>({m.codigo})</span></div>
                <div style={{ fontSize: 12, color: '#999' }}>{m.fecha} · {m.detalle}</div>
              </div>
            </div>
          ))}
          {!(db.movimientos || []).length && <div className="empty-state">Sin movimientos aún.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Salida ───────────────────────────────────────────────────────
function Salida({ db, save, user, showNotif }) {
  const [busq, setBusq] = useState('');
  const [selected, setSelected] = useState(null);
  const [motivo, setMotivo] = useState('proyecto');
  const [fecha, setFecha] = useState(today());
  const [resp, setResp] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [obs, setObs] = useState('');
  const [cant, setCant] = useState(1);

  const resultados = busq.trim().length > 1
    ? (db.equipos || []).filter(e => (e.cantidad || 0) > 0 && (e.codigo.toLowerCase().includes(busq.toLowerCase()) || e.nombre.toLowerCase().includes(busq.toLowerCase())))
    : [];

  const registrar = () => {
    if (!selected) { showNotif('Selecciona un equipo primero.', 'err'); return; }
    if (!resp.trim()) { showNotif('Ingresa el responsable.', 'err'); return; }
    if (!fecha) { showNotif('Ingresa la fecha.', 'err'); return; }
    const c = parseInt(cant) || 1;
    const eq = db.equipos.find(e => e.id === selected.id);
    if (!eq || (eq.cantidad || 0) < c) { showNotif('Stock insuficiente.', 'err'); return; }
    eq.cantidad = (eq.cantidad || 0) - c;
    const newMov = { id: nuevoId(), tipo: 'salida', fecha, equipoId: eq.id, equipo: eq.nombre, codigo: eq.codigo, detalle: `Salida: ${c} und. Motivo: ${motivo}. Proyecto: ${proyecto || '—'}`, responsable: resp, obs };
    const newRU = { id: nuevoId(), codigo: eq.codigo, nombre: eq.nombre, tipo: eq.tipo, equipoId: eq.id, motivo, proyecto, responsable: resp, fechaSalida: fecha, tarifa: 0, estado: 'activo' };
    const newDB = { ...db, movimientos: [newMov, ...(db.movimientos || [])], registroUso: [newRU, ...(db.registroUso || [])] };
    save(newDB);
    showNotif(`✅ Salida registrada: ${eq.nombre} (${c} und)`);
    setSelected(null); setBusq(''); setCant(1); setResp(''); setProyecto(''); setObs('');
  };

  return (
    <div className="form-card">
      <h2>📤 Registrar Salida de Bodega</h2>
      <div className="fg">
        <label>Buscar equipo o herramienta</label>
        <input value={busq} onChange={e => { setBusq(e.target.value); setSelected(null); }} placeholder="Código o nombre..." />
        {resultados.length > 0 && !selected && (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, maxHeight: 180, overflowY: 'auto', marginTop: 4, background: 'white' }}>
            {resultados.map(e => (
              <div key={e.id} className="eq-item" onClick={() => { setSelected(e); setBusq(''); }}>
                <span className="eq-item-cod">{e.codigo}</span>
                <span className="eq-item-nom">{e.nombre}</span>
                <span style={{ fontSize: 11, color: '#3B6D11', background: '#EAF3DE', padding: '2px 8px', borderRadius: 10 }}>{e.cantidad} en bodega</span>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 8, padding: '10px 14px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span><b>{selected.codigo}</b> — {selected.nombre} · Stock: <b>{selected.cantidad}</b></span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 16 }}>✕</button>
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="fg"><label>Cantidad a sacar</label><input type="number" value={cant} min={1} onChange={e => setCant(e.target.value)} /></div>
        <div className="fg"><label>Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
      </div>
      <div className="fg">
        <label>Motivo</label>
        <select value={motivo} onChange={e => setMotivo(e.target.value)}>
          <option value="proyecto">Proyecto / Obra</option>
          <option value="taller">Taller / Reparación</option>
          <option value="alquiler">Alquiler</option>
        </select>
      </div>
      <div className="fg"><label>Proyecto / Cliente</label><input value={proyecto} onChange={e => setProyecto(e.target.value)} placeholder="Nombre del proyecto u obra" /></div>
      <div className="fg"><label>Responsable</label><input value={resp} onChange={e => setResp(e.target.value)} placeholder="Quien recibe el equipo" /></div>
      <div className="fg"><label>Observaciones</label><textarea value={obs} onChange={e => setObs(e.target.value)} /></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={registrar}>Registrar salida</button>
        <button className="btn btn-outline" onClick={() => { setSelected(null); setBusq(''); }}>Limpiar</button>
      </div>
    </div>
  );
}

// ── Ingreso ──────────────────────────────────────────────────────
function Ingreso({ db, save, user, showNotif }) {
  const [busq, setBusq] = useState('');
  const [selected, setSelected] = useState(null);
  const [fecha, setFecha] = useState(today());
  const [resp, setResp] = useState('');
  const [cant, setCant] = useState(1);
  const [obs, setObs] = useState('');

  const resultados = busq.trim().length > 1
    ? (db.equipos || []).filter(e => e.codigo.toLowerCase().includes(busq.toLowerCase()) || e.nombre.toLowerCase().includes(busq.toLowerCase()))
    : [];

  const registrar = () => {
    if (!selected) { showNotif('Selecciona un equipo primero.', 'err'); return; }
    if (!resp.trim() || !fecha) { showNotif('Completa fecha y responsable.', 'err'); return; }
    const c = parseInt(cant) || 1;
    const eq = db.equipos.find(e => e.id === selected.id);
    if (!eq) return;
    eq.cantidad = (eq.cantidad || 0) + c;
    const newMov = { id: nuevoId(), tipo: 'entrada', fecha, equipoId: eq.id, equipo: eq.nombre, codigo: eq.codigo, detalle: `Ingreso: ${c} und.`, responsable: resp, obs };
    save({ ...db, movimientos: [newMov, ...(db.movimientos || [])] });
    showNotif(`✅ Ingreso registrado: ${eq.nombre} (${c} und)`);
    setSelected(null); setBusq(''); setCant(1); setResp(''); setObs('');
  };

  return (
    <div className="form-card">
      <h2>📥 Registrar Ingreso a Bodega</h2>
      <div className="fg">
        <label>Buscar equipo o herramienta</label>
        <input value={busq} onChange={e => { setBusq(e.target.value); setSelected(null); }} placeholder="Código o nombre..." />
        {resultados.length > 0 && !selected && (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, maxHeight: 180, overflowY: 'auto', marginTop: 4, background: 'white' }}>
            {resultados.map(e => (
              <div key={e.id} className="eq-item" onClick={() => { setSelected(e); setBusq(''); }}>
                <span className="eq-item-cod">{e.codigo}</span>
                <span className="eq-item-nom">{e.nombre}</span>
                <span style={{ fontSize: 11, color: '#3B6D11', background: '#EAF3DE', padding: '2px 8px', borderRadius: 10 }}>{e.cantidad || 0} en bodega</span>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 8, padding: '10px 14px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span><b>{selected.codigo}</b> — {selected.nombre}</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 16 }}>✕</button>
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="fg"><label>Cantidad</label><input type="number" value={cant} min={1} onChange={e => setCant(e.target.value)} /></div>
        <div className="fg"><label>Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
      </div>
      <div className="fg"><label>Responsable recepción</label><input value={resp} onChange={e => setResp(e.target.value)} /></div>
      <div className="fg"><label>Observaciones</label><textarea value={obs} onChange={e => setObs(e.target.value)} /></div>
      <button className="btn btn-primary" onClick={registrar}>Registrar ingreso</button>
    </div>
  );
}

// ── Equipos ──────────────────────────────────────────────────────
function Equipos({ db, save, user, showNotif, isAdmin }) {
  const [busq, setBusq] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [cod, setCod] = useState('');
  const [nom, setNom] = useState('');
  const [tipo, setTipo] = useState('Equipo');
  const [cond, setCond] = useState('Bueno');
  const [cantNew, setCantNew] = useState(1);

  const lista = (db.equipos || []).filter(e => !busq || e.nombre.toLowerCase().includes(busq.toLowerCase()) || e.codigo.toLowerCase().includes(busq.toLowerCase()));

  const guardar = () => {
    if (!cod.trim() || !nom.trim()) { showNotif('Completa código y nombre.', 'err'); return; }
    if ((db.equipos || []).find(e => e.codigo === cod.trim())) { showNotif('Ese código ya existe.', 'err'); return; }
    const c = Math.max(0, parseInt(cantNew) || 0);
    const eq = { id: nuevoId(), codigo: cod.trim(), nombre: nom.trim(), tipo, condicion: cond, estado: 'disponible', cantidad: c };
    const newMov = { id: nuevoId(), tipo: 'entrada', fecha: today(), equipoId: eq.id, equipo: nom.trim(), codigo: cod.trim(), detalle: `Ingreso inicial: ${c} und`, responsable: user.nombre, obs: '' };
    save({ ...db, equipos: [...(db.equipos || []), eq], movimientos: [newMov, ...(db.movimientos || [])] });
    showNotif(`✅ Equipo "${nom.trim()}" agregado.`);
    setCod(''); setNom(''); setCantNew(1); setShowForm(false);
  };

  const elim = (id) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    save({ ...db, equipos: (db.equipos || []).filter(e => e.id !== id) });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>🔧 Equipos y Herramientas</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input className="search" placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
            {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Nuevo</button>}
          </div>
        </div>
        {showForm && (
          <div style={{ padding: 20, borderBottom: '1px solid #f0f0f0', background: '#fafcff' }}>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="fg"><label>Código</label><input value={cod} onChange={e => setCod(e.target.value)} placeholder="EQP-XXX-01" /></div>
              <div className="fg"><label>Nombre</label><input value={nom} onChange={e => setNom(e.target.value)} /></div>
            </div>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="fg"><label>Tipo</label><select value={tipo} onChange={e => setTipo(e.target.value)}><option>Equipo</option><option>Herramienta</option><option>Máquina</option></select></div>
              <div className="fg"><label>Condición</label><select value={cond} onChange={e => setCond(e.target.value)}><option>Bueno</option><option>Regular</option><option>Malo</option></select></div>
            </div>
            <div className="fg" style={{ maxWidth: 200, marginBottom: 12 }}><label>Cantidad inicial</label><input type="number" value={cantNew} min={0} onChange={e => setCantNew(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={guardar}>Guardar</button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th style={{ textAlign: 'center' }}>Stock</th><th>Condición</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {lista.length ? lista.map(e => {
              const c = e.cantidad || 0;
              const color = c === 0 ? '#E24B4A' : c <= 2 ? '#854F0B' : '#3B6D11';
              return (
                <tr key={e.id}>
                  <td><b>{e.codigo}</b></td><td>{e.nombre}</td><td>{e.tipo}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color }}>{c}</td>
                  <td>{e.condicion}</td>
                  {isAdmin && <td><button className="btn-sm" style={{ borderColor: '#D85A30', color: '#D85A30' }} onClick={() => elim(e.id)}>Eliminar</button></td>}
                </tr>
              );
            }) : <tr><td colSpan={isAdmin ? 6 : 5} className="empty-state">Sin equipos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Stock ────────────────────────────────────────────────────────
function Stock({ db, save, user, showNotif, isAdmin }) {
  const [busq, setBusq] = useState('');
  const [filtro, setFiltro] = useState('todos');

  let lista = (db.stock || []);
  if (filtro === 'alerta') lista = lista.filter(s => s.enBodega < s.stockMinimo);
  if (filtro === 'ok') lista = lista.filter(s => s.enBodega >= s.stockMinimo);
  if (busq) lista = lista.filter(s => s.codigo.toLowerCase().includes(busq.toLowerCase()) || s.descripcion.toLowerCase().includes(busq.toLowerCase()));

  const ajustar = (id, val, campo) => {
    const newStock = (db.stock || []).map(s => {
      if (s.id !== id) return s;
      const n = Math.max(0, parseInt(val) || 0);
      const antes = campo === 'bodega' ? s.enBodega : s.stockMinimo;
      const newMov = { id: nuevoId(), tipo: 'ajuste', fecha: today(), equipoId: null, equipo: s.descripcion, codigo: s.codigo, detalle: `Ajuste stock ${campo}: ${antes} → ${n}`, responsable: user.nombre, obs: '' };
      setTimeout(() => save({ ...db, movimientos: [newMov, ...(db.movimientos || [])], stock: newStock }), 0);
      return campo === 'bodega' ? { ...s, enBodega: n } : { ...s, stockMinimo: n };
    });
    save({ ...db, stock: newStock });
  };

  const filters = [{ id: 'todos', label: 'Todos' }, { id: 'alerta', label: '⚠ Stock bajo' }, { id: 'ok', label: '✅ OK' }];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>📦 Stock — Materiales</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-tabs">
              {filters.map(f => <button key={f.id} className={`ftab${filtro === f.id ? ' active' : ''}`} onClick={() => setFiltro(f.id)}>{f.label}</button>)}
            </div>
            <input className="search" placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Descripción</th><th>Unidad</th>
              <th style={{ textAlign: 'center' }}>En Bodega</th>
              <th style={{ textAlign: 'center' }}>Stock Mín.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.length ? lista.map(s => {
              const bajo = s.enBodega < s.stockMinimo;
              return (
                <tr key={s.id}>
                  <td><b>{s.codigo}</b></td>
                  <td>{s.descripcion}</td>
                  <td>{s.unidad}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin
                      ? <input type="number" defaultValue={s.enBodega} onBlur={e => ajustar(s.id, e.target.value, 'bodega')} style={{ width: 70, padding: '4px 8px', border: '1.5px solid #378ADD', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                      : <b style={{ color: bajo ? '#E24B4A' : '#3B6D11' }}>{s.enBodega}</b>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin
                      ? <input type="number" defaultValue={s.stockMinimo} onBlur={e => ajustar(s.id, e.target.value, 'min')} style={{ width: 60, padding: '4px 8px', border: '1.5px solid #E24B4A', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                      : s.stockMinimo}
                  </td>
                  <td><span style={{ background: bajo ? '#FCEBEB' : '#EAF3DE', color: bajo ? '#A32D2D' : '#3B6D11', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{bajo ? '⚠ BAJO' : '✅ OK'}</span></td>
                </tr>
              );
            }) : <tr><td colSpan={6} className="empty-state">Sin items.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── EPP ──────────────────────────────────────────────────────────
function Epp({ db, save, user, showNotif, isAdmin }) {
  const [busq, setBusq] = useState('');
  const [filtro, setFiltro] = useState('todos');

  let lista = (db.epp || []);
  if (filtro === 'alerta') lista = lista.filter(e => e.enBodega < e.stockMinimo);
  if (filtro === 'ok') lista = lista.filter(e => e.enBodega >= e.stockMinimo);
  if (busq) lista = lista.filter(e => e.codigo.toLowerCase().includes(busq.toLowerCase()) || e.descripcion.toLowerCase().includes(busq.toLowerCase()));

  const ajustar = (id, val, campo) => {
    const newEpp = (db.epp || []).map(e => {
      if (e.id !== id) return e;
      const n = Math.max(0, parseInt(val) || 0);
      return campo === 'bodega' ? { ...e, enBodega: n } : { ...e, stockMinimo: n };
    });
    save({ ...db, epp: newEpp });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>🦺 EPPs — Elementos de Protección Personal</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="filter-tabs">
              {[{ id: 'todos', l: 'Todos' }, { id: 'alerta', l: '⚠ Bajo' }, { id: 'ok', l: '✅ OK' }].map(f => <button key={f.id} className={`ftab${filtro === f.id ? ' active' : ''}`} onClick={() => setFiltro(f.id)}>{f.l}</button>)}
            </div>
            <input className="search" placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
          </div>
        </div>
        <table>
          <thead><tr><th>Código</th><th>Descripción</th><th>Talla</th><th>Unidad</th><th style={{ textAlign: 'center' }}>En Bodega</th><th style={{ textAlign: 'center' }}>Mín.</th><th>Estado</th></tr></thead>
          <tbody>
            {lista.length ? lista.map(e => {
              const bajo = e.enBodega < e.stockMinimo;
              return (
                <tr key={e.id}>
                  <td><b>{e.codigo}</b></td><td>{e.descripcion}</td><td>{e.talla || '—'}</td><td>{e.unidad}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin ? <input type="number" defaultValue={e.enBodega} onBlur={ev => ajustar(e.id, ev.target.value, 'bodega')} style={{ width: 70, padding: '4px 8px', border: '1.5px solid #378ADD', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                      : <b style={{ color: bajo ? '#E24B4A' : '#3B6D11' }}>{e.enBodega}</b>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin ? <input type="number" defaultValue={e.stockMinimo} onBlur={ev => ajustar(e.id, ev.target.value, 'min')} style={{ width: 60, padding: '4px 8px', border: '1.5px solid #E24B4A', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                      : e.stockMinimo}
                  </td>
                  <td><span style={{ background: bajo ? '#FCEBEB' : '#EAF3DE', color: bajo ? '#A32D2D' : '#3B6D11', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{bajo ? '⚠ BAJO' : '✅ OK'}</span></td>
                </tr>
              );
            }) : <tr><td colSpan={7} className="empty-state">Sin EPPs.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Asignar EPP ──────────────────────────────────────────────────
function AsignarEpp({ db, save, user, showNotif }) {
  const [eppId, setEppId] = useState('');
  const [trab, setTrab] = useState('');
  const [cedula, setCedula] = useState('');
  const [proy, setProy] = useState('');
  const [cant, setCant] = useState(1);
  const [fecha, setFecha] = useState(today());
  const [resp, setResp] = useState('');
  const [obs, setObs] = useState('');

  const disponibles = (db.epp || []).filter(e => e.enBodega > 0);

  const asignar = () => {
    const id = parseInt(eppId);
    if (!id || !trab.trim() || !cedula.trim() || !resp.trim() || !fecha) { showNotif('Completa todos los campos requeridos.', 'err'); return; }
    const epp = (db.epp || []).find(e => e.id === id);
    if (!epp) return;
    const c = parseInt(cant) || 1;
    if (epp.enBodega < c) { showNotif(`Stock insuficiente. Disponible: ${epp.enBodega}`, 'err'); return; }
    const newEpp = (db.epp || []).map(e => e.id === id ? { ...e, enBodega: e.enBodega - c } : e);
    const asig = { id: nuevoId(), fecha, eppId: id, codigo: epp.codigo, epp: epp.descripcion, talla: epp.talla, cantidad: c, trabajador: trab, cedula, proyecto: proy, responsable: resp, obs };
    const newMov = { id: nuevoId(), tipo: 'salida', fecha, equipoId: null, equipo: epp.descripcion, codigo: epp.codigo, detalle: `Asignado a: ${trab} (CC: ${cedula}) — Proyecto: ${proy} — Cant: ${c}`, responsable: resp, obs };
    save({ ...db, epp: newEpp, asignacionesEpp: [asig, ...(db.asignacionesEpp || [])], movimientos: [newMov, ...(db.movimientos || [])] });
    showNotif(`✅ EPP asignado a ${trab}.`);
    setTrab(''); setCedula(''); setProy(''); setCant(1); setResp(''); setObs(''); setEppId('');
  };

  return (
    <div>
      <div className="form-card">
        <h2>👷 Asignar EPP a Trabajador</h2>
        <div className="fg">
          <label>EPP a asignar</label>
          <select value={eppId} onChange={e => setEppId(e.target.value)}>
            <option value="">Selecciona un EPP...</option>
            {disponibles.map(e => <option key={e.id} value={e.id}>{e.codigo} — {e.descripcion}{e.talla ? ` (${e.talla})` : ''} [Bodega: {e.enBodega}]</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="fg"><label>Trabajador</label><input value={trab} onChange={e => setTrab(e.target.value)} /></div>
          <div className="fg"><label>Cédula</label><input value={cedula} onChange={e => setCedula(e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="fg"><label>Proyecto / Obra</label><input value={proy} onChange={e => setProy(e.target.value)} /></div>
          <div className="fg"><label>Cantidad</label><input type="number" value={cant} min={1} onChange={e => setCant(e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="fg"><label>Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div className="fg"><label>Responsable entrega</label><input value={resp} onChange={e => setResp(e.target.value)} /></div>
        </div>
        <div className="fg"><label>Observaciones</label><textarea value={obs} onChange={e => setObs(e.target.value)} /></div>
        <button className="btn btn-primary" onClick={asignar}>Registrar asignación</button>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2>Historial de Asignaciones</h2></div>
        <div>
          {(db.asignacionesEpp || []).length ? (db.asignacionesEpp || []).map(a => (
            <div key={a.id} className="hist-item">
              <div className="hdot salida" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.codigo} — {a.epp} {a.talla ? `(${a.talla})` : ''} × {a.cantidad}</div>
                <div style={{ fontSize: 12, color: '#999' }}>👷 {a.trabajador} (CC: {a.cedula}) · {a.fecha} · Entregó: {a.responsable}{a.proyecto ? ` · 🏗️ ${a.proyecto}` : ''}</div>
              </div>
            </div>
          )) : <div className="empty-state">Sin asignaciones.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Ingreso EPP ──────────────────────────────────────────────────
function IngresoEpp({ db, save, user, showNotif }) {
  const [busq, setBusq] = useState('');
  const [selected, setSelected] = useState(null);
  const [cant, setCant] = useState(1);
  const [fecha, setFecha] = useState(today());
  const [resp, setResp] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [obs, setObs] = useState('');

  const resultados = busq.trim().length > 1
    ? (db.epp || []).filter(e => e.codigo.toLowerCase().includes(busq.toLowerCase()) || e.descripcion.toLowerCase().includes(busq.toLowerCase()))
    : [];

  const registrar = () => {
    if (!selected) { showNotif('Selecciona un EPP primero.', 'err'); return; }
    if (!resp.trim() || !fecha) { showNotif('Completa fecha y responsable.', 'err'); return; }
    const c = parseInt(cant) || 1;
    const newEpp = (db.epp || []).map(e => e.id === selected.id ? { ...e, enBodega: e.enBodega + c } : e);
    const newMov = { id: nuevoId(), tipo: 'entrada', fecha, equipoId: null, equipo: selected.descripcion, codigo: selected.codigo, detalle: `Ingreso EPP: ${c} und${proveedor ? ` — Proveedor: ${proveedor}` : ''}`, responsable: resp, obs };
    save({ ...db, epp: newEpp, movimientos: [newMov, ...(db.movimientos || [])] });
    showNotif(`✅ ${c} "${selected.descripcion}" ingresados.`);
    setSelected(null); setBusq(''); setCant(1); setResp(''); setProveedor(''); setObs('');
  };

  return (
    <div className="form-card">
      <h2>📥 Ingreso de EPPs</h2>
      <div className="fg">
        <label>Buscar EPP</label>
        <input value={busq} onChange={e => { setBusq(e.target.value); setSelected(null); }} placeholder="Código o nombre..." />
        {resultados.length > 0 && !selected && (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, maxHeight: 180, overflowY: 'auto', marginTop: 4, background: 'white' }}>
            {resultados.map(e => (
              <div key={e.id} className="eq-item" onClick={() => { setSelected(e); setBusq(''); }}>
                <span className="eq-item-cod">{e.codigo}</span>
                <span className="eq-item-nom">{e.descripcion}{e.talla ? ` (${e.talla})` : ''}</span>
                <span style={{ fontSize: 11, color: '#3B6D11', background: '#EAF3DE', padding: '2px 8px', borderRadius: 10 }}>{e.enBodega} en bodega</span>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 8, padding: '10px 14px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span><b>{selected.codigo}</b> — {selected.descripcion}</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32D2D', fontSize: 16 }}>✕</button>
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="fg"><label>Cantidad</label><input type="number" value={cant} min={1} onChange={e => setCant(e.target.value)} /></div>
        <div className="fg"><label>Fecha</label><input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
      </div>
      <div className="fg"><label>Responsable recepción</label><input value={resp} onChange={e => setResp(e.target.value)} /></div>
      <div className="fg"><label>Proveedor</label><input value={proveedor} onChange={e => setProveedor(e.target.value)} /></div>
      <div className="fg"><label>Observaciones</label><textarea value={obs} onChange={e => setObs(e.target.value)} /></div>
      <button className="btn btn-primary" onClick={registrar}>Registrar ingreso</button>
    </div>
  );
}

// ── Registro de Uso ──────────────────────────────────────────────
function RegistroUso({ db, save, user, showNotif, isAdmin }) {
  const activos = (db.registroUso || []).filter(r => r.estado === 'activo');
  const cerrados = (db.registroUso || []).filter(r => r.estado === 'cerrado');
  const [tab, setTab] = useState('activos');

  const cerrar = (id) => {
    const fecha = prompt('Fecha de cierre (YYYY-MM-DD):', today());
    if (!fecha) return;
    const newRU = (db.registroUso || []).map(r => r.id === id ? { ...r, estado: 'cerrado', fechaIngreso: fecha } : r);
    save({ ...db, registroUso: newRU });
    showNotif('✅ Registro cerrado.');
  };

  const eliminar = (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    save({ ...db, registroUso: (db.registroUso || []).filter(r => r.id !== id) });
  };

  const diasEntre = (f1, f2) => {
    const d1 = new Date(f1), d2 = new Date(f2 || today());
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 22, borderBottom: '2px solid #e8e8e8' }}>
        {[{ id: 'activos', l: `📋 Activos (${activos.length})` }, { id: 'cerrados', l: `✅ Cerrados (${cerrados.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 22px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? '#1a4d6e' : '#888', borderBottom: `3px solid ${tab === t.id ? '#1a4d6e' : 'transparent'}`, marginBottom: -2, fontFamily: 'inherit' }}>{t.l}</button>
        ))}
      </div>
      {tab === 'activos' && (
        <div className="card">
          <table>
            <thead><tr><th>Código</th><th>Equipo</th><th>Motivo</th><th>Proyecto</th><th>Responsable</th><th>F. Salida</th><th>Días</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {activos.length ? activos.map(r => (
                <tr key={r.id}>
                  <td><b>{r.codigo}</b></td><td>{r.nombre}</td>
                  <td><span style={{ background: '#EEEDFE', color: '#3C3489', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{r.motivo}</span></td>
                  <td>{r.proyecto || '—'}</td><td>{r.responsable}</td><td>{r.fechaSalida}</td>
                  <td style={{ fontWeight: 700, color: '#1a4d6e' }}>{diasEntre(r.fechaSalida, null)}</td>
                  {isAdmin && <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-sm btn-edit" onClick={() => cerrar(r.id)}>✅ Cerrar</button>
                    <button className="btn-sm" style={{ borderColor: '#D85A30', color: '#D85A30' }} onClick={() => eliminar(r.id)}>🗑</button>
                  </td>}
                </tr>
              )) : <tr><td colSpan={isAdmin ? 8 : 7} className="empty-state">Sin registros activos.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'cerrados' && (
        <div className="card">
          <table>
            <thead><tr><th>Código</th><th>Equipo</th><th>Motivo</th><th>Proyecto</th><th>Responsable</th><th>F. Salida</th><th>F. Ingreso</th><th>Días</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {cerrados.length ? cerrados.map(r => (
                <tr key={r.id}>
                  <td><b>{r.codigo}</b></td><td>{r.nombre}</td>
                  <td><span style={{ background: '#EAF3DE', color: '#3B6D11', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{r.motivo}</span></td>
                  <td>{r.proyecto || '—'}</td><td>{r.responsable}</td><td>{r.fechaSalida}</td><td>{r.fechaIngreso || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{diasEntre(r.fechaSalida, r.fechaIngreso)}</td>
                  {isAdmin && <td><button className="btn-sm" style={{ borderColor: '#D85A30', color: '#D85A30' }} onClick={() => eliminar(r.id)}>🗑</button></td>}
                </tr>
              )) : <tr><td colSpan={isAdmin ? 9 : 8} className="empty-state">Sin registros cerrados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Historial ────────────────────────────────────────────────────
function Historial({ db }) {
  const [busq, setBusq] = useState('');
  const [filtro, setFiltro] = useState('todos');
  let lista = (db.movimientos || []);
  if (filtro !== 'todos') lista = lista.filter(m => m.tipo === filtro);
  if (busq) lista = lista.filter(m => (m.equipo || '').toLowerCase().includes(busq.toLowerCase()) || (m.codigo || '').toLowerCase().includes(busq.toLowerCase()));

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>📜 Historial de Movimientos</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="filter-tabs">
              {['todos', 'entrada', 'salida', 'retorno', 'ajuste'].map(f => <button key={f} className={`ftab${filtro === f ? ' active' : ''}`} onClick={() => setFiltro(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
            </div>
            <input className="search" placeholder="Buscar..." value={busq} onChange={e => setBusq(e.target.value)} />
          </div>
        </div>
        <div>
          {lista.length ? lista.slice(0, 200).map(m => (
            <div key={m.id} className="hist-item">
              <div className={`hdot ${m.tipo}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{m.equipo} <span style={{ fontSize: 12, color: '#888' }}>({m.codigo})</span></span>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{m.fecha}</span>
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>{m.detalle}{m.obs ? ` · ${m.obs}` : ''} · Por: {m.responsable}</div>
              </div>
            </div>
          )) : <div className="empty-state">Sin movimientos.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Reporte ──────────────────────────────────────────────────────
function Reporte({ db }) {
  const eq = db.equipos || [];
  const totalEq = eq.length;
  const conStock = eq.filter(e => (e.cantidad || 0) > 0).length;
  const sinStock = eq.filter(e => (e.cantidad || 0) === 0).length;
  const stockAl = (db.stock || []).filter(s => s.enBodega < s.stockMinimo);
  const eppAl = (db.epp || []).filter(e => e.enBodega < e.stockMinimo);
  const movs = db.movimientos || [];
  const entradas = movs.filter(m => m.tipo === 'entrada').length;
  const salidas = movs.filter(m => m.tipo === 'salida').length;

  return (
    <div>
      <h2 style={{ marginBottom: 16, color: '#1a4d6e' }}>📈 Reporte General</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #eee', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a4d6e', marginBottom: 14 }}>Equipos y Herramientas</h3>
          {[['Total ítems', totalEq], ['Con stock en bodega', conStock], ['Sin stock', sinStock]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}><span>{l}</span><b>{v}</b></div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #eee', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a4d6e', marginBottom: 14 }}>Movimientos</h3>
          {[['Total movimientos', movs.length], ['Entradas', entradas], ['Salidas', salidas]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}><span>{l}</span><b>{v}</b></div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #eee', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a4d6e', marginBottom: 14 }}>Alertas de Stock</h3>
          {[['Materiales bajo stock', stockAl.length], ['EPPs bajo stock', eppAl.length], ['Asignaciones EPP', (db.asignacionesEpp || []).length]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}><span>{l}</span><b style={{ color: v > 0 ? '#E24B4A' : '#3B6D11' }}>{v}</b></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Usuarios ─────────────────────────────────────────────────────
function Usuarios({ db, save, showNotif }) {
  const [nombre, setNombre] = useState('');
  const [userN, setUserN] = useState('');
  const [pass, setPass] = useState('');
  const [rol, setRol] = useState('operador');
  const [showForm, setShowForm] = useState(false);

  const crear = () => {
    if (!nombre.trim() || !userN.trim() || !pass.trim()) { showNotif('Completa todos los campos.', 'err'); return; }
    if ((db.usuarios || []).find(u => u.user === userN.trim())) { showNotif('Ese usuario ya existe.', 'err'); return; }
    save({ ...db, usuarios: [...(db.usuarios || []), { id: nuevoId(), nombre: nombre.trim(), user: userN.trim(), pass: pass.trim(), rol }] });
    showNotif(`✅ Usuario "${nombre.trim()}" creado.`);
    setNombre(''); setUserN(''); setPass(''); setShowForm(false);
  };

  const eliminar = (id) => {
    if (id === 1) { showNotif('No puedes eliminar el admin principal.', 'err'); return; }
    if (!confirm('¿Eliminar este usuario?')) return;
    save({ ...db, usuarios: (db.usuarios || []).filter(u => u.id !== id) });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#1a4d6e' }}>👥 Usuarios del Sistema</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Nuevo usuario</button>
      </div>
      {showForm && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h2>Crear nuevo usuario</h2>
          <div className="form-row">
            <div className="fg"><label>Nombre completo</label><input value={nombre} onChange={e => setNombre(e.target.value)} /></div>
            <div className="fg"><label>Nombre de usuario</label><input value={userN} onChange={e => setUserN(e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="fg"><label>Contraseña</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} /></div>
            <div className="fg"><label>Rol</label><select value={rol} onChange={e => setRol(e.target.value)}><option value="admin">Administrador</option><option value="operador">Operador</option></select></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={crear}>Crear usuario</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div>
        {(db.usuarios || []).map(u => (
          <div key={u.id} className="user-item">
            <div className="user-avatar">{u.nombre.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{u.nombre}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Usuario: {u.user} · Contraseña: {'•'.repeat(u.pass.length)}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489' }}>{u.rol === 'admin' ? 'Admin' : 'Operador'}</span>
            {u.id !== 1 && <button className="btn-sm" style={{ borderColor: '#D85A30', color: '#D85A30' }} onClick={() => eliminar(u.id)}>Eliminar</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
