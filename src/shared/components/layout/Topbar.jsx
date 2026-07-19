import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveArea } from '../../contexts/ActiveAreaContext';

export const Topbar = () => {
  const { logout, currentUser, changePassword } = useAuth();
  const { area } = useActiveArea();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Password modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [loadingPass, setLoadingPass] = useState(false);

  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showSearch = location.pathname.includes('/actividades') || location.pathname.includes('/gestion');

  const handleSearch = (e) => {
    const value = e.target.value;
    // Disparamos el evento para mantener compatibilidad con cualquier listener actual/futuro
    document.dispatchEvent(new CustomEvent('searchTriggered', { detail: { query: value } }));
  };

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passData.new !== passData.confirm) {
      return setPassMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
    }
    if (passData.new.length < 5) {
      return setPassMsg({ type: 'error', text: 'La contraseña debe tener al menos 5 caracteres.' });
    }

    setLoadingPass(true);
    const res = await changePassword(passData.old, passData.new);
    setLoadingPass(false);

    if (res.success) {
      setPassMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPassData({ old: '', new: '', confirm: '' });
        setPassMsg({ type: '', text: '' });
      }, 2000);
    } else {
      setPassMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <header className="topbar">
      <div className="search-wrapper" style={{ display: showSearch ? 'block' : 'none' }}>
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input 
          type="text" 
          className="search-input" 
          id="searchInput" 
          placeholder="Buscar..." 
          onChange={handleSearch}
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" title="Configuración" onClick={() => navigate(`/dashboard/${area}/settings`)}>
          <i className="fa-solid fa-gear"></i>
        </button>
        
        <NotificationCenter />
        
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button 
            className={`icon-btn ${isProfileOpen ? 'active' : ''}`} 
            title="Perfil" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <i className="fa-solid fa-user"></i>
          </button>
          
          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <span className="profile-name">{currentUser?.username || 'Usuario'}</span>
                <span className="profile-role">{currentUser?.role === 'admin_ti' ? 'Admin TI' : 'Gestora'}</span>
              </div>
              <div className="profile-dropdown-divider"></div>
              <button 
                className="profile-dropdown-item" 
                onClick={() => { setIsProfileOpen(false); setIsPasswordModalOpen(true); }}
              >
                <i className="fa-solid fa-key"></i>
                Cambiar Contraseña
              </button>
              <button className="profile-dropdown-item text-danger" onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="modal-overlay active" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div>
                <div className="kanban-title-large"><i className="fa-solid fa-lock"></i> Cambiar Contraseña</div>
              </div>
              <button type="button" className="modal-close" onClick={() => setIsPasswordModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleChangePasswordSubmit} style={{ padding: '20px 0 0 0' }}>
              {passMsg.text && (
                <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: passMsg.type === 'error' ? '#fee2e2' : '#dcfce7', color: passMsg.type === 'error' ? '#ef4444' : '#22c55e', fontSize: '13px' }}>
                  <i className={`fa-solid ${passMsg.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i> {passMsg.text}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Contraseña Actual</label>
                <input type="password" required className="form-input form-input-full" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <input type="password" required className="form-input form-input-full" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input type="password" required className="form-input form-input-full" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} />
              </div>
              <div className="form-actions form-actions-mt">
                <button type="button" className="btn-cancel" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={loadingPass}>
                  {loadingPass ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
