import React, { useState, useEffect } from 'react';
import { DbService } from '../../services/DbService';

export const WidgetMiEstado = () => {
  const [responsables, setResponsables] = useState([]);
  const [miNombre, setMiNombre] = useState('');
  const [miEstado, setMiEstado] = useState('disponible');

  useEffect(() => {
    const loadNombres = async () => {
      const resps = await DbService.getResponsables();
      setResponsables(resps || []);
      
      const savedSelection = localStorage.getItem('db_mi_seleccion');
      if (savedSelection) {
        try {
          const parsed = JSON.parse(savedSelection);
          if (parsed.nombre) setMiNombre(parsed.nombre);
        } catch (e) {}
      }
    };
    loadNombres();
  }, []);

  const handleSetEstadoRapido = (estado) => {
    setMiEstado(estado);
  };

  const publicarMiEstado = async () => {
    if (!miNombre) {
      alert("Selecciona tu nombre primero.");
      return;
    }

    const estadoObj = {
      nombre: miNombre,
      estado: miEstado,
      timestamp: Date.now()
    };

    localStorage.setItem('db_mi_seleccion', JSON.stringify(estadoObj));

    const allStates = JSON.parse(localStorage.getItem('db_estado_personal') || '{}');
    allStates[miNombre] = estadoObj;
    localStorage.setItem('db_estado_personal', JSON.stringify(allStates));

    // Force cross-tab sync by triggering a custom storage event locally, 
    // since we use standard storage event across tabs
    window.dispatchEvent(new Event('storage'));

    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = "¡Estado actualizado!";
      toast.classList.remove('hidden');
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
      }, 3000);
    }
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'disponible': 'Disponible (En Oficina)',
      'en_desarrollo': 'Disponible (Home Office)',
      'reunion': 'En Reunión',
      'atendiendo': 'Ocupada (Trámite)',
      'urgente': 'Urgencia'
    };
    return labels[estado] || 'Desconocido';
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h3 className="panel-title">MI ESTADO</h3>
        <i className="fa-solid fa-circle-user panel-icon-left"></i>
      </div>
      <div className="widget-body">
        <div className="form-group widget-group">
          <label className="form-label panel-label-small">¿Quién eres?</label>
          <div className="select-wrapper">
            <i className="fa-solid fa-user-tie select-icon-left"></i>
            <select 
              id="mi_nombre" 
              className="form-select padded-left" 
              value={miNombre} 
              onChange={(e) => setMiNombre(e.target.value)}
            >
              <option value="">Selecciona tu nombre...</option>
              {responsables.map(r => {
                const nombre = r.nombre || r;
                return <option key={nombre} value={nombre}>{nombre}</option>;
              })}
            </select>
            <i className="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>

        <div className="form-group widget-group-lg">
          <label className="form-label panel-label-small">Estado Actual</label>
          <div className="select-wrapper">
            <i className="fa-solid fa-traffic-light select-icon-left"></i>
            <select 
              id="mi_estado" 
              className="form-select padded-left" 
              value={miEstado} 
              onChange={(e) => setMiEstado(e.target.value)}
            >
              <option value="disponible">🟢 Disponible (En Oficina)</option>
              <option value="en_desarrollo">🔵 Disponible (Home Office)</option>
              <option value="reunion">🟣 En Reunión</option>
              <option value="atendiendo">🔴 Ocupada (Trámite)</option>
              <option value="urgente">🔴 Urgencia</option>
            </select>
            <i className="fa-solid fa-chevron-down select-arrow"></i>
          </div>
          <div className="status-circles-container flex-center mt-10px">
            <button type="button" className="status-circle-btn bg-disponible" title="Disponible (En Oficina)" onClick={() => handleSetEstadoRapido('disponible')}></button>
            <button type="button" className="status-circle-btn bg-desarrollo" title="Disponible (Home Office)" onClick={() => handleSetEstadoRapido('en_desarrollo')}></button>
            <button type="button" className="status-circle-btn bg-reunion" title="En Reunión" onClick={() => handleSetEstadoRapido('reunion')}></button>
            <button type="button" className="status-circle-btn bg-atendiendo" title="Ocupada (Trámite)" onClick={() => handleSetEstadoRapido('atendiendo')}></button>
            <button type="button" className="status-circle-btn bg-urgente" title="Urgencia" onClick={() => handleSetEstadoRapido('urgente')}></button>
          </div>
        </div>

        <div id="estadoPreviewPanel" className="preview-panel-box">
          <strong className="preview-name" id="previewNombre">{miNombre || '(Selecciona nombre)'}</strong>
          <span id="previewEstado"> &gt; {getEstadoLabel(miEstado)}</span>
        </div>

        <button type="button" className="btn-save widget-btn-primary" id="btnPublicarMiEstado" onClick={publicarMiEstado}>
          Actualizar mi Estado
        </button>
      </div>
    </div>
  );
};
