import React, { useState, useMemo, useEffect } from 'react';
import { useTickets } from '../../contexts/TicketContext';

export const Gestion = () => {
  const { actividades, responsables } = useTickets();
  const [view, setView] = useState('tabla'); // 'tabla' o 'kanban'
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Escuchar el evento de busqueda global del Topbar
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail.query.toLowerCase());
    };
    document.addEventListener('searchTriggered', handleSearch);
    return () => document.removeEventListener('searchTriggered', handleSearch);
  }, []);

  const activos = useMemo(() => {
    return actividades.filter(a => {
      const isActive = !['Resuelto', 'Cerrado'].includes(a.estado);
      if (!isActive) return false;
      if (filtroEstado && a.estado !== filtroEstado) return false;

      if (searchQuery) {
        const matchesId = (a.id || '').toLowerCase().includes(searchQuery);
        const matchesSol = (a.solicitud || '').toLowerCase().includes(searchQuery);
        const matchesNom = (a.nombre || a.solicitante || '').toLowerCase().includes(searchQuery);
        const matchesResp = (a.responsable || '').toLowerCase().includes(searchQuery);
        if (!matchesId && !matchesSol && !matchesNom && !matchesResp) return false;
      }
      return true;
    }).reverse();
  }, [actividades, filtroEstado, searchQuery]);

  const kanbanCols = [
    { key: 'Pendiente', label: 'Pendiente', color: '#94a3b8' },
    { key: 'En progreso', label: 'En Progreso', color: '#3b82f6' }
  ];
  
  const prioColor = { Urgente: '#ef4444', Alta: '#f59e0b', Media: '#3b82f6', Baja: '#22c55e' };

  return (
    <div className="dashboard-wrapper">
      <div className="page-header fade-in">
        <h1 className="page-title">Gestión de Solicitudes</h1>
        <p className="page-subtitle">Administración de tickets activos</p>
      </div>

      <div className="filters-bar glass-panel fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Filtrar por Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="glass-input">
              <option value="">Todos los activos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
            </select>
          </div>
        </div>
        
        <div className="view-toggle">
          <button className={`toggle-btn ${view === 'tabla' ? 'active' : ''}`} onClick={() => setView('tabla')}>
            <i className="fa-solid fa-list"></i> Tabla
          </button>
          <button className={`toggle-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>
            <i className="fa-solid fa-border-all"></i> Kanban
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ animationDelay: '0.2s', marginTop: '24px' }}>
        {view === 'tabla' ? (
          <div className="glass-panel table-panel">
            {activos.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-inbox"></i>
                <p>Sin solicitudes activas</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Solicitud</th><th>Solicitante</th><th>Estado</th><th>Prioridad</th><th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map(t => {
                    const prio = t.prioridad || 'Baja';
                    const dot = prioColor[prio] || '#94a3b8';
                    const estadoClase = (t.estado || '').includes('progreso') ? 'progreso' : 'pendiente';
                    return (
                      <tr key={t.id} className="ticket-row-clickable">
                        <td><strong>{t.id}</strong></td>
                        <td style={{ maxWidth: '350px', whiteSpace: 'normal' }}>{t.solicitud || t.nombre}</td>
                        <td>{t.nombre || t.solicitante}</td>
                        <td><span className={`status-badge ${estadoClase}`}>{t.estado}</span></td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                          </span>
                        </td>
                        <td>{t.responsable || 'Sin asignar'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="kanban-board">
            {kanbanCols.map(col => {
              const ticketsCol = activos.filter(t => t.estado === col.key);
              return (
                <div key={col.key} className="kanban-col">
                  <div className="kanban-col-header">
                    <div className="kanban-col-dot" style={{ background: col.color }}></div>
                    <div className="kanban-col-title">{col.label}</div>
                    <div className="kanban-col-count">{ticketsCol.length}</div>
                  </div>
                  <div className="kanban-col-body">
                    {ticketsCol.length === 0 ? (
                      <div className="kanban-empty">Sin tickets en esta columna</div>
                    ) : (
                      ticketsCol.map(t => {
                        const prio = t.prioridad || 'Baja';
                        const dot = prioColor[prio] || '#94a3b8';
                        return (
                          <div key={t.id} className={`kanban-card ${prio.toLowerCase()}`}>
                            <div className="kanban-card-id">{t.id}</div>
                            <div className="kanban-card-title">{t.solicitud || t.nombre}</div>
                            <div className="kanban-card-who" style={{ marginBottom: '6px', color: '#475569' }}>
                              <i className="fa-regular fa-user" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                              {t.nombre || t.solicitante || 'Desconocido'}
                            </div>
                            <div className="kanban-card-footer">
                              <span className="kanban-card-who" title="Responsable asignado">
                                <i className="fa-solid fa-user-tie" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                                {t.responsable || 'Sin asignar'}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                <span className="prioridad-dot" style={{ background: dot }}></span>{prio}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
