import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Inicializar base de datos de usuarios si no existe
  const initUsersDB = async () => {
    let users = JSON.parse(localStorage.getItem('db_usuarios'));
    if (!users) {
      // Cuentas fundacionales por defecto
      const adminHash = await hashPassword('admin123');
      const geHash = await hashPassword('ge123');
      const ghHash = await hashPassword('gh123');
      const tiHash = await hashPassword('ti123');

      users = [
        { id: 'U-01', username: 'admin_ti', passwordHash: adminHash, role: 'admin_ti', area: 'ti', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-02', username: 'gestor_ge', passwordHash: geHash, role: 'gestor', area: 'ge', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-03', username: 'gestor_gh', passwordHash: ghHash, role: 'gestor', area: 'gh', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-04', username: 'gestor_ti', passwordHash: tiHash, role: 'gestor', area: 'ti', bloqueado: false, intentosFallidos: 0 }
      ];
      localStorage.setItem('db_usuarios', JSON.stringify(users));
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await initUsersDB();
      
      // Chequear sesión activa
      const session = JSON.parse(localStorage.getItem('session_token'));
      if (session) {
        if (Date.now() > session.expiresAt) {
          // Sesión expirada
          localStorage.removeItem('session_token');
          setCurrentUser(null);
        } else {
          setCurrentUser(session.user);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const users = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const user = users[userIndex];

    if (user.bloqueado) {
      return { success: false, message: 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al Admin de TI.' };
    }

    const providedHash = await hashPassword(password);

    if (providedHash !== user.passwordHash) {
      user.intentosFallidos = (user.intentosFallidos || 0) + 1;
      let msg = 'Contraseña incorrecta.';
      
      if (user.intentosFallidos >= 4) {
        user.bloqueado = true;
        msg = 'Cuenta bloqueada por superar el límite de 4 intentos fallidos.';
      } else {
        msg += ` Te quedan ${4 - user.intentosFallidos} intento(s).`;
      }

      users[userIndex] = user;
      localStorage.setItem('db_usuarios', JSON.stringify(users));
      return { success: false, message: msg };
    }

    // Si todo está bien, reiniciamos intentos
    user.intentosFallidos = 0;
    users[userIndex] = user;
    localStorage.setItem('db_usuarios', JSON.stringify(users));

    // Crear sesión (8 horas)
    const token = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        area: user.area
      },
      expiresAt: Date.now() + (8 * 60 * 60 * 1000)
    };

    localStorage.setItem('session_token', JSON.stringify(token));
    setCurrentUser(token.user);
    return { success: true, user: token.user };
  };

  const logout = useCallback(() => {
    localStorage.removeItem('session_token');
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
