import React, { useState, useMemo, useEffect } from 'react';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { parseFechaCreacion } from '../../shared/utils/timeHelpers';

export const ReportesGH = () => {
  const { ctx, config } = useActiveArea();
  const { actividades, addTicket, updateTicket } = ctx;
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [draggedUser, setDraggedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('Todos');

  const showToast = (msg, type='success') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.className = `toast show ${type}`;
      toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'triangle-exclamation'}"></i> &nbsp;${msg}`;
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
  };

  // Auto-cierre de reportes de días anteriores a la medianoche
  useEffect(() => {
    if (!actividades || !updateTicket) return;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    actividades.forEach(a => {
      if (a.tipoSolicitud === 'Reporte de Asistencia' && ['Pendiente', 'En progreso'].includes(a.estado)) {
        const d = parseFechaCreacion(a);
        if (d) {
          d.setHours(0, 0, 0, 0);
          if (d.getTime() < hoy.getTime()) {
            // Es de un día anterior y quedó abierto: auto-cerrar
            updateTicket(a.id, { estado: 'Resuelto' });
          }
        }
      }
    });
  }, [actividades, updateTicket]);

  const [userTick, setUserTick] = useState(0);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'db_usuarios') setUserTick(t => t + 1);
    };
    const handleUpdate = () => setUserTick(t => t + 1);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('usuariosActualizados', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('usuariosActualizados', handleUpdate);
    };
  }, []);

  // Get users
  const allUsers = useMemo(() => {
    try {
      const db = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
      return db.filter(u => u.role !== 'admin_ti');
    } catch {
      return [];
    }
  }, [userTick]);

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
      const d = parseFechaCreacion(a);
      if (!d) return false;
      d.setHours(0,0,0,0);
      return d.getTime() === hoy.getTime();
    });

    return { todayTickets: todayT, isHoyFestivoOFinDeSemana: isWeekend || isFestivo };
  }, [actividades]);

  const enrichedUsers = useMemo(() => {
    return allUsers.map(user => {
      const ticket = todayTickets.find(t => t.solicitante === user.nombreReal || t.solicitante === user.username);
      let ubicacion = 'No Reportado';
      if (ticket) {
        ubicacion = ticket.tipoTramite || ticket.clasificacion || ticket.grupoExtra;
      }
      return {
        ...user,
        displayName: user.nombreReal || user.username,
        ticket,
        ubicacion
      };
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [allUsers, todayTickets]);

  const board = useMemo(() => {
    const cols = { oficina: [], casa: [], cliente: [], noReportados: [] };

    enrichedUsers.forEach(userItem => {
      if (!userItem.ticket) {
        cols.noReportados.push(userItem);
      } else {
        if (userItem.ubicacion === 'Cliente') cols.cliente.push(userItem);
        else if (userItem.ubicacion === 'Trabajo en Casa') cols.casa.push(userItem);
        else if (userItem.ubicacion === 'Oficina') cols.oficina.push(userItem);
        else cols.noReportados.push(userItem); // fallback
      }
    });

    return cols;
  }, [enrichedUsers]);

  const filteredTableUsers = useMemo(() => {
    return enrichedUsers.filter(u => {
      if (filterLocation !== 'Todos' && u.ubicacion !== filterLocation) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const clientName = u.ticket?.detalles?.cliente?.toLowerCase() || '';
        if (!u.displayName.toLowerCase().includes(q) && !clientName.includes(q)) return false;
      }
      return true;
    });
  }, [enrichedUsers, filterLocation, searchTerm]);

  const handleManualAssign = async (user, location) => {
    try {
      setIsLoading(true);
      showToast(`Procesando asistencia para ${user.displayName}...`, 'info');
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
      showToast(`Asistencia marcada para ${user.displayName} en ${location}`);
    } catch (error) {
      console.error(error);
      showToast('Error al procesar la asistencia', 'error');
    } finally {
      setIsLoading(false);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '400px' }}>
          {/* No Reportados */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
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
                    onClick={(e) => { e.stopPropagation(); handleManualAssign(u, 'Oficina'); }}
                    title="Marcar Asistencia en Oficina"
                    disabled={isLoading}
                  >
                    <i className="fa-solid fa-building"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Oficina */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Oficina')}
          >
            <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '10px', marginBottom: '15px', color: '#3b82f6', fontSize: '15px' }}>
              <i className="fa-solid fa-building"></i> En Oficina ({board.oficina.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.oficina.map(u => {
                const timeStr = u.ticket?.fechaCreacion ? u.ticket.fechaCreacion.split(', ')[1] : '';
                return (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{u.displayName}</strong>
                    <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#3b82f6', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Finalizada' : 'En turno'} {timeStr ? `(${timeStr})` : ''}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Trabajo en Casa */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Trabajo en Casa')}
          >
            <h3 style={{ borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', marginBottom: '15px', color: '#8b5cf6', fontSize: '15px' }}>
              <i className="fa-solid fa-house-laptop"></i> En Casa ({board.casa.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.casa.map(u => {
                const timeStr = u.ticket?.fechaCreacion ? u.ticket.fechaCreacion.split(', ')[1] : '';
                return (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab' }}>
                  <strong>{u.displayName}</strong>
                  <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#8b5cf6', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Finalizada' : 'En turno'} {timeStr ? `(${timeStr})` : ''}
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* En Cliente */}
          <div 
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'Cliente')}
          >
            <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '10px', marginBottom: '15px', color: '#10b981', fontSize: '15px' }}>
              <i className="fa-solid fa-briefcase"></i> En Cliente ({board.cliente.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {board.cliente.map(u => {
                const timeStr = u.ticket?.fechaCreacion ? u.ticket.fechaCreacion.split(', ')[1] : '';
                return (
                <div key={u.username} draggable onDragStart={(e) => handleDragStart(e, u)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px', borderRadius: '8px', marginBottom: '10px', cursor: 'grab' }}>
                  <strong>{u.displayName}</strong>
                  {u.ticket?.detalles?.cliente && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                      <i className="fa-solid fa-building-user"></i> {u.ticket.detalles.cliente}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: u.ticket?.estado === 'Resuelto' ? '#10b981' : '#10b981', marginTop: '4px' }}>
                      <i className={`fa-solid ${u.ticket?.estado === 'Resuelto' ? 'fa-check' : 'fa-clock'}`}></i> {u.ticket?.estado === 'Resuelto' ? 'Finalizada' : 'En turno'} {timeStr ? `(${timeStr})` : ''}
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel fade-in" style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)' }}>
          {/* Barra de Filtros y Buscador */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            
            {/* Pestañas de Filtro */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '5px' }}>
              {['Todos', 'Oficina', 'Trabajo en Casa', 'Cliente', 'No Reportado'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilterLocation(f)}
                  style={{ 
                    padding: '8px 18px', 
                    borderRadius: '20px', 
                    border: filterLocation === f ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                    background: filterLocation === f ? '#3b82f6' : '#f8fafc',
                    color: filterLocation === f ? '#ffffff' : '#475569',
                    fontWeight: filterLocation === f ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    fontSize: '13px',
                    boxShadow: filterLocation === f ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className="search-box" style={{ minWidth: '250px' }}>
              <i className="fa-solid fa-search"></i>
              <input 
                type="text" 
                placeholder="Buscar por colaborador o cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', overflowY: 'auto', width: '100%', maxHeight: 'calc(100vh - 260px)' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
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
                {filteredTableUsers.map(u => {
                  const t = u.ticket;
                  return (
                    <tr key={u.username} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.displayName}</td>
                      <td style={{ padding: '12px' }}>{u.cargo || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        {t ? (
                          <div>
                            <span className={`status-badge ${u.ubicacion === 'Oficina' ? 'progreso' : u.ubicacion === 'Cliente' ? 'resuelto' : 'pendiente'}`}>
                              {u.ubicacion}
                            </span>
                            {t.detalles?.cliente && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <i className="fa-solid fa-building-user"></i> {t.detalles.cliente}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="status-badge suspendido" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>No Reportado</span>
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
                {filteredTableUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No se encontraron colaboradores que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
