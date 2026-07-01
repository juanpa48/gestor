import React, { useEffect, useState } from 'react';
import { DbService } from '../../services/DbService';

export const SystemStatus = () => {
  const [sistemas, setSistemas] = useState({
    servidor: { estado: 'ok', mensaje: '' },
    contable: { estado: 'ok', mensaje: '' },
    red: { estado: 'ok', mensaje: '' }
  });

  useEffect(() => {
    const fetchSistemas = async () => {
      const sys = await DbService.getSistemas();
      setSistemas(sys);
    };

    fetchSistemas();
    
    // Si queremos que sea 100% reactivo, podriamos tener un evento global para 'sistemas'
    // o un polling en un caso real, por ahora basta con cargar al montar
  }, []);

  const renderSys = (id, icon, label) => {
    const sysData = sistemas[id] || { estado: 'ok', mensaje: '' };
    const color = sysData.estado === 'ok' ? 'green' 
                : sysData.estado === 'warning' ? 'yellow' 
                : 'red';
                
    const title = sysData.estado === 'ok' ? label : `${label}: ${sysData.mensaje}`;

    return (
      <div className="sys-container" title={title}>
        <div className="sys-icon">
          <i className={`fa-solid ${icon}`}></i>
          <div className={`sys-dot dot-${color}`}></div>
        </div>
        <div className="sys-label">{label}</div>
      </div>
    );
  };

  return (
    <div className="stat-card stat-card-sistemas">
      <div className="stat-label">ESTADO DE SISTEMAS</div>
      <div className="sistemas-row">
        {renderSys('servidor', 'fa-server', 'SERVER')}
        {renderSys('contable', 'fa-calculator', 'CONTABLE')}
        {renderSys('red', 'fa-network-wired', 'RED APP')}
      </div>
    </div>
  );
};
