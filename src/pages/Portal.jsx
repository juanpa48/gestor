import React, { useState, useEffect } from 'react';
import Logo from '../assets/img/Logo.png';
import { useAreaTickets as useGEContext } from '../areas/gestion-empresarial/context/GEContext';
import { useGHContext } from '../areas/gestion-humana/context/GHContext';
import { useTIContext } from '../areas/soporte-ti/context/TIContext';
import { GE_CONFIG } from '../areas/gestion-empresarial/config';
import { GH_CONFIG } from '../areas/gestion-humana/config';
import { TI_CONFIG } from '../areas/soporte-ti/config';
import { PortalLayout } from '../components/portal/PortalLayout';
import { FormGE } from '../components/portal/forms/FormGE';
import { FormGH } from '../components/portal/forms/FormGH';
import { FormTI } from '../components/portal/forms/FormTI';

export const Portal = () => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    document.body.className = 'portal';
    return () => { document.body.className = ''; };
  }, []);

  if (!selectedArea) {
    return (
      <div className="portal-container">
        <header className="portal-header">
          <div className="logo-placeholder">
            <img src={Logo} alt="Logo de Empresa" />
          </div>
          <div className="header-title">
            Portal de Autogestión
          </div>
        </header>
                <div className="area-selector-container">
          <h2 className="area-selector-title">
            ¿A qué área deseas enviar tu solicitud?
          </h2>
          
          <div className="area-cards-grid">
            
            <div 
              className="area-card"
              onClick={() => setSelectedArea('ge')} 
            >
              <div className="area-icon-circle" style={{ background: `${GE_CONFIG.color}20` }}>
                <i className={`fa-solid ${GE_CONFIG.icono}`} style={{ fontSize: '35px', color: GE_CONFIG.color }}></i>
              </div>
              <h3>{GE_CONFIG.nombre}</h3>
              <p>Trámites legales, creación de empresas y firmas electrónicas.</p>
            </div>

            <div 
              className="area-card"
              onClick={() => setSelectedArea('gh')} 
            >
              <div className="area-icon-circle" style={{ background: `${GH_CONFIG.color}20` }}>
                <i className={`fa-solid ${GH_CONFIG.icono}`} style={{ fontSize: '35px', color: GH_CONFIG.color }}></i>
              </div>
              <h3>{GH_CONFIG.nombre}</h3>
              <p>Solicitud de vacaciones, certificaciones laborales y nómina.</p>
            </div>

            <div 
              className="area-card"
              onClick={() => setSelectedArea('ti')} 
            >
              <div className="area-icon-circle" style={{ background: `${TI_CONFIG.color}20` }}>
                <i className={`fa-solid ${TI_CONFIG.icono}`} style={{ fontSize: '35px', color: TI_CONFIG.color }}></i>
              </div>
              <h3>{TI_CONFIG.nombre}</h3>
              <p>Soporte técnico, redes, mantenimiento y sistemas.</p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (selectedArea === 'ge') {
    return (
      <PortalLayout areaConfig={GE_CONFIG} areaContext={useGEContext} onBack={() => setSelectedArea(null)} nombre={nombre} setNombre={setNombre}>
        <FormGE nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }

  if (selectedArea === 'gh') {
    return (
      <PortalLayout areaConfig={GH_CONFIG} areaContext={useGHContext} onBack={() => setSelectedArea(null)} nombre={nombre} setNombre={setNombre}>
        <FormGH nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }

  if (selectedArea === 'ti') {
    return (
      <PortalLayout areaConfig={TI_CONFIG} areaContext={useTIContext} onBack={() => setSelectedArea(null)} nombre={nombre} setNombre={setNombre}>
        <FormTI nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }
};
