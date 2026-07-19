import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
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
  const { area } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    document.body.className = 'portal';
    return () => { document.body.className = ''; };
  }, []);

  if (!area) {
    return (
      <div className="portal-container">
        <header className="portal-header">
          <div className="logo-placeholder">
            <img src="/img/acyt.png" alt="Logo de Empresa" />
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
              onClick={() => navigate('/portal/ge')} 
            >
              <div className="area-icon-circle" style={{ background: `${GE_CONFIG.color}20` }}>
                <i className={`fa-solid ${GE_CONFIG.icono}`} style={{ fontSize: '35px', color: GE_CONFIG.color }}></i>
              </div>
              <h3>{GE_CONFIG.nombre}</h3>
              <p>Trámites legales, creación de empresas y firmas electrónicas.</p>
            </div>

            <div 
              className="area-card"
              onClick={() => navigate('/portal/gh')} 
            >
              <div className="area-icon-circle" style={{ background: `${GH_CONFIG.color}20` }}>
                <i className={`fa-solid ${GH_CONFIG.icono}`} style={{ fontSize: '35px', color: GH_CONFIG.color }}></i>
              </div>
              <h3>{GH_CONFIG.nombre}</h3>
              <p>Solicitud de vacaciones, certificaciones laborales y nómina.</p>
            </div>

            <div 
              className="area-card"
              onClick={() => navigate('/portal/ti')} 
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

  if (area === 'ge') {
    return (
      <PortalLayout areaConfig={GE_CONFIG} areaContext={useGEContext} onBack={() => navigate('/portal')} nombre={nombre} setNombre={setNombre}>
        <FormGE nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }

  if (area === 'gh') {
    return (
      <PortalLayout areaConfig={GH_CONFIG} areaContext={useGHContext} onBack={() => navigate('/portal')} nombre={nombre} setNombre={setNombre}>
        <FormGH nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }

  if (area === 'ti') {
    return (
      <PortalLayout areaConfig={TI_CONFIG} areaContext={useTIContext} onBack={() => navigate('/portal')} nombre={nombre} setNombre={setNombre}>
        <FormTI nombre={nombre} setNombre={setNombre} />
      </PortalLayout>
    );
  }

  return <Navigate to="/portal" replace />;
};
