import React, { useEffect } from 'react';
import { TicketHistory } from '../components/portal/TicketHistory';
import { TicketForm } from '../components/portal/TicketForm';
import { SystemStatus } from '../components/portal/SystemStatus';
import { StaffStatus } from '../components/portal/StaffStatus';

export const Portal = () => {
  // Aplicamos la clase del tema claro al body mientras estamos en el portal
  useEffect(() => {
    document.body.classList.add('portal-theme');
    
    // Limpieza al desmontar (cuando regresamos al dashboard oscuro)
    return () => {
      document.body.classList.remove('portal-theme');
    };
  }, []);

  return (
    <div className="portal-wrapper">
      <header className="portal-header">
        <div className="portal-logo">
          <img src="/img/Logo.png" alt="Logo Empresa" />
          <div className="portal-title-block">
            <h1>Portal de Servicios Corporativos</h1>
            <p>Gestión centralizada de requerimientos administrativos y de TI</p>
          </div>
        </div>
        <SystemStatus />
      </header>

      <main className="portal-main">
        <TicketHistory />
        
        <section className="portal-content">
          <TicketForm />
        </section>

        <StaffStatus />
      </main>
    </div>
  );
};
