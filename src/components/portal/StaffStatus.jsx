import React, { useEffect, useState } from 'react';
import { DbService } from '../../services/DbService';

const ESTADO_ICONS = {
  'disponible': { icon: 'fa-check', color: '#22c55e' },
  'en_desarrollo': { icon: 'fa-house-laptop', color: '#3b82f6' },
  'reunion': { icon: 'fa-users', color: '#a855f7' },
  'atendiendo': { icon: 'fa-headset', color: '#ef4444' },
  'urgente': { icon: 'fa-triangle-exclamation', color: '#ef4444' }
};

export const StaffStatus = () => {
  const [personal, setPersonal] = useState({});

  useEffect(() => {
    const fetchPersonal = async () => {
      const data = await DbService.getEstadoPersonal();
      setPersonal(data);
    };

    fetchPersonal();
  }, []);

  return (
    <aside className="glass-panel aside-panel">
      <div className="panel-title">
        <i className="fa-solid fa-users-gear"></i> Personal Asignado
      </div>

      <div id="itStaffContainer">
        {Object.keys(personal).length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
            No hay estados publicados.
          </div>
        ) : (
          Object.entries(personal).map(([nombre, info]) => {
            const estadoKey = info.estado || 'disponible';
            const iconData = ESTADO_ICONS[estadoKey] || ESTADO_ICONS['disponible'];
            
            return (
              <div key={nombre} className="staff-card">
                <div className="staff-avatar">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div className="staff-info">
                  <div className="staff-name">{nombre}</div>
                  <div className="staff-status" style={{ color: iconData.color }}>
                    <i className={`fa-solid ${iconData.icon}`}></i> {info.label || estadoKey}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
