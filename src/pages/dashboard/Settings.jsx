import React, { useState, useEffect } from 'react';
import { getAreaSettings, saveAreaSettings } from '../../shared/services/SettingsManager';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { useAuth, hashPassword } from '../../shared/contexts/AuthContext';

export const Settings = () => {
  const { area, config } = useActiveArea();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin_ti';

  const [grupos, setGrupos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Nuevo estado para Creación de Usuarios
  const [newEmpNombreReal, setNewEmpNombreReal] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpCargo, setNewEmpCargo] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('solicitante');
  const [newEmpArea, setNewEmpArea] = useState('');

  useEffect(() => {
    const settings = getAreaSettings(area);
    setGrupos(settings.grupos || []);
    
    if (isAdmin) {
      loadUsers();
    }
  }, [area, isAdmin]);

  const loadUsers = () => {
    const db = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
    setUsers(db);
  };

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
    saveAreaSettings(area, grupos);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Configuración guardada exitosamente');
    }, 400);
  };

  const handleUnlockUser = (username) => {
    if (window.confirm(`¿Estás seguro de desbloquear la cuenta de ${username}?`)) {
      const db = [...users];
      const user = db.find(u => u.username === username);
      if (user) {
        user.bloqueado = false;
        user.intentosFallidos = 0;
        localStorage.setItem('db_usuarios', JSON.stringify(db));
        setUsers(db);
        showToast(`Cuenta de ${username} desbloqueada exitosamente.`);
      }
    }
  };

  const handleResetPassword = async (username) => {
    const newPass = window.prompt(`Ingresa la nueva contraseña para ${username}:`);
    if (newPass) {
      if (newPass.length < 5) {
        window.alert('La contraseña debe tener al menos 5 caracteres.');
        return;
      }
      const hashed = await hashPassword(newPass);
      const db = [...users];
      const user = db.find(u => u.username === username);
      if (user) {
        user.passwordHash = hashed;
        user.bloqueado = false;
        user.intentosFallidos = 0;
        localStorage.setItem('db_usuarios', JSON.stringify(db));
        setUsers(db);
        showToast(`Contraseña de ${username} actualizada exitosamente.`);
      }
    }
  };

  const handleAddSolicitante = async () => {
    if (!newEmpNombreReal.trim() || !newEmpUsername.trim()) {
      window.alert('El nombre real y el nombre de usuario son obligatorios.');
      return;
    }
    const db = [...users];
    if (db.some(u => u.username === newEmpUsername.trim())) {
      window.alert('Este usuario ya existe.');
      return;
    }
    if ((newEmpRole === 'gestor' || newEmpRole === 'admin_ti') && !newEmpArea) {
      window.alert('Debes asignar un área obligatoriamente para los Gestores y Administradores.');
      return;
    }

    const empHash = await hashPassword('12345');
    const newUser = {
      id: `U-${String(db.length + 1).padStart(2, '0')}`,
      username: newEmpUsername.trim(),
      nombreReal: newEmpNombreReal.trim(),
      passwordHash: empHash,
      role: newEmpRole,
      area: (newEmpRole === 'solicitante') ? null : newEmpArea,
      cargo: newEmpCargo.trim() || ((newEmpRole === 'solicitante') ? 'Empleado' : 'Gestor'),
      bloqueado: false,
      intentosFallidos: 0
    };
    db.push(newUser);
    localStorage.setItem('db_usuarios', JSON.stringify(db));
    setUsers(db);
    setNewEmpNombreReal('');
    setNewEmpUsername('');
    setNewEmpCargo('');
    setNewEmpRole('solicitante');
    setNewEmpArea('');
    showToast(`Usuario ${newUser.nombreReal} creado. Contraseña por defecto: 12345`);
  };

  return (
    <div className="page-content fade-in" style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title"><i className="fa-solid fa-gear" style={{ color: config.color }}></i> Panel de Ajustes</h1>
          <p className="page-subtitle">Gestiona la configuración de {config.nombre}</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={isSaving} style={{ background: config.color }}>
          {isSaving ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</>
          ) : (
            <><i className="fa-solid fa-floppy-disk"></i> Guardar Cambios</>
          )}
        </button>
      </div>

      <div className="settings-container glass-panel" style={{ padding: '24px' }}>
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
                        style={{ flex: 1, padding: '8px 12px', fontSize: '13.5px' }}
                        placeholder="Nombre del trámite..."
                      />
                      <button className="icon-btn" onClick={() => handleRemoveTramite(gIdx, tIdx)} style={{ color: 'var(--text-muted)', transform: 'scale(0.85)' }} title="Eliminar trámite">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                  <button className="btn-link" onClick={() => handleAddTramite(gIdx)} style={{ marginTop: '8px', fontSize: '13px', color: config.color, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-plus"></i> Añadir trámite a {grupo.nombre || 'este grupo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          {/* Tabla Resolutores */}
          <div className="settings-container glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
                <i className="fa-solid fa-users-gear"></i> Gestión de Resolutores (Gestores y Admin)
              </h2>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(30,58,95,0.1)' }}>
                    <th style={{ padding: '12px' }}>Nombre Real</th>
                    <th style={{ padding: '12px' }}>Usuario (Login)</th>
                    <th style={{ padding: '12px' }}>Rol</th>
                    <th style={{ padding: '12px' }}>Estado</th>
                    <th style={{ padding: '12px' }}>Intentos</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'solicitante').map(u => (
                    <tr key={u.username} style={{ borderBottom: '1px solid rgba(30,58,95,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.nombreReal || '-'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.username}</td>
                      <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{u.role.toUpperCase()}</span></td>
                      <td style={{ padding: '12px' }}>
                        {u.bloqueado ? (
                          <span style={{ color: 'var(--red)', fontWeight: 'bold' }}><i className="fa-solid fa-lock"></i> Bloqueado</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-check-circle" style={{ color: '#10b981' }}></i> Activo</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>{u.intentosFallidos} / 4</td>
                      <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', opacity: u.bloqueado ? 1 : 0.5 }} 
                          disabled={!u.bloqueado}
                          onClick={() => handleUnlockUser(u.username)}
                        >
                          <i className="fa-solid fa-unlock"></i> Desbloquear
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#3b82f6' }}
                          onClick={() => handleResetPassword(u.username)}
                        >
                          <i className="fa-solid fa-key"></i> Restablecer Clave
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla Empleados / Solicitantes */}
          <div className="settings-container glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
                <i className="fa-solid fa-id-card-clip"></i> Cuentas de Empleados (Portal) / Crear Usuario
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" className="glass-input" placeholder="Nombre Completo" value={newEmpNombreReal} onChange={e => setNewEmpNombreReal(e.target.value)} />
              <input type="text" className="glass-input" placeholder="Nombre de Usuario (Login)" value={newEmpUsername} onChange={e => setNewEmpUsername(e.target.value)} />
              <input type="text" className="glass-input" placeholder="Cargo (ej: Contador)" value={newEmpCargo} onChange={e => setNewEmpCargo(e.target.value)} />
              <select className="glass-input" value={newEmpRole} onChange={e => setNewEmpRole(e.target.value)} style={{ padding: '8px 12px' }}>
                <option value="solicitante">Rol: Solicitante (Portal)</option>
                <option value="gestor">Rol: Gestor de Área (Dashboard)</option>
                <option value="admin_ti">Rol: Admin TI</option>
              </select>
              {(newEmpRole === 'gestor' || newEmpRole === 'admin_ti') && (
                <select className="glass-input" value={newEmpArea} onChange={e => setNewEmpArea(e.target.value)} style={{ padding: '8px 12px' }}>
                  <option value="">-- Asignar Área --</option>
                  <option value="ti">Soporte TI</option>
                  <option value="ge">Gestión Empresarial</option>
                  <option value="gh">Gestión Humana</option>
                </select>
              )}
              <button className="btn-secondary" onClick={handleAddSolicitante}><i className="fa-solid fa-plus"></i> Añadir Usuario</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(30,58,95,0.1)' }}>
                    <th style={{ padding: '12px' }}>Nombre Real</th>
                    <th style={{ padding: '12px' }}>Usuario (Login)</th>
                    <th style={{ padding: '12px' }}>Cargo</th>
                    <th style={{ padding: '12px' }}>Estado</th>
                    <th style={{ padding: '12px' }}>Intentos</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'solicitante').map(u => (
                    <tr key={u.username} style={{ borderBottom: '1px solid rgba(30,58,95,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.nombreReal || '-'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.username}</td>
                      <td style={{ padding: '12px' }}>{u.cargo}</td>
                      <td style={{ padding: '12px' }}>
                        {u.bloqueado ? (
                          <span style={{ color: 'var(--red)', fontWeight: 'bold' }}><i className="fa-solid fa-lock"></i> Bloqueado</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-check-circle" style={{ color: '#10b981' }}></i> Activo</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>{u.intentosFallidos} / 4</td>
                      <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', opacity: u.bloqueado ? 1 : 0.5 }} 
                          disabled={!u.bloqueado}
                          onClick={() => handleUnlockUser(u.username)}
                        >
                          <i className="fa-solid fa-unlock"></i> Desbloquear
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#3b82f6' }}
                          onClick={() => handleResetPassword(u.username)}
                        >
                          <i className="fa-solid fa-key"></i> Restablecer Clave
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.role === 'solicitante').length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay empleados registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
