import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PortalProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Si no está autenticado, mandarlo al login del portal
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // A diferencia del dashboard, CUALQUIER usuario logueado (sea solicitante o gestor) puede usar el portal
  return children;
};
