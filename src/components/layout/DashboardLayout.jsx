import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStorageSync } from '../../hooks/useStorageSync';

export const DashboardLayout = () => {
  // Activa la sincronizacion y las notificaciones nativas/sonido
  useStorageSync();

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </>
  );
};

