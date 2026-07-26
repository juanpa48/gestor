import React, { useState, useEffect } from 'react';
import { getAreaSettings, saveAreaSettings } from '../../../../shared/services/SettingsManager';
import { useActiveArea } from '../../../../shared/contexts/ActiveAreaContext';

export const SettingsSLA = () => {
  const { area } = useActiveArea();
  const [slas, setSlas] = useState({ Urgente: 2, Alta: 8, Media: 24, Baja: 48 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const settings = getAreaSettings(area);
    if (settings.slas) setSlas(settings.slas);
  }, [area]);

  if (area === 'gh') {
    return (
      <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: '16px' }}>Módulo SLA No Disponible</h2>
        <p style={{ color: 'var(--text-muted)' }}>Gestión Humana maneja un SLA fijo de 9 horas que no requiere configuración manual.</p>
      </div>
    );
  }

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-check"></i> &nbsp;${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Preservar grupos si existen
    const currentSettings = getAreaSettings(area);
    saveAreaSettings(area, currentSettings.grupos || [], slas);
    
    setTimeout(() => {
      setIsSaving(false);
      showToast('Configuración de SLA guardada exitosamente');
    }, 400);
  };

  return (
    <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
          <i className="fa-solid fa-stopwatch"></i> Acuerdos de Nivel de Servicio (SLA)
        </h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px' }}>
        Define el tiempo máximo de resolución (en horas) permitido para cada nivel de prioridad.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {['Urgente', 'Alta', 'Media', 'Baja'].map(prio => (
          <div key={prio} style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--navy)', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span className="prioridad-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: prio === 'Urgente' ? '#ef4444' : prio === 'Alta' ? '#f59e0b' : prio === 'Media' ? '#3b82f6' : '#22c55e', marginRight: '6px' }}></span>
              Prioridad {prio}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="number" 
                min="0"
                className="glass-input" 
                value={Math.floor(slas[prio] || 0)} 
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  const m = Math.round(((slas[prio] || 0) % 1) * 60);
                  setSlas({...slas, [prio]: h + (m / 60)});
                }}
                style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', padding: '8px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>h</span>

              <input 
                type="number" 
                min="0"
                max="59"
                className="glass-input" 
                value={Math.round(((slas[prio] || 0) % 1) * 60)} 
                onChange={(e) => {
                  const h = Math.floor(slas[prio] || 0);
                  let m = parseInt(e.target.value) || 0;
                  if (m > 59) m = 59;
                  if (m < 0) m = 0;
                  setSlas({...slas, [prio]: h + (m / 60)});
                }}
                style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', padding: '8px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>m</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(30,58,95,0.1)', paddingTop: '20px', textAlign: 'right' }}>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> : <><i className="fa-solid fa-save"></i> Guardar SLA</>}
        </button>
      </div>
    </div>
  );
};
