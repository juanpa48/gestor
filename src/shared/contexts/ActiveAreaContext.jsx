import React, { createContext, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';

import { useAreaTickets as useGEContext } from '../../areas/gestion-empresarial/context/GEContext';
import { useGHContext } from '../../areas/gestion-humana/context/GHContext';
import { useTIContext } from '../../areas/soporte-ti/context/TIContext';

import { GE_CONFIG } from '../../areas/gestion-empresarial/config';
import { GH_CONFIG } from '../../areas/gestion-humana/config';
import { TI_CONFIG } from '../../areas/soporte-ti/config';

const ActiveAreaContext = createContext(null);

export const ActiveAreaProvider = ({ children }) => {
  const { area } = useParams();

  // Los hooks de contexto siempre se llaman incondicionalmente
  const ge = useGEContext();
  const gh = useGHContext();
  const ti = useTIContext();

  let activeCtx = null;
  let activeConfig = null;

  if (area === 'ge') {
    activeCtx = ge;
    activeConfig = GE_CONFIG;
  } else if (area === 'gh') {
    activeCtx = gh;
    activeConfig = GH_CONFIG;
  } else if (area === 'ti') {
    activeCtx = ti;
    activeConfig = TI_CONFIG;
  }

  // Si la ruta del área no es válida (ej. /dashboard/marketing), mandarlo al portal
  if (!activeCtx) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <ActiveAreaContext.Provider value={{ ctx: activeCtx, config: activeConfig, area }}>
      {children}
    </ActiveAreaContext.Provider>
  );
};

export const useActiveArea = () => {
  const context = useContext(ActiveAreaContext);
  if (!context) {
    throw new Error('useActiveArea debe usarse dentro de un ActiveAreaProvider');
  }
  return context;
};
