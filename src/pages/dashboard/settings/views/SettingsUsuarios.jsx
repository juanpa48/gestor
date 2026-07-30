import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useActiveArea } from '../../../../shared/contexts/ActiveAreaContext';

import { apiClient } from '../../../../shared/services/api';
export const SettingsUsuarios = () => {
  const { currentUser } = useAuth();
  const { area: currentArea } = useActiveArea();
  const isAdmin = currentUser?.role === 'admin_ti';

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingUsername, setEditingUsername] = useState(null);

  // Form State
  const [nombreReal, setNombreReal] = useState('');
  const [username, setUsername] = useState('');
  const [cargo, setCargo] = useState('');
  const [cedula, setCedula] = useState('');
  const [celular, setCelular] = useState('');
  const [jefeInmediato, setJefeInmediato] = useState('');
  const [role, setRole] = useState('solicitante');
  const [area, setArea] = useState('');
  const [activeTab, setActiveTab] = useState('resolutores');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiClient('/usuarios');
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
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
      setCedula(user.cedula || '');
      setCelular(user.celular || '');
      setJefeInmediato(user.jefeInmediato || '');
      setRole(user.role || 'solicitante');
      setArea(user.area || '');
    } else {
      setEditingUsername(null);
      setNombreReal('');
      setUsername('');
      setCargo('');
      setCedula('');
      setCelular('');
      setJefeInmediato('');
      setRole('solicitante');
      setArea('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Nombre Real': 'Juan Perez',
      'Nombre de Usuario (Login)': 'juanperez',
      'Cargo': 'Analista de Datos',
      'Cédula': '100200300',
      'Celular': '3001234567',
      'Jefe Inmediato': 'Maria Gonzalez'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Usuarios");
    XLSX.writeFile(wb, "Plantilla_Usuarios.xlsx");
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

    try {
      if (editingUsername) {
        // Actualizar usuario existente
        const data = await apiClient(`/usuarios/${editingUsername}`, {
          method: 'PUT',
          body: JSON.stringify({
            nombreReal: nombreReal.trim(),
            cargo: cargo.trim() || ((role === 'solicitante') ? 'Empleado' : 'Gestor'),
            cedula: cedula.trim(),
            jefeInmediato: jefeInmediato.trim(),
            celular: celular.trim(),
            role: role,
            area: (role === 'solicitante') ? null : area,
            bloqueado: undefined
          })
        });
        
        if (data.success) {
          // Si el usuario editado es el mismo que está logueado, actualizar su sesión
          if (currentUser && currentUser.username === editingUsername) {
            const session = JSON.parse(localStorage.getItem('session_token'));
            if (session) {
              session.user.nombreReal = nombreReal.trim();
              session.user.cargo = cargo.trim();
              session.user.role = role;
              session.user.cedula = cedula.trim();
              session.user.jefeInmediato = jefeInmediato.trim();
              session.user.area = (role === 'solicitante') ? null : area;
              localStorage.setItem('session_token', JSON.stringify(session));
            }
          }
          showToast(`Usuario ${editingUsername} actualizado.`);
        } else {
          showToast(data.message || 'Error al actualizar', 'error');
        }
      } else {
        // Crear nuevo usuario
        const codigo = `U-${String(users.length + 1).padStart(2, '0')}`;
        const data = await apiClient('/usuarios', {
          method: 'POST',
          body: JSON.stringify({
            codigo,
            username: username.trim(),
            nombreReal: nombreReal.trim(),
            password: '12345',
            role: role,
            area: (role === 'solicitante') ? null : area,
            cedula: cedula.trim(),
            jefeInmediato: jefeInmediato.trim(),
            cargo: cargo.trim() || ((role === 'solicitante') ? 'Empleado' : 'Gestor'),
            celular: celular.trim()
          })
        });
        
        if (data.success) {
          showToast(`Usuario creado. Contraseña: 12345`);
        } else {
          showToast(data.message || 'Error al crear usuario', 'error');
          return;
        }
      }
      
      await loadUsers();
      closeModal();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        await processImportData(jsonData);
      } catch (error) {
        console.error("Error leyendo el archivo:", error);
        showToast("Error al leer el archivo. Asegúrate de que sea un Excel válido.", "error");
        setIsImporting(false);
      }
      e.target.value = null;
    };

    reader.onerror = () => {
      showToast("Hubo un problema leyendo el archivo.", "error");
      setIsImporting(false);
    };

    reader.readAsBinaryString(file);
  };

  const processImportData = async (jsonData) => {
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of jsonData) {
      const rowNombre = String(row['Nombre Real'] || row['Nombre'] || row['nombre'] || '');
      const rowUsername = String(row['Nombre de Usuario (Login)'] || row['Usuario'] || row['usuario'] || '');
      const rowCedula = String(row['Cédula'] || row['Cedula'] || row['cedula'] || '');
      const rowCargo = String(row['Cargo'] || row['cargo'] || 'Empleado');
      const rowCelular = String(row['Celular'] || row['celular'] || '');
      const rowJefe = String(row['Jefe Inmediato'] || row['Jefe'] || row['jefe'] || '');

      if (!rowNombre.trim() || !rowUsername.trim()) {
        skippedCount++;
        continue;
      }

      const codigo = `U-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const payload = {
        codigo,
        username: rowUsername.trim(),
        nombreReal: rowNombre.trim(),
        cargo: rowCargo.trim(),
        role: 'solicitante',
        area: null,
        password: '12345',
        cedula: rowCedula.trim(),
        celular: rowCelular.trim(),
        jefeInmediato: rowJefe.trim()
      };

      const res = await apiClient('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) importedCount++;
      else skippedCount++;
    }

    await loadUsers();
    setIsImporting(false);
    closeImportModal();
    showToast(`Importación completa: ${importedCount} agregados, ${skippedCount} omitidos/fallidos.`);
  };

  const handleToggleSuspendUser = async (username) => {
    try {
      const user = users.find(u => u.username === username);
      if (!user) return;
      
      await apiClient(`/usuarios/${username}`, {
        method: 'PUT',
        body: JSON.stringify({ bloqueado: !user.bloqueado })
      });
      
      await loadUsers();
      showToast(`Estado de ${username} actualizado.`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${username}?`)) {
      try {
        await apiClient(`/usuarios/${username}`, { method: 'DELETE' });
        await loadUsers();
        showToast(`Usuario ${username} eliminado.`);
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        showToast('Error de conexión', 'error');
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
      try {
        await apiClient(`/usuarios/${username}`, {
          method: 'PUT',
          body: JSON.stringify({ password: newPass, bloqueado: false })
        });
        await loadUsers();
        showToast(`Contraseña actualizada.`);
      } catch (error) {
        console.error('Error reseteando contraseña:', error);
        showToast('Error de conexión', 'error');
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setImportModalOpen(true)} style={{ padding: '8px 16px', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-import"></i> Importar Masivo
          </button>
          <button className="btn-primary" onClick={() => openModal()} style={{ padding: '8px 16px', fontSize: '14px' }}>
            <i className="fa-solid fa-user-plus"></i> Nuevo Usuario
          </button>
        </div>
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
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--navy)' }}>{u.nombreReal || '-'}</div>
                    {u.cedula && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}><i className="fa-regular fa-id-card"></i> {u.cedula}</div>}
                  </td>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Cédula</label>
                  <input type="text" className="glass-input" value={cedula} onChange={e => setCedula(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Celular</label>
                  <input type="text" className="glass-input" value={celular} onChange={e => setCelular(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Jefe Inmediato</label>
                <input type="text" className="glass-input" value={jefeInmediato} onChange={e => setJefeInmediato(e.target.value)} />
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

      {/* --- MODAL DE IMPORTACIÓN MASIVA --- */}
      {importModalOpen && (
        <div className="modal-overlay active" onClick={closeImportModal}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--navy)' }}><i className="fa-solid fa-file-import"></i> Importar Empleados</h3>
              <button className="modal-close" onClick={closeImportModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                Descarga la plantilla oficial, rellénala y súbela aquí para registrar usuarios masivamente.
              </p>
              
              <button 
                type="button" 
                onClick={downloadTemplate} 
                className="btn-primary" 
                style={{ width: '100%', marginBottom: '20px', background: '#3b82f6', borderColor: '#2563eb', padding: '10px' }}
              >
                <i className="fa-solid fa-download"></i> Descargar Plantilla Base
              </button>

              <div style={{ border: '2px dashed var(--card-border)', padding: '20px', borderRadius: '8px', background: 'rgba(255,255,255,0.5)' }}>
                <i className="fa-solid fa-upload" style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '10px' }}></i>
                <p style={{ fontWeight: '500', marginBottom: '10px' }}>Sube tu plantilla completa (.xlsx)</p>
                <input 
                  type="file" 
                  accept=".xlsx, .csv" 
                  style={{ width: '100%' }}
                  disabled={isImporting}
                  onChange={handleFileUpload}
                />
              </div>

              {isImporting && (
                <div style={{ marginTop: '15px', color: '#10b981', fontWeight: 'bold' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Importando al servidor...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
