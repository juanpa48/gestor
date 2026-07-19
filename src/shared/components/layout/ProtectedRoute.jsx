import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const params = useParams();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificamos si la ruta tiene un parámetro :area y si coincide con el del usuario
  // params.area existirá porque las rutas están definidas como /dashboard/:area o /database/:area
  if (params.area && currentUser.area !== params.area) {
    // Si intenta entrar a un área que no es la suya, lo redirigimos a la suya
    return <Navigate to={`/dashboard/${currentUser.area}`} replace />;
  }

  return children;
};
