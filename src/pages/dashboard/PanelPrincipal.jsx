import React from 'react';
import { StatCards } from '../../components/dashboard/StatCards';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { useTickets } from '../../contexts/TicketContext';

export const PanelPrincipal = () => {
  const { actividades } = useTickets();

  // Tomamos los ultimos 5 tickets para "Tickets Recientes"
  const recentTickets = [...actividades]
    .slice(-5)
    .reverse()
    .map(a => ({
      titulo: a.solicitud || a.nombre,
      timeAgo: a.fechaCreacion,
      isUrgent: a.prioridad === 'Urgente' || a.prioridad === 'Alta'
    }));

  return (
    <div className="dashboard-wrapper">
      <div className="page-header fade-in">
        <h1 className="page-title">Panel Principal</h1>
        <p className="page-subtitle">Resumen general y métricas en tiempo real</p>
      </div>

      <StatCards />
      <DashboardCharts />

      <div className="grid-2col" style={{ marginTop: '24px' }}>
        {/* Atajos (Reemplazando formulario rápido si se prefiere o manteniendo el estilo original) */}
        <div className="glass-panel fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="panel-title">
            <i className="fa-solid fa-bolt"></i> Registro Rápido
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Esta función será portada como un modal en las próximas fases.
          </p>
          <button className="btn-primary" disabled>
            <i className="fa-solid fa-plus"></i>
            <span>Nuevo Ticket Rápido</span>
          </button>
        </div>

        <div className="glass-panel fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="panel-title">
            <i className="fa-solid fa-clock-rotate-left"></i> Tickets Recientes
          </div>
          <div className="tickets-list">
            {recentTickets.length === 0 ? (
              <div className="loading-state">No hay tickets recientes</div>
            ) : (
              recentTickets.map((t, idx) => (
                <div key={idx} className="ticket-item">
                  <div className={`ticket-dot ${t.isUrgent ? 'urgent' : 'normal'}`}>
                    <i className={`fa-solid fa-${t.isUrgent ? 'circle-exclamation' : 'clock'}`}></i>
                  </div>
                  <div className="ticket-info">
                    <div className="ticket-title">{t.titulo}</div>
                    <div className="ticket-time">{t.timeAgo}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
