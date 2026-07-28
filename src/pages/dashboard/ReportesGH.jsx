import React, { useState, useMemo, useEffect } from 'react';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';

export const ReportesGH = () => {
  const { ctx, config } = useActiveArea();
  const { actividades, addTicket, updateTicket } = ctx;
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [draggedUser, setDraggedUser] = useState(null);

  // Auto-cierre de reportes de días anteriores a la medianoche
  useEffect(() => {
    if (!actividades || !updateTicket) return;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    actividades.forEach(a => {
      if (a.tipoSolicitud === 'Reporte de Asistencia' && ['Pendiente', 'En progreso'].includes(a.estado)) {
        const d = new Date(a.fechaCreacion || a.fechaISO);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() < hoy.getTime()) {
          // Es de un día anterior y quedó abierto: auto-cerrar
          updateTicket(a.id, { estado: 'Resuelto' });
        }
      }
    });
  }, [actividades, updateTicket]);

  // Get users
  const allUsers = useMemo(() => {
    try {
      const db = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
      return db.filter(u => u.role !== 'admin_ti');
    } catch {
      return [];
    }
  }, []);

  const { todayTickets, isHoyFestivoOFinDeSemana } = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    
    // Simplification for Phase 3/4
    const isWeekend = hoy.getDay() === 0 || hoy.getDay() === 6;
    let isFestivo = false;
    try {
      const festivos = JSON.parse(localStorage.getItem('db_festivos') || '[]');
      const hoyStr = hoy.toISOString().split('T')[0];
      if (festivos.includes(hoyStr)) isFestivo = true;
    } catch {}

    const todayT = actividades.filter(a => {
      if (a.tipoSolicitud !== 'Reporte de Asistencia') return false;
      const d = new Date(a.fechaCreacion || a.fechaISO);
      d.setHours(0,0,0,0);
      return d.getTime() === hoy.getTime();
    });

    return { todayTickets: todayT, isHoyFestivoOFinDeSemana: isWeekend || isFestivo };
  }, [actividades]);

  // Categorize
  const board = useMemo(() => {
    const cols = {
      noReportados: [],
      cliente: [],
      casa: [],
      oficina: []
    };

    allUsers.forEach(user => {
      // Find if they have a ticket today
      const ticket = todayTickets.find(t => t.solicitante === user.nombreReal || t.solicitante === user.username);
      
      const userItem = {
        ...user,
        displayName: user.nombreReal || user.username,
        ticket
      };

      if (!ticket) {
        cols.noReportados.push(userItem);
      } else {
        const tramite = ticket.tipoTramite;
        if (tramite === 'Cliente') cols.cliente.push(userItem);
        else if (tramite === 'Trabajo en Casa') cols.casa.push(userItem);
        else if (tramite === 'Oficina') cols.oficina.push(userItem);
        else cols.noReportados.push(userItem); // fallback
      }
    });

    return cols;
  }, [allUsers, todayTickets]);

  const handleManualAssign = async (user, location) => {
    if (user.ticket) {
      await updateTicket(user.ticket.id, { tipoTramite: location });
    } else {
      await addTicket({
        solicitante: user.displayName,
        tipoSolicitud: 'Reporte de Asistencia',
        tipoTramite: location,
        estado: 'En progreso', 
        fechaCreacion: new Date().toLocaleString(),
        detalles: {
          registradoManualmentePor: 'Gestión Humana'
        }
      });
    }
  };

  const handleDragStart = (e, user) => {
    setDraggedUser(user);
    e.dataTransfer.setData('text/plain', user.username);
  };

  const handleDrop = (e, targetLocation) => {
    e.preventDefault();
    if (draggedUser) {
      if (draggedUser.ticket?.tipoTramite !== targetLocation) {
         handleManualAssign(draggedUser, targetLocation);
      }
      setDraggedUser(null);
    }
  };

  return (
    <div className="page-content" style={{ padding: '30px' }}>
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: config.color, margin: 0, fontSize: '24px' }}>
          <i className="fa-solid fa-map-location-dot"></i> Control de Personal Diario
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn-secondary ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <i className="fa-solid fa-table-columns"></i> Kanban
          </button>
          <button 
            className={`btn-secondary ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <i className="fa-solid fa-list"></i> Tabla
          </button>
        </div>
      </div>

      {isHoyFestivoOFinDeSemana && (
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#854d0e', fontWeight: 'bold' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> Hoy es un día no laboral o festivo. Los reportes no son obligatorios.
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', minHeight: '600px' }}>
          {/* No Reportados */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'No Reportado')}
          >
            <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '10px', marginBottom: '15px', color: '#ef4444', fontSize: '15px' }}>
              <i className="fa-solid fa-user-xmark"></i> No Reportados ({board.noReportados.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.noReportados.map(u => (
                <div 
                  key={u.username}
                  draggable
                  onDragStart={(e) => handleDragStart(e, u)}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{u.displayName}</strong><br/>
                    <small style={{ color: 'var(--text-muted)' }}>{u.cargo || 'Sin cargo'}</small>
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 10px', fontSize: '12px', margin: 0 }}
                    onClick={() => handleManualAssign(u, 'Oficina')}
                    title="Marcar Asistencia en Oficina"
                  >
                    <i className="fa-solid fa-building"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Oficina */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Oficina')}
          >
            <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '10px', marginBottom: '15px', color: '#3b82f6', fontSize: '15px' }}>
              <i className="fa-solid fa-building"></i> En Oficina ({board.oficina.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.oficina.map(u => (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{u.displayName}</strong>
                    <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#3b82f6', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Jornada Finalizada' : 'En turno'}
                    </div>
                  </div>
                  {u.ticket?.estado !== 'Resuelto' && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '10px', margin: 0, color: '#ef4444' }}
                      onClick={() => updateTicket(u.ticket.id, { estado: 'Resuelto' })}
                      title="Finalizar Jornada"
                    >
                      <i className="fa-solid fa-power-off"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trabajo en Casa */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Trabajo en Casa')}
          >
            <h3 style={{ borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', marginBottom: '15px', color: '#8b5cf6', fontSize: '15px' }}>
              <i className="fa-solid fa-house-laptop"></i> En Casa ({board.casa.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.casa.map(u => (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab' }}>
                  <strong>{u.displayName}</strong>
                  <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#8b5cf6', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Jornada Finalizada' : 'En turno'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En Cliente */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Cliente')}
          >
            <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '10px', marginBottom: '15px', color: '#10b981', fontSize: '15px' }}>
              <i className="fa-solid fa-briefcase"></i> En Cliente ({board.cliente.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.cliente.map(u => (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab' }}>
                  <strong>{u.displayName}</strong>
                  <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#10b981', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Jornada Finalizada' : 'En turno'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)' }}>
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Colaborador</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Cargo</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Ubicación de Hoy</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Estado de Jornada</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Hora Inicio</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => {
                const t = u.ticket;
                return (
                  <tr key={u.username} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.displayName}</td>
                    <td style={{ padding: '12px' }}>{u.cargo || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {t ? (
                        <span className={`badge ${t.tipoTramite === 'Oficina' ? 'progreso' : t.tipoTramite === 'Cliente' ? 'resuelto' : 'pendiente'}`}>
                          {t.tipoTramite}
                        </span>
                      ) : (
                        <span className="badge suspendido" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>No Reportado</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {t ? (
                        t.estado === 'Resuelto' ? <strong style={{color: '#10b981'}}><i className="fa-solid fa-check"></i> Finalizada</strong> : <span style={{color: '#3b82f6'}}><i className="fa-solid fa-clock"></i> En Turno</span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{t ? (t.fechaInicio ? t.fechaInicio.split(', ')[1] : t.fechaCreacion.split(', ')[1]) : '-'}</td>
                    <td style={{ padding: '12px' }}>{t?.estado === 'Resuelto' && t.fechaFin ? t.fechaFin.split(', ')[1] : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
