import React, { useState, useEffect } from 'react';
import { getAreaSettings, saveAreaSettings } from '../../../../shared/services/SettingsManager';
import { useActiveArea } from '../../../../shared/contexts/ActiveAreaContext';

export const SettingsTramites = () => {
  const { area } = useActiveArea();
  const [grupos, setGrupos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const settings = getAreaSettings(area);
    setGrupos(settings.grupos || []);
  }, [area]);

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

  const handleAddGrupo = () => {
    setGrupos([...grupos, { nombre: 'Nuevo Grupo', tramites: [] }]);
  };

  const handleRemoveGrupo = (gIdx) => {
    if (window.confirm('¿Eliminar este grupo de trámites?')) {
      const newGrupos = [...grupos];
      newGrupos.splice(gIdx, 1);
      setGrupos(newGrupos);
    }
  };

  const handleChangeGrupoNombre = (gIdx, value) => {
    const newGrupos = [...grupos];
    newGrupos[gIdx].nombre = value;
    setGrupos(newGrupos);
  };

  const handleAddTramite = (gIdx) => {
    const newGrupos = [...grupos];
    newGrupos[gIdx].tramites.push('Nuevo Trámite');
    setGrupos(newGrupos);
  };

  const handleRemoveTramite = (gIdx, tIdx) => {
    const newGrupos = [...grupos];
    newGrupos[gIdx].tramites.splice(tIdx, 1);
    setGrupos(newGrupos);
  };

  const handleChangeTramite = (gIdx, tIdx, value) => {
    const newGrupos = [...grupos];
    newGrupos[gIdx].tramites[tIdx] = value;
    setGrupos(newGrupos);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Preservar SLAs si existen para esta área
    const currentSettings = getAreaSettings(area);
    saveAreaSettings(area, grupos, currentSettings.slas);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Grupos y trámites guardados exitosamente');
    }, 400);
  };

  return (
    <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0 }}>
      {area === 'gh' ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '20px', opacity: 0.8 }}></i>
          <h2 style={{ color: 'var(--navy)', marginBottom: '10px' }}>Trámites de Gestión Humana Protegidos</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Los trámites de Gestión Humana están configurados con formularios dinámicos y lógicas de cálculo especializadas (Permisos, Vacaciones, Cesantías). 
            Por seguridad, esta estructura se gestiona automáticamente por el sistema y no puede ser modificada manualmente.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
              <i className="fa-solid fa-list-check"></i> Gestión de Trámites
            </h2>
            <button className="btn-secondary" onClick={handleAddGrupo} style={{ padding: '8px 12px', fontSize: '13px' }}>
              <i className="fa-solid fa-folder-plus"></i> Añadir Grupo
            </button>
          </div>

      {grupos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', opacity: 0.5, marginBottom: '12px' }}></i>
          <p>No hay grupos de trámites configurados.</p>
        </div>
      ) : (
        <div className="settings-grupos-list">
          {grupos.map((grupo, gIdx) => (
            <div key={gIdx} className="settings-grupo-card" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={grupo.nombre} 
                  onChange={(e) => handleChangeGrupoNombre(gIdx, e.target.value)}
                  style={{ flex: 1, fontWeight: 'bold', fontSize: '15px' }}
                  placeholder="Nombre del grupo..."
                />
                <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => handleRemoveGrupo(gIdx)} title="Eliminar grupo">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              <div className="settings-tramites-list" style={{ paddingLeft: '20px', borderLeft: '2px solid rgba(30,58,95,0.1)' }}>
                {grupo.tramites.map((tramite, tIdx) => (
                  <div key={tIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <i className="fa-solid fa-caret-right" style={{ color: 'var(--text-muted)', fontSize: '12px' }}></i>
                    <input 
                      type="text" 
                      className="glass-input" 
                      value={tramite} 
                      onChange={(e) => handleChangeTramite(gIdx, tIdx, e.target.value)}
                      style={{ flex: 1, fontSize: '14px', padding: '6px 12px' }}
                    />
                    <button className="icon-btn" style={{ color: 'var(--text-muted)' }} onClick={() => handleRemoveTramite(gIdx, tIdx)} title="Eliminar trámite">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
                
                <button 
                  className="btn-secondary" 
                  style={{ marginTop: '12px', fontSize: '12px', padding: '4px 10px', background: 'transparent', border: '1px dashed var(--primary)', color: 'var(--primary)' }}
                  onClick={() => handleAddTramite(gIdx)}
                >
                  <i className="fa-solid fa-plus"></i> Agregar Trámite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(30,58,95,0.1)', paddingTop: '20px', textAlign: 'right' }}>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> : <><i className="fa-solid fa-save"></i> Guardar Trámites</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
