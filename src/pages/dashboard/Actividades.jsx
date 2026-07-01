import React, { useState, useMemo, useEffect } from 'react';
import { useTickets } from '../../contexts/TicketContext';

export const Actividades = () => {
  const { actividades, responsables } = useTickets();
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    responsable: '',
    periodo: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  // Escuchar el evento de busqueda global del Topbar
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail.query.toLowerCase());
    };
    document.addEventListener('searchTriggered', handleSearch);
    return () => document.removeEventListener('searchTriggered', handleSearch);
  }, []);

  const handleChangeFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleLimpiar = () => {
    setFiltros({ estado: '', prioridad: '', responsable: '', periodo: '' });
    setSearchQuery('');
  };

  const datosFiltrados = useMemo(() => {
    return actividades.filter(a => {
      if (filtros.estado && a.estado !== filtros.estado) return false;
      if (filtros.prioridad && a.prioridad !== filtros.prioridad) return false;
      if (filtros.responsable && a.responsable !== filtros.responsable) return false;
      
      if (searchQuery) {
        const matchesId = (a.id || '').toLowerCase().includes(searchQuery);
        const matchesSol = (a.solicitud || '').toLowerCase().includes(searchQuery);
        const matchesNom = (a.nombre || a.solicitante || '').toLowerCase().includes(searchQuery);
        if (!matchesId && !matchesSol && !matchesNom) return false;
      }
      
      return true;
    }).reverse();
  }, [actividades, filtros, searchQuery]);

  return (
    <div className="dashboard-wrapper">
      <div className="page-header fade-in">
        <h1 className="page-title">Actividades</h1>
        <p className="page-subtitle">Explorador general de tickets y registros históricos</p>
      </div>

      <div className="filters-bar glass-panel fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Estado</label>
            <select name="estado" value={filtros.estado} onChange={handleChangeFiltro} className="glass-input">
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Prioridad</label>
            <select name="prioridad" value={filtros.prioridad} onChange={handleChangeFiltro} className="glass-input">
              <option value="">Todas</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Responsable</label>
            <select name="responsable" value={filtros.responsable} onChange={handleChangeFiltro} className="glass-input">
              <option value="">Todos</option>
              {responsables.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filters-actions">
          <button className="btn-secondary" onClick={handleLimpiar}>
            <i className="fa-solid fa-eraser"></i> Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="glass-panel table-panel fade-in" style={{ animationDelay: '0.2s', marginTop: '24px' }}>
        <div className="table-responsive">
          {datosFiltrados.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>Sin resultados para los filtros aplicados</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitud</th>
                  <th>Solicitante</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Grupo</th>
                  <th>Responsable</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map(r => {
                  const estadoClase = r.estado?.toLowerCase().includes('progreso') ? 'progreso' 
                                    : r.estado?.toLowerCase().includes('resuelto') || r.estado?.toLowerCase().includes('cerrado') ? 'resuelto' 
                                    : 'pendiente';
                                    
                  const prioClase = (r.prioridad === 'Alta' || r.prioridad === 'Urgente') ? 'alta' 
                                  : r.prioridad === 'Media' ? 'media' 
                                  : 'baja';

                  return (
                    <tr key={r.id}>
                      <td className="col-id">{r.id}</td>
                      <td className="col-solicitud" title={r.solicitud || r.nombre}>{r.solicitud || r.nombre}</td>
                      <td>{r.nombre || r.solicitante}</td>
                      <td><span className={`status-badge ${estadoClase}`}>{r.estado}</span></td>
                      <td><span className={`prioridad-badge ${prioClase}`}>{r.prioridad}</span></td>
                      <td>{r.grupo}</td>
                      <td>{r.responsable || 'Sin asignar'}</td>
                      <td className="col-fecha">{r.fechaCreacion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
