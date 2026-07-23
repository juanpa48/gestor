import React, { useState } from 'react';

export const WidgetSistemas = () => {
  const [sistema, setSistema] = useState('servidor');
  const [estado, setEstado] = useState('ok');
  const [mensaje, setMensaje] = useState('');

  const publicarEstadoSistema = () => {
    const systems = JSON.parse(localStorage.getItem('db_sistemas') || '{}');
    
    systems[sistema] = {
      estado: estado,
      mensaje: mensaje,
      timestamp: Date.now()
    };
    
    localStorage.setItem('db_sistemas', JSON.stringify(systems));
    window.dispatchEvent(new Event('storage'));

    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = "¡Alerta de sistema enviada!";
      toast.classList.remove('hidden');
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
      }, 3000);
    }
  };

  return (
    <div className="panel-card" id="panelControlSistemas">
      <div className="panel-header">
        <h3 className="panel-title">CONTROL ESTADO SISTEMAS</h3>
        <button type="button" className="icon-btn-sm" title="Publicar Estado">
          <i className="fa-solid fa-satellite-dish"></i>
        </button>
      </div>
      <div className="widget-body">
        <div className="form-group widget-group">
          <label className="form-label panel-label-small">Sistema Afectado</label>
          <div className="select-wrapper">
            <i className="fa-solid fa-server select-icon-left"></i>
            <select 
              id="ctrl_sistema" 
              className="form-select padded-left"
              value={sistema}
              onChange={(e) => setSistema(e.target.value)}
            >
              <option value="servidor">Servidor Principal</option>
              <option value="contable">Programa Contable</option>
              <option value="red">Red e Internet</option>
            </select>
            <i className="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>

        <div className="form-group widget-group">
          <label className="form-label panel-label-small">Nuevo Estado</label>
          <div className="select-wrapper">
            <i className="fa-solid fa-traffic-light select-icon-left"></i>
            <select 
              id="ctrl_estado" 
              className="form-select padded-left"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                if (e.target.value === 'ok') setMensaje('');
              }}
            >
              <option value="ok">🟢 Operando Normal (OK)</option>
              <option value="warning">🟡 Alerta / Degradado</option>
              <option value="error">🔴 Servicio Caído / Error</option>
            </select>
            <i className="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>

        <div className="form-group widget-group-lg" id="grupo_mensaje">
          <label className="form-label panel-label-small">Mensaje a Empleados</label>
          <div className="input-wrapper">
            <i className="fa-solid fa-bullhorn input-icon"></i>
            <input 
              type="text" 
              id="ctrl_mensaje" 
              className="form-input padded-left" 
              placeholder="Ej. Equipo TI trabajando en solución..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>
        </div>

        <button type="button" className="btn-save widget-btn-primary" id="btnPublicarEstadoSistema" onClick={publicarEstadoSistema}>
          Publicar Alerta
        </button>
      </div>
    </div>
  );
};
