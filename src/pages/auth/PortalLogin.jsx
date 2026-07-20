import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

export const PortalLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.className = 'portal';
    return () => { document.body.className = ''; };
  }, []);

  const from = location.state?.from?.pathname || '/portal';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setIsSubmitting(true);
    
    // Pequeño delay para simular red y dar feedback visual
    await new Promise(r => setTimeout(r, 600));

    const result = await login(username, password);

    if (result.success) {
      // Redirigir al portal de donde venía o al portal principal
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src="/img/acyt.png" alt="Logo de la Empresa" className="login-logo" />
          <h1>Acceso Colaboradores</h1>
          <p>Ingresa tus credenciales para crear una solicitud</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario (Colaborador)</label>
            <div className="login-input-wrapper">
              <input 
                type="text" 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: empleado1"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="login-input-wrapper">
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Verificando...' : 'Entrar al Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
