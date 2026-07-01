import React from 'react';
import { useTickets } from '../../contexts/TicketContext';

export const TicketHistory = () => {
  const { actividades } = useTickets();

  // En la versión vanilla, esto buscaba por el solicitante en el formulario
  // Por ahora mostraremos los ultimos 5 tickets de manera global como "Mis Solicitudes"
  const misTickets = [...actividades]
    .slice(-6)
    .reverse();

  return (
    <aside className="glass-panel aside-panel">
      <div className="panel-title">
        <i className="fa-solid fa-clock-rotate-left"></i> Mis Solicitudes
      </div>
      <div className="history-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text" className="glass-input" placeholder="Buscar por ID..." />
      </div>
      
      <div className="history-list">
        {misTickets.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
            No hay tickets registrados.
          </div>
        ) : (
          misTickets.map(t => {
            const estadoClase = (t.estado || '').toLowerCase().includes('progreso') ? 'progreso' 
                              : (t.estado || '').toLowerCase().includes('resuelto') ? 'resuelto' 
                              : 'pendiente';

            return (
              <div key={t.id} className="history-card">
                <div className="history-card-header">
                  <span className="history-id">{t.id}</span>
                  <span className={`status-badge ${estadoClase}`}>{t.estado}</span>
                </div>
                <div className="history-card-title">{t.solicitud || t.nombre}</div>
                <div className="history-card-date">{t.fechaCreacion}</div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
