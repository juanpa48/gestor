import React, { useEffect, useState } from 'react';
import { useTickets } from '../../contexts/TicketContext';

export const StatCards = () => {
  const { actividades } = useTickets();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, urgent: 0, resolved: 0 });

  useEffect(() => {
    const open = actividades.filter(a => a.estado === 'Pendiente').length;
    const inProg = actividades.filter(a => a.estado === 'En progreso').length;
    const urgent = actividades.filter(a => a.prioridad === 'Urgente').length;
    const resolved = actividades.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    
    setStats({ open, inProgress: inProg, urgent, resolved });
  }, [actividades]);

  return (
    <div className="stats-grid">
      <div className="stat-card fade-in">
        <div className="stat-title">Tickets Abiertos</div>
        <div className="stat-value">{String(stats.open).padStart(2, '0')}</div>
        <div className="stat-subtitle">Pendientes de asignación</div>
      </div>
      <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="stat-title">En Progreso</div>
        <div className="stat-value">{String(stats.inProgress).padStart(2, '0')}</div>
        <div className="stat-subtitle">En atención actualmente</div>
      </div>
      <div className="stat-card fade-in urgent" style={{ animationDelay: '0.2s' }}>
        <div className="stat-title">Urgencias</div>
        <div className="stat-value">{String(stats.urgent).padStart(2, '0')}</div>
        <div className="stat-subtitle">Prioridad máxima</div>
      </div>
      <div className="stat-card fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="stat-title">Tickets Resueltos</div>
        <div className="stat-value">{String(stats.resolved).padStart(2, '0')}</div>
        <div className="stat-subtitle">Histórico total</div>
      </div>
    </div>
  );
};
