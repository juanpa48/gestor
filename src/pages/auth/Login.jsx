import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ya no usamos el `from` porque forzamos la redirección a SU área.
  // const from = location.state?.from?.pathname || '/dashboard/ti';

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
      // Forzar al usuario a ir a SU área, ignorando de dónde venía
      navigate(`/dashboard/${result.user.area}`, { replace: true });
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
          <h1>Portal Administrativo</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="login-input-wrapper">
              <input 
                type="text" 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: admin_ti"
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
            {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <Link to="/portal" className="back-to-portal">
          <i className="fa-solid fa-arrow-left"></i>
          Volver al Portal de Colaboradores
        </Link>
      </div>
    </div>
  );
};
