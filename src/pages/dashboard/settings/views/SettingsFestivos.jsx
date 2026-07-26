import React, { useState, useEffect } from 'react';
import { DbService } from '../../../../shared/services/DbService';

export const SettingsFestivos = () => {
  const [festivos, setFestivos] = useState([]);
  const [newFestivoFecha, setNewFestivoFecha] = useState('');
  const [newFestivoNombre, setNewFestivoNombre] = useState('');

  useEffect(() => {
    DbService.getFestivos().then(f => setFestivos(f));
  }, []);

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

  const handleAddFestivo = () => {
    if (!newFestivoFecha || !newFestivoNombre) {
      alert("Por favor ingresa fecha y nombre del festivo");
      return;
    }
    const newFestivos = [...festivos, { fecha: newFestivoFecha, nombre: newFestivoNombre }];
    setFestivos(newFestivos);
    DbService.saveFestivos(newFestivos);
    setNewFestivoFecha('');
    setNewFestivoNombre('');
    showToast('Festivo guardado exitosamente');
  };

  const handleRemoveFestivo = (idx) => {
    if (window.confirm("¿Eliminar este día festivo?")) {
      const newF = [...festivos];
      newF.splice(idx, 1);
      setFestivos(newF);
      DbService.saveFestivos(newF);
      showToast('Festivo eliminado exitosamente');
    }
  };

  return (
    <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
          <i className="fa-solid fa-calendar-day"></i> Días Festivos (Global)
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="date" 
          className="glass-input" 
          value={newFestivoFecha}
          onChange={(e) => setNewFestivoFecha(e.target.value)}
        />
        <input 
          type="text" 
          className="glass-input" 
          placeholder="Nombre del Festivo (Ej. Día de la Independencia)"
          value={newFestivoNombre}
          onChange={(e) => setNewFestivoNombre(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={handleAddFestivo} style={{ padding: '8px 16px' }}>
          <i className="fa-solid fa-plus"></i> Agregar
        </button>
      </div>

      {festivos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
          No hay días festivos registrados.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {festivos.sort((a,b) => new Date(a.fecha) - new Date(b.fecha)).map((f, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '14px' }}>{f.fecha}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.nombre}</span>
              </div>
              <button onClick={() => handleRemoveFestivo(idx)} className="btn-icon danger" title="Eliminar festivo" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
