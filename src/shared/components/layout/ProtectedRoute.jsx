import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children, adminOnly }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const params = useParams();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Protección de Rol: Si la ruta exige ser Admin y el usuario no lo es, al dashboard de su área
  if (adminOnly && currentUser.role !== 'admin_ti') {
    return <Navigate to={`/dashboard/${currentUser.area}`} replace />;
  }

  // Protección de Área: Verificamos si la ruta tiene un parámetro :area
  if (params.area) {
    // Súper-poder: El admin_ti puede saltarse esta restricción de área para auditar todo
    if (currentUser.role !== 'admin_ti' && currentUser.area !== params.area) {
      return <Navigate to={`/dashboard/${currentUser.area}`} replace />;
    }
  }

  return children;
};
