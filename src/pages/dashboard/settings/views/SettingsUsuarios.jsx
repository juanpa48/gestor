import React, { useState, useEffect } from 'react';
import { hashPassword, useAuth } from '../../../../shared/contexts/AuthContext';
import { useActiveArea } from '../../../../shared/contexts/ActiveAreaContext';

export const SettingsUsuarios = () => {
  const { currentUser } = useAuth();
  const { area: currentArea } = useActiveArea();
  const isAdmin = currentUser?.role === 'admin_ti';

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState(null);

  // Form State
  const [nombreReal, setNombreReal] = useState('');
  const [username, setUsername] = useState('');
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState('solicitante');
  const [area, setArea] = useState('');
  const [activeTab, setActiveTab] = useState('resolutores'); // resolutores | solicitantes

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const db = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
    setUsers(db);
  };

  if (!isAdmin || currentArea !== 'ti') {
    return (
      <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--red)', marginBottom: '16px' }}><i className="fa-solid fa-shield-halved"></i> Acceso Denegado</h2>
        <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para gestionar usuarios o no te encuentras en el área de Soporte TI.</p>
      </div>
    );
  }

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'triangle-exclamation'}"></i> &nbsp;${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUsername(user.username);
      setNombreReal(user.nombreReal || '');
      setUsername(user.username);
      setCargo(user.cargo || '');
      setRole(user.role || 'solicitante');
      setArea(user.area || '');
    } else {
      setEditingUsername(null);
      setNombreReal('');
      setUsername('');
      setCargo('');
      setRole('solicitante');
      setArea('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!nombreReal.trim() || !username.trim()) {
      showToast('Nombre y usuario son obligatorios', 'error');
      return;
    }
    if ((role === 'gestor' || role === 'admin_ti') && !area) {
      showToast('Debes asignar un área obligatoriamente para Gestores y Admins.', 'error');
      return;
    }

    const db = [...users];

    if (editingUsername) {
      const userIndex = db.findIndex(u => u.username === editingUsername);
      if (userIndex !== -1) {
        db[userIndex].nombreReal = nombreReal.trim();
        db[userIndex].cargo = cargo.trim() || ((role === 'solicitante') ? 'Empleado' : 'Gestor');
        db[userIndex].role = role;
        db[userIndex].area = (role === 'solicitante') ? null : area;
        
        localStorage.setItem('db_usuarios', JSON.stringify(db));
        setUsers(db);
        showToast(`Usuario ${editingUsername} actualizado.`);
        closeModal();
      }
    } else {
      if (db.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        showToast('El nombre de usuario ya existe.', 'error');
        return;
      }

      const empHash = await hashPassword('12345');
      const newUser = {
        id: `U-${String(db.length + 1).padStart(2, '0')}`,
        username: username.trim(),
        nombreReal: nombreReal.trim(),
        passwordHash: empHash,
        role: role,
        area: (role === 'solicitante') ? null : area,
        cargo: cargo.trim() || ((role === 'solicitante') ? 'Empleado' : 'Gestor'),
        bloqueado: false,
        intentosFallidos: 0
      };
      db.push(newUser);
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Usuario creado. Contraseña: 12345`);
      closeModal();
    }
  };

  const handleToggleSuspendUser = (username) => {
    const db = [...users];
    const userIndex = db.findIndex(u => u.username === username);
    if (userIndex !== -1) {
      db[userIndex].bloqueado = !db[userIndex].bloqueado;
      db[userIndex].intentosFallidos = 0;
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Estado de ${username} actualizado.`);
    }
  };

  const handleDeleteUser = (username) => {
    if (window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${username}?`)) {
      const db = users.filter(u => u.username !== username);
      localStorage.setItem('db_usuarios', JSON.stringify(db));
      setUsers(db);
      showToast(`Usuario ${username} eliminado.`);
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
        showToast(`Contraseña actualizada.`);
      }
    }
  };

  const displayedUsers = activeTab === 'resolutores' 
    ? users.filter(u => u.role !== 'solicitante') 
    : users.filter(u => u.role === 'solicitante');

  return (
    <div className="settings-container glass-panel" style={{ padding: '24px', margin: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,58,95,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>
          <i className="fa-solid fa-users-gear"></i> Gestión de Usuarios
        </h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ padding: '8px 16px', fontSize: '14px' }}>
          <i className="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <div className="db-tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`db-tab-btn ${activeTab === 'resolutores' ? 'active' : ''}`} 
          onClick={() => setActiveTab('resolutores')}
        >
          Gestores y Admins ({users.filter(u => u.role !== 'solicitante').length})
        </button>
        <button 
          className={`db-tab-btn ${activeTab === 'solicitantes' ? 'active' : ''}`} 
          onClick={() => setActiveTab('solicitantes')}
        >
          Empleados ({users.filter(u => u.role === 'solicitante').length})
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(30,58,95,0.1)' }}>
              <th style={{ padding: '16px' }}>Nombre Real</th>
              <th style={{ padding: '16px' }}>Usuario</th>
              <th style={{ padding: '16px' }}>Rol / Área</th>
              <th style={{ padding: '16px' }}>Estado</th>
              <th style={{ padding: '16px' }}>Intentos</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay usuarios en esta categoría.
                </td>
              </tr>
            ) : (
              displayedUsers.map(u => (
                <tr key={u.username} style={{ borderBottom: '1px solid rgba(30,58,95,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px', fontWeight: '600', color: 'var(--navy)' }}>{u.nombreReal || '-'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{u.username}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'block', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content' }}>
                      {u.role.toUpperCase()} {u.area ? `(${u.area.toUpperCase()})` : ''}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {u.bloqueado ? (
                      <span style={{ color: 'var(--red)', fontWeight: 'bold' }}><i className="fa-solid fa-lock"></i> Bloqueado</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-check-circle" style={{ color: '#10b981' }}></i> Activo</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>{u.intentosFallidos} / 4</td>
                  <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                      onClick={() => openModal(u)}
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
                      title="Restablecer Clave"
                    >
                      <i className="fa-solid fa-key"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE USUARIO */}
      {modalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--navy)' }}>
                {editingUsername ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleSaveUser} style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nombre Real *</label>
                <input type="text" className="glass-input" required value={nombreReal} onChange={e => setNombreReal(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nombre de Usuario (Login) *</label>
                <input type="text" className="glass-input" required value={username} onChange={e => setUsername(e.target.value)} disabled={!!editingUsername} />
              </div>

              <div className="form-group">
                <label className="form-label">Cargo (Ej: Analista)</label>
                <input type="text" className="glass-input" value={cargo} onChange={e => setCargo(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Rol en el Sistema *</label>
                <select className="glass-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="solicitante">Empleado (Solo Portal)</option>
                  <option value="gestor">Gestor (Dashboard)</option>
                  <option value="admin_ti">Administrador TI (Full Access)</option>
                </select>
              </div>

              {(role === 'gestor' || role === 'admin_ti') && (
                <div className="form-group">
                  <label className="form-label">Área de Gestión *</label>
                  <select className="glass-input" value={area} onChange={e => setArea(e.target.value)} required>
                    <option value="" disabled>-- Asignar Área --</option>
                    <option value="ti">Soporte TI</option>
                    <option value="ge">Gestión Empresarial</option>
                    <option value="gh">Gestión Humana</option>
                  </select>
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '30px' }}>
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save">
                  <i className="fa-solid fa-save"></i> Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
