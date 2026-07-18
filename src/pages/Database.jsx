import React, { useState, useEffect } from 'react';
import { useAreaTickets as useTickets } from '../areas/gestion-empresarial/context/GEContext';
import '../shared/styles/themes/database-theme.css'; // Import directly here

export const Database = () => {
  const { actividades, solicitantes, responsables, addSolicitante, removeSolicitante, addResponsable, removeResponsable, refreshTickets } = useTickets();
  
  const [activeTab, setActiveTab] = useState('actividades');

  // Forms state
  const [newSoli, setNewSoli] = useState('');
  const [newSoliCargo, setNewSoliCargo] = useState('');
  const [newRespNombre, setNewRespNombre] = useState('');
  const [newRespCargo, setNewRespCargo] = useState('');
  const [newRespFoto, setNewRespFoto] = useState('');

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
    if (!newSoli.trim()) return;
    const solObj = {
      nombre: newSoli.trim(),
      cargo: newSoliCargo.trim() || ''
    };
    await addSolicitante(solObj);
    setNewSoli('');
    setNewSoliCargo('');
  };

  const handleAddResp = async () => {
    if (!newRespNombre.trim()) return;
    const respObj = {
      nombre: newRespNombre.trim(),
      cargo: newRespCargo.trim() || 'Personal TI',
      foto: newRespFoto.trim()
    };
    await addResponsable(respObj);
    setNewRespNombre('');
    setNewRespCargo('');
    setNewRespFoto('');
  };

  const handleDeleteResp = async (index) => {
    if (window.confirm('¿Eliminar este registro?')) {
      await removeResponsable(index);
    }
  };

  const handleDeleteSoli = async (index) => {
    if (window.confirm('¿Eliminar este registro?')) {
      await removeSolicitante(index);
    }
  };

  const exactCols = [
    { title: 'Fecha de Creación', key: 'fechaCreacion' },
    { title: 'Solicitante', key: 'solicitante' },
    { title: 'Cargo', key: 'cargo' },
    { title: 'Solicitud del usuario', key: 'solicitud' },
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
    { title: 'Responsable', key: 'responsable' }
  ];

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

  // Leer estado "crudo" de localStorage para responsables porque useTickets normaliza a nombres string.
  // Pero necesitamos renderizar foto y cargo.
  const [rawResponsables, setRawResponsables] = useState([]);
  const [rawSolicitantes, setRawSolicitantes] = useState([]);
  
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('db_responsables')) || [];
    setRawResponsables(raw);
  }, [responsables]);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('db_solicitantes')) || [];
    setRawSolicitantes(raw);
  }, [solicitantes]);

  return (
    <div className="database-container">
      <h1>Base de Datos Local</h1>
      <p>Vista de datos en <code>localStorage</code> (React Port).</p>

      <div className="db-tabs">
        <button className={`db-tab-btn ${activeTab === 'actividades' ? 'active' : ''}`} onClick={() => setActiveTab('actividades')}>Actividades</button>
        <button className={`db-tab-btn ${activeTab === 'solicitantes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitantes')}>Solicitantes</button>
        <button className={`db-tab-btn ${activeTab === 'responsables' ? 'active' : ''}`} onClick={() => setActiveTab('responsables')}>Responsables</button>
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
                      <td key={c.key}>{row[c.key] || ''}</td>
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
          <div className="add-wrapper">
            <input 
              type="text" 
              className="add-input" 
              placeholder="Nombre del solicitante" 
              value={newSoli} 
              onChange={e => setNewSoli(e.target.value)} 
            />
            <input 
              type="text" 
              className="add-input" 
              placeholder="Cargo (ej: Contador, Auxiliar)" 
              value={newSoliCargo} 
              onChange={e => setNewSoliCargo(e.target.value)} 
            />
            <button className="btn-add" onClick={handleAddSoli}>Añadir Solicitante</button>
          </div>
          
          <table className="db-table list-table">
            <thead>
              <tr>
                <th>Nombre del Solicitante</th>
                <th>Cargo</th>
                <th style={{ width: '80px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rawSolicitantes.length === 0 ? (
                <tr><td colSpan={3} className="empty-msg">No hay registros.</td></tr>
              ) : (
                rawSolicitantes.map((s, idx) => {
                  const nombre = typeof s === 'object' ? s.nombre : s;
                  const cargo = typeof s === 'object' ? s.cargo : '';
                  return (
                    <tr key={idx}>
                      <td>{nombre}</td>
                      <td>{cargo}</td>
                      <td><button className="btn-action" onClick={() => handleDeleteSoli(idx)}>Borrar</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'responsables' && (
        <div className="db-table-container">
          <div className="add-wrapper" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <input 
              type="text" 
              className="add-input" 
              style={{ maxWidth: '100%' }} 
              placeholder="Nombre completo" 
              value={newRespNombre}
              onChange={e => setNewRespNombre(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '600px' }}>
              <input 
                type="text" 
                className="add-input" 
                placeholder="Cargo (ej: Soporte Nivel 1)" 
                value={newRespCargo}
                onChange={e => setNewRespCargo(e.target.value)}
              />
              <input 
                type="text" 
                className="add-input" 
                placeholder="URL de Foto (opcional)" 
                value={newRespFoto}
                onChange={e => setNewRespFoto(e.target.value)}
              />
            </div>
            <button className="btn-add" onClick={handleAddResp}>Añadir Responsable TI</button>
          </div>

          <table className="db-table list-table" style={{ maxWidth: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Foto</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th style={{ width: '80px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rawResponsables.length === 0 ? (
                <tr><td colSpan={4} className="empty-msg">No hay responsables registrados.</td></tr>
              ) : (
                rawResponsables.map((r, idx) => {
                  const nombre = typeof r === 'object' ? r.nombre : r;
                  const cargo = typeof r === 'object' ? r.cargo : 'Personal TI';
                  const foto = (typeof r === 'object' && r.foto) ? r.foto : `https://i.pravatar.cc/150?u=${idx}`;
                  
                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }}>
                        <img src={foto} alt={nombre} className="database-avatar" />
                      </td>
                      <td><strong>{nombre}</strong></td>
                      <td>{cargo}</td>
                      <td><button className="btn-action" onClick={() => handleDeleteResp(idx)}>Borrar</button></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
