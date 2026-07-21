import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { getAreaSettings } from '../../shared/services/SettingsManager';

// Parsea fecha según la lógica original de JS
const parseFechaCreacion = (ticket) => {
  if (ticket.fechaISO) {
    const d = new Date(ticket.fechaISO);
    if (!isNaN(d.getTime())) return d;
  }
  const raw = ticket.fechaCreacion || '';
  if (!raw) return null;
  const d2 = new Date(raw);
  if (!isNaN(d2.getTime())) return d2;

  const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    const timeMatch = raw.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
    let hours = 0, minutes = 0, seconds = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      if (/p\.?\s*m\.?/i.test(raw) && hours < 12) hours += 12;
      if (/a\.?\s*m\.?/i.test(raw) && hours === 12) hours = 0;
    }
    const d3 = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(d3.getTime())) return d3;
  }
  return null;
};

export const Actividades = () => {
  const { ctx, area } = useActiveArea();
  const { actividades, responsables } = ctx;
  const settings = getAreaSettings(area);
  const slas = settings.slas || { Urgente: 2, Alta: 8, Media: 24, Baja: 48 };
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  const [filters, setFilters] = useState({
    estado: '',
    prioridad: '',
    responsable: '',
    periodo: '',
    tipo: ''
  });

  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail?.query || '');
      setCurrentPage(1);
    };
    document.addEventListener('searchTriggered', handleSearch);
    
    // Also grab current value just in case it was typed before mount
    const searchInput = document.getElementById('searchInput');
    if (searchInput) setSearchQuery(searchInput.value.toLowerCase());

    return () => document.removeEventListener('searchTriggered', handleSearch);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ estado: '', prioridad: '', responsable: '', periodo: '', tipo: '' });
    setCurrentPage(1);
  };

  const filteredActividades = useMemo(() => {
    const result = actividades.filter(a => {
      if (filters.estado && a.estado !== filters.estado) return false;
      if (filters.prioridad && a.prioridad !== filters.prioridad) return false;
      if (filters.responsable && a.responsable !== filters.responsable) return false;
      if (filters.tipo && a.tipo !== filters.tipo) return false;

      if (filters.periodo) {
        const fecha = parseFechaCreacion(a);
        if (!fecha) return false;
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (filters.periodo === 'hoy') {
          const fechaAct = new Date(fecha.getTime());
          fechaAct.setHours(0, 0, 0, 0);
          if (fechaAct.getTime() !== hoy.getTime()) return false;
        } else if (filters.periodo === 'semana') {
          const semanaAtras = new Date(hoy);
          semanaAtras.setDate(semanaAtras.getDate() - 7);
          if (fecha < semanaAtras) return false;
        } else if (filters.periodo === 'mes') {
          const mesAtras = new Date(hoy);
          mesAtras.setMonth(mesAtras.getMonth() - 1);
          if (fecha < mesAtras) return false;
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = (a.id || '').toLowerCase().includes(query);
        const matchesSolicitud = (a.solicitud || '').toLowerCase().includes(query);
        const matchesNombre = (a.nombre || a.solicitante || '').toLowerCase().includes(query);
        const matchesResponsable = (a.responsable || '').toLowerCase().includes(query);
        if (!matchesId && !matchesSolicitud && !matchesNombre && !matchesResponsable) return false;
      }

      return true;
    });

    return result.sort((a, b) => {
      const dA = parseFechaCreacion(a);
      const dB = parseFechaCreacion(b);
      if (dA && dB) return dB - dA;
      return 0;
    });
  }, [actividades, filters, searchQuery]);

  const totalPages = Math.ceil(filteredActividades.length / itemsPerPage);
  const paginatedActividades = filteredActividades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Quick Stats
  const stats = useMemo(() => {
    return {
      total: filteredActividades.length,
      pendientes: filteredActividades.filter(d => d.estado === 'Pendiente').length,
      progreso: filteredActividades.filter(d => (d.estado || '').includes('progreso')).length,
      resueltos: filteredActividades.filter(d => d.estado === 'Resuelto' || d.estado === 'Cerrado').length,
      urgentes: filteredActividades.filter(d => d.prioridad === 'Urgente').length
    };
  }, [filteredActividades]);

  return (
    <section id="section-recents" className="section active">
      <div className="section-header">
        <h2 className="section-title">Actividades</h2>
        <button className="btn-refresh" id="btnRefreshActivityTable" onClick={() => window.location.reload()}>
          <i className="fa-solid fa-rotate-right"></i> Actualizar
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label"><i className="fa-solid fa-filter"></i> Filtros:</label>
        </div>
        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <select name="estado" className="filter-select filter-actividades" value={filters.estado} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Revisado">Revisado</option>
            <option value="En progreso">En progreso</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Tipo</label>
          <select name="tipo" className="filter-select filter-actividades" value={filters.tipo} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="Incidente">Incidente</option>
            <option value="Requerimiento">Requerimiento</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Prioridad</label>
          <select name="prioridad" className="filter-select filter-actividades" value={filters.prioridad} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="Urgente">Urgente</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Responsable</label>
          <select name="responsable" className="filter-select filter-actividades" value={filters.responsable} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {responsables.map(r => (
              <option key={r.nombre || r} value={r.nombre || r}>{r.nombre || r}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Período</label>
          <select name="periodo" className="filter-select filter-actividades" value={filters.periodo} onChange={handleFilterChange}>
            <option value="">Todo</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>
        </div>
        <div className="filter-group">
          <button className="btn-clear-filters" id="btnLimpiarFiltros" onClick={clearFilters}>
            <i className="fa-solid fa-xmark"></i> Limpiar
          </button>
        </div>
      </div>

      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="qs-value" id="qsTotal">{stats.total}</div>
          <div className="qs-label">Total</div>
        </div>
        <div className="quick-stat-card pendiente">
          <div className="qs-value" id="qsPendientes">{stats.pendientes}</div>
          <div className="qs-label">Pendientes</div>
        </div>
        <div className="quick-stat-card progreso">
          <div className="qs-value" id="qsProgreso">{stats.progreso}</div>
          <div className="qs-label">En Progreso</div>
        </div>
        <div className="quick-stat-card resueltos">
          <div className="qs-value" id="qsResueltos">{stats.resueltos}</div>
          <div className="qs-label">Resueltos</div>
        </div>
        <div className="quick-stat-card urgentes">
          <div className="qs-value" id="qsUrgentes">{stats.urgentes}</div>
          <div className="qs-label">Urgentes</div>
        </div>
      </div>

      <div className="table-card">
        <div id="activityTable">
          <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitud</th>
                  <th>Solicitante</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>SLA (Restante)</th>
                  <th>Grupo</th>
                  <th>Responsable</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActividades.map(r => {
                  const estado = (r.estado || '').toLowerCase();
                  let estadoClass = 'pendiente';
                  if (estado.includes('progreso')) estadoClass = 'progreso';
                  else if (estado.includes('resuelto') || estado.includes('cerrado')) estadoClass = 'resuelto';

                  const prio = (r.prioridad || '').toLowerCase();
                  let prioClass = 'baja';
                  if (prio === 'alta' || prio === 'urgente') prioClass = 'alta';
                  else if (prio === 'media') prioClass = 'media';

                  // --- CÁLCULO DE SLA ---
                  let slaBadge = null;
                  if (r.estado !== 'Resuelto' && r.estado !== 'Cerrado') {
                    const startMs = parseFechaCreacion(r)?.getTime();
                    if (startMs) {
                      const limiteSlaHoras = slas[r.prioridad] || 48;
                      const limiteMs = limiteSlaHoras * 3600 * 1000;
                      // Si está suspendido, no seguimos sumando el tiempo actual, nos quedamos en fechaPausa
                      const endMs = r.estado === 'Suspendido' && r.fechaPausa ? r.fechaPausa : Date.now();
                      const consumidoMs = endMs - startMs - (r.tiempoPausadoTotal || 0);
                      
                      const restanteMs = limiteMs - consumidoMs;
                      const absMs = Math.abs(restanteMs);
                      const totalMins = Math.floor(absMs / (60 * 1000));
                      const hours = Math.floor(totalMins / 60);
                      const mins = totalMins % 60;
                      const timeString = `${hours}h ${mins}m`;
                      
                      if (restanteMs < 0) {
                        slaBadge = <span className="sla-badge danger" title={`Vencido por ${timeString}`}><i className="fa-solid fa-fire"></i> Vencido</span>;
                      } else if (restanteMs <= 2 * 3600 * 1000) { // Menos de 2 horas
                        slaBadge = <span className="sla-badge warning" title={`Quedan ${timeString}`}><i className="fa-solid fa-triangle-exclamation"></i> Por vencer</span>;
                      } else {
                        slaBadge = <span className="sla-badge ok" title={`Quedan ${timeString}`}><i className="fa-solid fa-check"></i> A tiempo</span>;
                      }
                    }
                  } else {
                    slaBadge = <span className="sla-badge ok"><i className="fa-solid fa-flag-checkered"></i> Cumplido</span>;
                  }

                  return (
                    <tr key={r.id}>
                      <td className="col-id">{r.id || ''}</td>
                      <td className="col-solicitud" title={r.solicitud || r.nombre || ''}>
                        {r.solicitud || r.nombre || ''}
                      </td>
                      <td>{r.nombre || r.solicitante || ''}</td>
                      <td><span className={`status-badge ${estadoClass}`}>{r.estado || ''}</span></td>
                      <td><span className={`prioridad-badge ${prioClass}`}>{r.prioridad || ''}</span></td>
                      <td>{slaBadge}</td>
                      <td>{r.grupo || ''}</td>
                      <td>{r.responsable || 'Sin asignar'}</td>
                      <td className="col-fecha">{r.fechaCreacion || ''}</td>
                    </tr>
                  );
                })}
                {paginatedActividades.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No se encontraron actividades con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Mostrando {filteredActividades.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredActividades.length)} de {filteredActividades.length} registros
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filas por página:</span>
                <select 
                  style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--card-border)', outline: 'none' }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <i className="fa-solid fa-chevron-left"></i> Anterior
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: 'var(--navy)' }}>
                  Página {currentPage} de {totalPages}
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Siguiente <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
