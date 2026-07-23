import React from 'react';
import { StatCards } from './components/StatCards';
import { RegistroActividadForm } from './components/RegistroActividadForm';
import { WidgetMiEstado } from './components/WidgetMiEstado';
import { WidgetSistemas } from './components/WidgetSistemas';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useActiveArea } from '../../shared/contexts/ActiveAreaContext';

export const PanelPrincipal = () => {
  const { area } = useActiveArea();
  const { currentUser } = useAuth();
  const isAdminTI = currentUser?.role === 'admin_ti' && area === 'ti';
  return (
    <section id="section-dashboard" className="section active">
      <StatCards />
      
      <div className="content-row">
        <RegistroActividadForm />
        
        <div className="right-panel">
          <WidgetMiEstado />
          {isAdminTI && <WidgetSistemas />}
        </div>
      </div>
    </section>
  );
};
