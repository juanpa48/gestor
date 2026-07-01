import React from 'react';
import { StatCards } from '../../components/dashboard/StatCards';
import { RegistroActividadForm } from '../../components/dashboard/RegistroActividadForm';
import { WidgetMiEstado } from '../../components/dashboard/WidgetMiEstado';
import { WidgetSistemas } from '../../components/dashboard/WidgetSistemas';

export const PanelPrincipal = () => {
  return (
    <section id="section-dashboard" className="section active">
      <StatCards />
      
      <div className="content-row">
        <RegistroActividadForm />
        
        <div className="right-panel">
          <WidgetMiEstado />
          <WidgetSistemas />
        </div>
      </div>
    </section>
  );
};
