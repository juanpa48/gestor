import React from 'react';
import { StatCards } from './components/StatCards';
import { RegistroActividadForm } from './components/RegistroActividadForm';
import { WidgetMiEstado } from './components/WidgetMiEstado';
import { WidgetSistemas } from './components/WidgetSistemas';

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
