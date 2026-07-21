import React, { useState, useEffect } from 'react';
import { getAreaSettings, saveAreaSettings } from '../../shared/services/SettingsManager';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';
import { useAuth, hashPassword } from '../../shared/contexts/AuthContext';

export const Settings = () => {
  const { area, config } = useActiveArea();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin_ti';

  const [grupos, setGrupos] = useState([]);
  const [slas, setSlas] = useState({ Urgente: 2, Alta: 8, Media: 24, Baja: 48 });
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Nuevo estado para Creación de Usuarios
  const [newSoliNombreReal, setNewSoliNombreReal] = useState('');
  const [newSoliUsername, setNewSoliUsername] = useState('');
  const [newSoliCargo, setNewSoliCargo] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('solicitante');
  const [newEmpArea, setNewEmpArea] = useState('');
  
  const [editingUsername, setEditingUsername] = useState(null);

  useEffect(() => {
    const settings = getAreaSettings(area);
    setGrupos(settings.grupos || []);
    if (settings.slas) setSlas(settings.slas);
    
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
    saveAreaSettings(area, grupos, slas);
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

  const handleToggleSuspendUser = (username) => {
    const db = [...users];
    const userIndex = db.findIndex(u => u.username === username);
    if (userIndex !== -1) {
      db[userIndex].bloqueado = !db[userIndex].bloqueado;
      db[userIndex].intentosFallidos = 0; // Reset intentos al cambiar estado
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Estado de ${username} actualizado.`);
    }
  };

  const handleDeleteUser = (username) => {
    if (window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE al usuario ${username}? Esto podría causar errores si ya tiene tickets asignados.`)) {
      const db = users.filter(u => u.username !== username);
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Usuario ${username} eliminado de la base de datos.`);
    }
  };

  const handleEditClick = (user) => {
    setEditingUsername(user.username);
    setNewSoliNombreReal(user.nombreReal);
    setNewSoliUsername(user.username);
    setNewSoliCargo(user.cargo);
    setNewEmpRole(user.role);
    setNewEmpArea(user.area || '');
    // Hacer scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingUsername(null);
    setNewSoliNombreReal('');
    setNewSoliUsername('');
    setNewSoliCargo('');
    setNewEmpRole('solicitante');
    setNewEmpArea('');
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

  const handleSaveUser = async () => {
    if (!newSoliNombreReal.trim() || !newSoliUsername.trim()) {
      window.alert('El nombre real y el nombre de usuario son obligatorios.');
      return;
    }
    const db = [...users];
    
    if ((newEmpRole === 'gestor' || newEmpRole === 'admin_ti') && !newEmpArea) {
      window.alert('Debes asignar un área obligatoriamente para los Gestores y Administradores.');
      return;
    }

    if (editingUsername) {
      const userIndex = db.findIndex(u => u.username === editingUsername);
      if (userIndex !== -1) {
        db[userIndex].nombreReal = newSoliNombreReal.trim();
        db[userIndex].cargo = newSoliCargo.trim() || ((newEmpRole === 'solicitante') ? 'Empleado' : 'Gestor');
        db[userIndex].role = newEmpRole;
        db[userIndex].area = (newEmpRole === 'solicitante') ? null : newEmpArea;
        
        localStorage.setItem('db_usuarios', JSON.stringify(db));
        setUsers(db);
        showToast(`Usuario ${editingUsername} actualizado correctamente.`);
        cancelEdit();
      }
    } else {
      if (db.some(u => u.username === newSoliUsername.trim())) {
        window.alert('Este nombre de usuario ya existe.');
        return;
      }

      const empHash = await hashPassword('12345');
      const newUser = {
        id: `U-${String(db.length + 1).padStart(2, '0')}`,
        username: newSoliUsername.trim(),
        nombreReal: newSoliNombreReal.trim(),
        passwordHash: empHash,
        role: newEmpRole,
        area: (newEmpRole === 'solicitante') ? null : newEmpArea,
        cargo: newSoliCargo.trim() || ((newEmpRole === 'solicitante') ? 'Empleado' : 'Gestor'),
        bloqueado: false,
        intentosFallidos: 0
      };
      db.push(newUser);
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Usuario ${newUser.nombreReal} creado. Contraseña por defecto: 12345`);
      cancelEdit();
    }
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

      <div className="settings-container glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
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
                          style={{ padding: '6px 12px', fontSize: '12px', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                          onClick={() => handleEditClick(u)}
                          title="Editar Usuario"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', opacity: 1, color: u.bloqueado ? '#10b981' : '#f59e0b', border: '1px solid ' + (u.bloqueado ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)') }} 
                          onClick={() => handleToggleSuspendUser(u.username)}
                          title={u.bloqueado ? "Activar (Desbloquear)" : "Suspender (Soft Delete)"}
                        >
                          <i className={`fa-solid ${u.bloqueado ? 'fa-unlock' : 'fa-ban'}`}></i>
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                          onClick={() => handleDeleteUser(u.username)}
                          title="Eliminar Permanentemente"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#3b82f6' }}
                          onClick={() => handleResetPassword(u.username)}
                          title="Restablecer Clave a 12345"
                        >
                          <i className="fa-solid fa-key"></i>
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
                <i className="fa-solid fa-id-card-clip"></i> {editingUsername ? `Editando usuario: ${editingUsername}` : 'Cuentas de Usuarios (Crear / Editar)'}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" className="glass-input" placeholder="Nombre Completo" value={newSoliNombreReal} onChange={e => setNewSoliNombreReal(e.target.value)} />
              <input type="text" className="glass-input" placeholder="Nombre de Usuario (Login)" value={newSoliUsername} onChange={e => setNewSoliUsername(e.target.value)} disabled={!!editingUsername} />
              <input type="text" className="glass-input" placeholder="Cargo (ej: Contador)" value={newSoliCargo} onChange={e => setNewSoliCargo(e.target.value)} />
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
              {editingUsername ? (
                <>
                  <button className="btn-primary" onClick={handleSaveUser} style={{ background: '#10b981' }}><i className="fa-solid fa-save"></i> Actualizar</button>
                  <button className="btn-secondary" onClick={cancelEdit}><i className="fa-solid fa-xmark"></i> Cancelar</button>
                </>
              ) : (
                <button className="btn-secondary" onClick={handleSaveUser}><i className="fa-solid fa-plus"></i> Añadir Usuario</button>
              )}
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
                          style={{ padding: '6px 12px', fontSize: '12px', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                          onClick={() => handleEditClick(u)}
                          title="Editar Usuario"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', opacity: 1, color: u.bloqueado ? '#10b981' : '#f59e0b', border: '1px solid ' + (u.bloqueado ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)') }} 
                          onClick={() => handleToggleSuspendUser(u.username)}
                          title={u.bloqueado ? "Activar (Desbloquear)" : "Suspender (Soft Delete)"}
                        >
                          <i className={`fa-solid ${u.bloqueado ? 'fa-unlock' : 'fa-ban'}`}></i>
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                          onClick={() => handleDeleteUser(u.username)}
                          title="Eliminar Permanentemente"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#3b82f6' }}
                          onClick={() => handleResetPassword(u.username)}
                          title="Restablecer Clave a 12345"
                        >
                          <i className="fa-solid fa-key"></i>
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
