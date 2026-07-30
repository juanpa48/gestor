import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Using session_token as local cache since the backend returns a flat user object.
      const session = JSON.parse(localStorage.getItem('session_token'));
      if (session) {
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem('session_token');
          setCurrentUser(null);
        } else {
          try {
            const users = await apiClient('/usuarios');
            const freshUser = users.find(u => u.username === session.user.username);
            
            if (freshUser) {
              const userData = {
                id: freshUser.id,
                username: freshUser.username,
                nombreReal: freshUser.nombreReal,
                role: freshUser.role,
                area: freshUser.area,
                cargo: freshUser.cargo || ''
              };
              setCurrentUser(userData);
              localStorage.setItem('session_token', JSON.stringify({
                ...session,
                user: userData
              }));
            } else {
              setCurrentUser(session.user);
            }
          } catch (error) {
            console.warn('Servidor no disponible, usando sesión local:', error);
            setCurrentUser(session.user);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (!data.success) {
        return { success: false, message: data.message };
      }
      
      const token = {
        user: data.user,
        expiresAt: Date.now() + (8 * 60 * 60 * 1000)
      };
      
      localStorage.setItem('session_token', JSON.stringify(token));
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión con el servidor. ¿Está encendido el backend?' };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('session_token');
    setCurrentUser(null);
  }, []);

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) return { success: false, message: 'No hay sesión activa.' };

    try {
      return await apiClient('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          username: currentUser.username,
          oldPassword,
          newPassword
        })
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
