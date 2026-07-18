import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStorageSync } from '../../hooks/useStorageSync';

export const DashboardLayout = () => {
  // Activa la sincronizacion y las notificaciones nativas/sonido
  useStorageSync();
  const location = useLocation();

  useEffect(() => {
    // Sincronizar el atributo data-page en el body para el CSS original
    let pageName = 'dashboard';
    if (location.pathname.includes('/actividades')) pageName = 'recents';
    else if (location.pathname.includes('/gestion')) pageName = 'solicitudes';
    
    document.body.dataset.page = pageName;
    document.body.dataset.section = pageName; // También en data-section por si acaso
    window.currentSection = pageName;
  }, [location.pathname]);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Topbar />
        {/* El HTML original ponía los sections directamente aquí, sin .page-content */}
        <Outlet />
      </main>
    </>
  );
};

