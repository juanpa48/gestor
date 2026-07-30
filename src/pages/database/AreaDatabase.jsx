import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { useAuth } from '../../shared/contexts/AuthContext';
import '../../shared/styles/themes/database-theme.css';
import { downloadReport, getColumnsConfig } from '../../shared/utils/exportHelpers';

import { apiClient } from '../../shared/services/api';
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
    try {
      const data = await apiClient('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          codigo: `U-${String(rawSolicitantes.length + 10).padStart(2, '0')}`,
          username: newSoliUsername.trim(),
          nombreReal: newSoliNombreReal.trim(),
          password: '12345',
          role: 'solicitante',
          cargo: newSoliCargo.trim() || 'Empleado'
        })
      });
      if (!data.success) {
        window.alert(data.message || 'Error al crear usuario.');
        return;
      }
      await loadSolicitantes();
      setNewSoliNombreReal('');
      setNewSoliUsername('');
      setNewSoliCargo('');
      window.alert(`Empleado creado. Contraseña por defecto: 12345`);
    } catch (error) {
      console.error('Error creando solicitante:', error);
      window.alert('Error de conexión con el servidor.');
    }
  };



  const handleDeleteSoli = async (username) => {
    if (window.confirm('¿Eliminar este registro de usuario permanentemente?')) {
      try {
        await apiClient(`/usuarios/${username}`, { method: 'DELETE' });
        await loadSolicitantes();
      } catch (error) {
        console.error('Error eliminando solicitante:', error);
      }
    }
  };

  const loadSolicitantes = async () => {
    try {
      const users = await apiClient('/usuarios');
      setRawSolicitantes(users.filter(u => u.role === 'solicitante'));
    } catch (error) {
      console.error('Error cargando solicitantes:', error);
    }
  };

  const exactCols = getColumnsConfig(area);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

  const [rawSolicitantes, setRawSolicitantes] = useState([]);
  const [dbHistorico, setDbHistorico] = useState([]);
  const [dbAsistencia, setDbAsistencia] = useState({});

  const loadAsistencias = async () => {
    if (area === 'gh') {
      const { DbService } = await import('../../shared/services/DbService');
      const historico = await DbService.getHistoricoAsistencia();
      setDbHistorico(Array.isArray(historico) ? historico : []);
      
      const asistencia = await DbService.getAsistenciaDiaria();
      setDbAsistencia(asistencia || {});
    }
  };

  useEffect(() => {
    loadSolicitantes();
    loadAsistencias();
  }, [area]);

  return (
    <div className="database-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Base de Datos Local - {config.nombre}</h1>
          <p style={{ margin: 0 }}>Vista de datos en <code>PostgreSQL</code> (Modo SuperAdmin).</p>
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
            <button className={`db-tab-btn ${activeTab === 'asistencia' ? 'active' : ''}`} onClick={() => setActiveTab('asistencia')}>Asistencia en Vivo (Hoy)</button>
            <button className={`db-tab-btn ${activeTab === 'historico_asistencia' ? 'active' : ''}`} onClick={() => setActiveTab('historico_asistencia')}>Histórico de Asistencia</button>
          </>
        )}
      </div>

      {activeTab === 'actividades' && (
        <div className="db-table-container">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className="btn-refresh" onClick={refreshTickets}>Recargar Datos de Actividades</button>
            <button className="btn-secondary" onClick={() => downloadReport(actividades, exactCols, area, 'xlsx')} style={{ padding: '6px 12px', background: 'var(--blue)', color: 'white', border: 'none' }}>Descargar a Excel (XLSX)</button>
            <button className="btn-secondary" onClick={() => downloadReport(actividades, exactCols, area, 'csv')} style={{ padding: '6px 12px' }}>Descargar a Excel (CSV)</button>
          </div>
          
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
                        {c.key === 'novedadNomina' 
                           ? (row[c.key] ? 'Sí' : 'No') 
                           : (typeof row[c.key] === 'object' && row[c.key] !== null ? JSON.stringify(row[c.key]) : (row[c.key] || ''))}
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

      {area === 'gh' && activeTab === 'asistencia' && (
        <div className="db-table-container">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className="btn-refresh" onClick={loadAsistencias}>Recargar Asistencia</button>
          </div>
          <table className="db-table list-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Última Acción</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(dbAsistencia).length === 0 ? (
                <tr><td colSpan={5} className="empty-msg" style={{textAlign:'center'}}>Nadie ha reportado asistencia hoy.</td></tr>
              ) : (
                Object.entries(dbAsistencia).map(([username, datos]) => (
                  <tr key={username}>
                    <td>{username}</td>
                    <td>{datos.nombre || username}</td>
                    <td>{datos.estado}</td>
                    <td>{datos.ubicacion}</td>
                    <td>{new Date(datos.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {area === 'gh' && activeTab === 'historico_asistencia' && (
        <div className="db-table-container">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className="btn-refresh" onClick={loadAsistencias}>Recargar Histórico</button>
            <button className="btn-secondary" onClick={() => downloadReport(dbHistorico, [
              { title: 'ID', key: 'id' },
              { title: 'Nombre', key: 'nombre' },
              { title: 'Ubicación', key: 'ubicacion' },
              { title: 'Acción', key: 'accion' },
              { title: 'Fecha (ISO)', key: 'fecha_iso' },
              { title: 'Detalles (JSON)', key: 'detalles' }
            ], area, 'xlsx')} style={{ padding: '6px 12px', background: 'var(--blue)', color: 'white', border: 'none' }}>Descargar a Excel (XLSX)</button>
          </div>
          <table className="db-table">
            <thead>
              <tr>
                <th className="row-num"></th>
                <th className="col-letter">A</th>
                <th className="col-letter">B</th>
                <th className="col-letter">C</th>
                <th className="col-letter">D</th>
                <th className="col-letter">E</th>
                <th className="col-letter">F</th>
              </tr>
              <tr>
                <th className="row-num" className="col-letter"></th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Acción</th>
                <th>Fecha</th>
                <th>Detalles (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {dbHistorico.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-msg" style={{textAlign:'center'}}>No hay registros en el histórico de asistencia.</td>
                </tr>
              ) : (
                dbHistorico.map((row, idx) => (
                  <tr key={idx}>
                    <td className="row-num">{idx + 1}</td>
                    <td>{row.id}</td>
                    <td>{row.nombre}</td>
                    <td>{row.ubicacion}</td>
                    <td>{row.accion}</td>
                    <td>{row.fecha_iso}</td>
                    <td>{JSON.stringify(row.detalles || {})}</td>
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
