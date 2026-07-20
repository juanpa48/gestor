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
      const empHash = await hashPassword('emp123');

      users = [
        { id: 'U-01', username: 'admin_ti', nombreReal: 'Administrador TI', passwordHash: adminHash, role: 'admin_ti', area: 'ti', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-02', username: 'gestor_ge', nombreReal: 'Gestor Empresarial', passwordHash: geHash, role: 'gestor', area: 'ge', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-03', username: 'gestor_gh', nombreReal: 'Gestor de RRHH', passwordHash: ghHash, role: 'gestor', area: 'gh', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-04', username: 'gestor_ti', nombreReal: 'Soporte TI Nivel 1', passwordHash: tiHash, role: 'gestor', area: 'ti', bloqueado: false, intentosFallidos: 0 },
        { id: 'U-05', username: 'empleado1', nombreReal: 'Juan Pérez', passwordHash: empHash, role: 'solicitante', cargo: 'Auxiliar Contable', bloqueado: false, intentosFallidos: 0 }
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
      if (user.bloqueadoHasta) {
        const ahora = Date.now();
        if (ahora < user.bloqueadoHasta) {
          const minRestantes = Math.ceil((user.bloqueadoHasta - ahora) / 60000);
          return { success: false, message: `Cuenta bloqueada. Intente de nuevo en ${minRestantes} minuto(s).` };
        } else {
          // El tiempo expiró, desbloquear
          user.bloqueado = false;
          user.bloqueadoHasta = null;
          user.intentosFallidos = 0;
          // Guardamos temporalmente el reset, aunque si falla de nuevo se sumará 1
          users[userIndex] = user;
          localStorage.setItem('db_usuarios', JSON.stringify(users));
        }
      } else {
        // Bloqueo manual/permanente (legacy o forzado)
        return { success: false, message: 'Cuenta bloqueada permanente. Contacte al Admin de TI.' };
      }
    }

    const providedHash = await hashPassword(password);

    if (providedHash !== user.passwordHash) {
      user.intentosFallidos = (user.intentosFallidos || 0) + 1;
      let msg = 'Contraseña incorrecta.';
      
      if (user.intentosFallidos >= 4) {
        user.bloqueado = true;
        user.bloqueadoHasta = Date.now() + (15 * 60 * 1000); // 15 minutos
        msg = 'Cuenta bloqueada por superar intentos. Intente en 15 minutos.';
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
        nombreReal: user.nombreReal || user.username,
        role: user.role,
        area: user.area,
        cargo: user.cargo || ''
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

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser) return { success: false, message: 'No hay sesión activa.' };

    const users = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (userIndex === -1) return { success: false, message: 'Usuario no encontrado.' };

    const user = users[userIndex];
    const oldHash = await hashPassword(oldPassword);

    if (oldHash !== user.passwordHash) {
      return { success: false, message: 'La contraseña actual es incorrecta.' };
    }

    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    users[userIndex] = user;
    localStorage.setItem('db_usuarios', JSON.stringify(users));

    return { success: true, message: 'Contraseña actualizada con éxito.' };
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
