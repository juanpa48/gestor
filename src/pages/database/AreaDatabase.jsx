import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { useAuth, hashPassword } from '../../shared/contexts/AuthContext';
import '../../shared/styles/themes/database-theme.css';

export const AreaDatabase = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { ctx, config, area } = useActiveArea();
  const { actividades, solicitantes, refreshTickets } = ctx;
  
  const [activeTab, setActiveTab] = useState('actividades');

  // Forms state
  const [newSoliNombreReal, setNewSoliNombreReal] = useState('');
  const [newSoliUsername, setNewSoliUsername] = useState('');
  const [newSoliCargo, setNewSoliCargo] = useState('');

  // The database page should override global body classes from portal or dashboard
  useEffect(() => {
    document.documentElement.classList.add('database-page');
    document.body.classList.add('database-page');
    return () => { 
      document.documentElement.classList.remove('database-page');
      document.body.classList.remove('database-page'); 
    };
  }, []);

  const handleAddSoli = async () => {
    if (!newSoliNombreReal.trim() || !newSoliUsername.trim()) {
      window.alert('El nombre real y el usuario son obligatorios.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    if (users.some(u => u.username === newSoliUsername.trim())) {
      window.alert('Este usuario ya existe.');
      return;
    }
    const empHash = await hashPassword('12345');
    const newUser = {
      id: `U-${String(users.length + 1).padStart(2, '0')}`,
      username: newSoliUsername.trim(),
      nombreReal: newSoliNombreReal.trim(),
      passwordHash: empHash,
      role: 'solicitante',
      cargo: newSoliCargo.trim() || 'Empleado',
      bloqueado: false,
      intentosFallidos: 0
    };
    users.push(newUser);
    localStorage.setItem('db_usuarios', JSON.stringify(users));
    setRawSolicitantes(users.filter(u => u.role === 'solicitante'));
    setNewSoliNombreReal('');
    setNewSoliUsername('');
    setNewSoliCargo('');
    window.alert(`Empleado creado. Contraseña por defecto: 12345`);
  };



  const handleDeleteSoli = async (username) => {
    if (window.confirm('¿Eliminar este registro de usuario permanentemente?')) {
      let users = JSON.parse(localStorage.getItem('db_usuarios')) || [];
      users = users.filter(u => u.username !== username);
      localStorage.setItem('db_usuarios', JSON.stringify(users));
      setRawSolicitantes(users.filter(u => u.role === 'solicitante'));
    }
  };

  let exactCols = [
    { title: 'Fecha de Creación', key: 'fechaCreacion' },
    { title: 'Solicitante', key: 'solicitante' },
    { title: 'Cargo', key: 'cargo' },
    { title: 'Solicitud del usuario', key: 'solicitud' },
    { title: 'Tipo de Ticket', key: 'tipo' },
    { title: 'Prioridad', key: 'prioridad' },
    { title: 'Estado', key: 'estado' },
    { title: 'Grupo de actividad', key: 'grupo' },
    { title: 'Grupo', key: 'grupoExtra' },
    { title: 'Fecha de Inicio', key: 'fechaInicio' },
    { title: 'Fecha de Finalización', key: 'fechaFin' },
    { title: 'Tiempo', key: 'tiempo' },
    { title: 'Clasificacion', key: 'clasificacion' },
    { title: 'Accion tenica', key: 'accion' },
    { title: 'Fecha progamada', key: 'fechaProgramada' },
    { title: 'Detalles (opcional)', key: 'detalles' },
    { title: 'Responsable', key: 'responsable' },
    { title: 'Fecha de Pausa (SLA)', key: 'fechaPausa' },
    { title: 'Tiempo Pausado (ms)', key: 'tiempoPausadoTotal' }
  ];

  if (area === 'gh' || area === 'ge') {
    exactCols = exactCols.filter(c => c.key !== 'tipo' && c.key !== 'prioridad');
  }
  
  if (area === 'gh') {
    exactCols.splice(exactCols.findIndex(c => c.key === 'estado') + 1, 0, { title: 'Novedad de Nómina', key: 'novedadNomina' });
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

  const [rawSolicitantes, setRawSolicitantes] = useState([]);
  const [dbAsistencia, setDbAsistencia] = useState([]);
  const [dbHistorico, setDbHistorico] = useState([]);

  const loadData = () => {
    const users = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    setRawSolicitantes(users.filter(u => u.role === 'solicitante'));
    
    if (area === 'gh') {
      const asistencia = JSON.parse(localStorage.getItem('db_asistencia_diaria')) || {};
      setDbAsistencia(Object.values(asistencia));
      const historico = JSON.parse(localStorage.getItem('db_historico_asistencia')) || [];
      setDbHistorico(historico);
    }
  };

  useEffect(() => {
    loadData();
  }, [area]);

  return (
    <div className="database-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Base de Datos Local - {config.nombre}</h1>
          <p style={{ margin: 0 }}>Vista de datos en <code>localStorage</code> (Modo SuperAdmin).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="btn-group" style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '8px' }}>
            <button className={`btn-secondary ${config.nombre.includes('TI') ? 'active' : ''}`} onClick={() => navigate('/database/ti')} style={{ padding: '6px 12px' }}>DB TI</button>
            <button className={`btn-secondary ${config.nombre.includes('Empresarial') ? 'active' : ''}`} onClick={() => navigate('/database/ge')} style={{ padding: '6px 12px' }}>DB GE</button>
            <button className={`btn-secondary ${config.nombre.includes('Humana') ? 'active' : ''}`} onClick={() => navigate('/database/gh')} style={{ padding: '6px 12px' }}>DB GH</button>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => navigate(`/dashboard/${currentUser?.area || 'ti'}`)}
            style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="db-tabs">
        <button className={`db-tab-btn ${activeTab === 'actividades' ? 'active' : ''}`} onClick={() => setActiveTab('actividades')}>Actividades</button>
        <button className={`db-tab-btn ${activeTab === 'solicitantes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitantes')}>Solicitantes</button>
        {area === 'gh' && (
          <>
            <button className={`db-tab-btn ${activeTab === 'asistencia_diaria' ? 'active' : ''}`} onClick={() => setActiveTab('asistencia_diaria')}>Asistencia Diaria (En Vivo)</button>
            <button className={`db-tab-btn ${activeTab === 'historico_asistencia' ? 'active' : ''}`} onClick={() => setActiveTab('historico_asistencia')}>Histórico de Asistencia</button>
          </>
        )}
      </div>

      {activeTab === 'actividades' && (
        <div className="db-table-container">
          <button className="btn-refresh" onClick={refreshTickets}>Recargar Datos de Actividades</button>
          
          <table className="db-table">
            <thead>
              <tr>
                <th className="row-num"></th>
                {letters.map(l => <th key={l} className="col-letter">{l}</th>)}
              </tr>
              <tr>
                <th className="row-num" className="col-letter"></th>
                {exactCols.map(c => <th key={c.key}>{c.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={17} className="empty-msg" style={{textAlign:'center'}}>No se encontraron registros de actividades.</td>
                </tr>
              ) : (
                actividades.map((row, index) => (
                  <tr key={row.id}>
                    <td className="row-num">{index + 2}</td>
                    {exactCols.map(c => (
                      <td key={c.key}>
                        {c.key === 'novedadNomina' ? (row[c.key] ? 'Sí' : 'No') : (typeof row[c.key] === 'object' && row[c.key] !== null ? JSON.stringify(row[c.key]) : (row[c.key] || ''))}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'solicitantes' && (
        <div className="db-table-container">
          <div className="add-wrapper" style={{ flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="add-input" 
              placeholder="Nombre Completo" 
              value={newSoliNombreReal} 
              onChange={e => setNewSoliNombreReal(e.target.value)} 
            />
            <input 
              type="text" 
              className="add-input" 
              placeholder="Nombre de Usuario (Login)" 
              value={newSoliUsername} 
              onChange={e => setNewSoliUsername(e.target.value)} 
            />
            <input 
              type="text" 
              className="add-input" 
              placeholder="Cargo (ej: Contador)" 
              value={newSoliCargo} 
              onChange={e => setNewSoliCargo(e.target.value)} 
            />
            <button className="btn-add" onClick={handleAddSoli}>Añadir Empleado</button>
          </div>
          
          <table className="db-table list-table">
            <thead>
              <tr>
                <th>Nombre Real</th>
                <th>Usuario (Login)</th>
                <th>Cargo</th>
                <th style={{ width: '80px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rawSolicitantes.length === 0 ? (
                <tr><td colSpan={4} className="empty-msg">No hay empleados registrados.</td></tr>
              ) : (
                rawSolicitantes.map((s, idx) => {
                  return (
                    <tr key={s.username}>
                      <td>{s.nombreReal || s.username}</td>
                      <td>{s.username}</td>
                      <td>{s.cargo}</td>
                      <td><button className="btn-action" onClick={() => handleDeleteSoli(s.username)}>Borrar</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {area === 'gh' && activeTab === 'asistencia_diaria' && (
        <div className="db-table-container">
          <button className="btn-refresh" onClick={loadData}>Recargar Datos (db_asistencia_diaria)</button>
          <table className="db-table list-table">
            <thead>
              <tr>
                <th className="row-num"></th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Fecha ISO</th>
                <th>Timestamp</th>
                <th>Fecha Fin ISO</th>
                <th>Fecha Fin Timestamp</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {dbAsistencia.length === 0 ? (
                <tr><td colSpan={9} className="empty-msg" style={{textAlign:'center'}}>No hay registros de asistencia en vivo hoy.</td></tr>
              ) : (
                dbAsistencia.map((row, idx) => (
                  <tr key={row.nombre}>
                    <td className="row-num">{idx + 2}</td>
                    <td>{row.nombre}</td>
                    <td>{row.ubicacion}</td>
                    <td>{row.estado || 'Activo'}</td>
                    <td>{row.fechaISO}</td>
                    <td>{row.timestamp}</td>
                    <td>{row.fechaFinISO || ''}</td>
                    <td>{row.fechaFinTimestamp || ''}</td>
                    <td>{row.detalles ? JSON.stringify(row.detalles) : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {area === 'gh' && activeTab === 'historico_asistencia' && (
        <div className="db-table-container">
          <button className="btn-refresh" onClick={loadData}>Recargar Datos (db_historico_asistencia)</button>
          <table className="db-table list-table">
            <thead>
              <tr>
                <th className="row-num"></th>
                <th>ID</th>
                <th>Fecha Registro</th>
                <th>Acción</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Fecha Inicio ISO</th>
                <th>Fecha Fin ISO</th>
              </tr>
            </thead>
            <tbody>
              {dbHistorico.length === 0 ? (
                <tr><td colSpan={9} className="empty-msg" style={{textAlign:'center'}}>No hay historial registrado.</td></tr>
              ) : (
                dbHistorico.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td className="row-num">{idx + 2}</td>
                    <td>{row.id}</td>
                    <td>{row.fechaRegistro}</td>
                    <td><strong>{row.accion}</strong></td>
                    <td>{row.nombre}</td>
                    <td>{row.ubicacion}</td>
                    <td>{row.estado || 'Activo'}</td>
                    <td>{row.fechaISO}</td>
                    <td>{row.fechaFinISO || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


