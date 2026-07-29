import React, { useMemo } from 'react';
import { useActiveArea } from '../../../shared/contexts/ActiveAreaContext';
import { getSlaRemainingMs } from '../../../shared/utils/timeHelpers';
import { getAreaSettings } from '../../../shared/services/SettingsManager';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = "'DM Sans', sans-serif";

export const StatCards = () => {
  const { ctx, config, area } = useActiveArea();
  const { actividades } = ctx;
  const slas = getAreaSettings(area).slas || {};

  // Mapear los datos reales para las estadísticas principales
  const stats = useMemo(() => {
    const open = actividades.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso').length;
    const inProg = actividades.filter(a => a.estado === 'En progreso').length;
    
    let urgentCount = 0;
    if (area === 'gh' || area === 'ge') {
      urgentCount = actividades.filter(a => {
        if (['Resuelto', 'Cerrado'].includes(a.estado)) return false;
        const remaining = getSlaRemainingMs(a, slas);
        return remaining !== Infinity && remaining <= 2 * 3600 * 1000;
      }).length;
    } else {
      urgentCount = actividades.filter(a => a.prioridad === 'Urgente' && !['Resuelto', 'Cerrado'].includes(a.estado)).length;
    }

    const resolved = actividades.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    return { open, inProgress: inProg, urgent: urgentCount, resolved };
  }, [actividades, area, slas]);

  // Chart 1: Total Abiertos (Pie)
  const chart1Data = useMemo(() => {
    const abiertos = actividades.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso');
    
    if (area === 'gh') {
      const pPendiente = abiertos.filter(a => a.estado === 'Pendiente').length;
      const pProgreso = abiertos.filter(a => a.estado === 'En progreso').length;
      return {
        labels: ['Pendientes', 'En Progreso'],
        datasets: [{
          data: [pPendiente, pProgreso],
          backgroundColor: ['#f59e0b', '#3b82f6'],
          borderWidth: 0
        }]
      };
    } else if (area === 'ge') {
      const grouped = {};
      abiertos.forEach(a => {
        const tipo = a.tipoSolicitud || 'Otros';
        grouped[tipo] = (grouped[tipo] || 0) + 1;
      });
      
      const labels = Object.keys(grouped).length > 0 ? Object.keys(grouped).map(l => l.substring(0, 15) + (l.length > 15 ? '...' : '')) : ['Sin registros'];
      const data = Object.keys(grouped).length > 0 ? Object.values(grouped) : [1];
      const bgColors = Object.keys(grouped).length > 0 
        ? ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'] 
        : ['#e2e8f0'];

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: bgColors,
          borderWidth: 0
        }]
      };
    } else {
      const pUrgente = abiertos.filter(a => a.prioridad === 'Urgente').length;
      const pAlta = abiertos.filter(a => a.prioridad === 'Alta').length;
      const pMedia = abiertos.filter(a => a.prioridad === 'Media').length;
      const pBaja = abiertos.filter(a => a.prioridad === 'Baja').length;

      return {
        labels: ['Urgente', 'Alta', 'Media', 'Baja'],
        datasets: [{
          data: [pUrgente, pAlta, pMedia, pBaja],
          backgroundColor: ['#e8192c', '#f59e0b', '#3b82f6', '#10b981'],
          borderWidth: 0
        }]
      };
    }
  }, [actividades, area]);

  const chart1Options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { boxWidth: 10, padding: 8, font: { size: 10 }, color: '#cbd5e1' }
      }
    }
  };

  // Chart 2: En Progreso (Barra Horizontal)
  const chart2Data = useMemo(() => {
    const ePendiente = actividades.filter(a => a.estado === 'Pendiente').length;
    const eProgreso = actividades.filter(a => a.estado === 'En progreso').length;
    const eResuelto = actividades.filter(a => a.estado === 'Resuelto').length;

    return {
      labels: ['Pend.', 'Progr.', 'Res.'],
      datasets: [{
        data: [ePendiente, eProgreso, eResuelto],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    };
  }, [actividades]);

  const chart2Options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: { legend: { display: false } },
    scales: { 
      x: { display: false }, 
      y: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } 
    }
  };

  // Chart 3: Resolución por Área (Barra Vertical) dinámica según grupos
  const chart3Data = useMemo(() => {
    const strArea = (grupo) => (grupo || '').toLowerCase();
    
    // Tomar los primeros 2 o 3 grupos de config.grupos
    const labels = (config.tiposSolicitud || config.grupos || []).map(g => g.nombre.substring(0, 10)); // nombre corto
    const data = (config.tiposSolicitud || config.grupos || []).map(g => {
      const gName = g.nombre.toLowerCase();
      return actividades.filter(a => strArea(a.tipoSolicitud).includes(gName) || strArea(a.grupoExtra).includes(gName)).length;
    });

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: '#10b981',
        borderRadius: 4
      }]
    };
  }, [actividades, config.tiposSolicitud, config.grupos]);

  const chart3Options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: { legend: { display: false } },
    scales: { 
      y: { display: false }, 
      x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } 
    }
  };

  // Chart 4: Tareas Urgentes (Doughnut) o Próximo a vencer
  const chart4Data = useMemo(() => {
    let urgentes = [];
    if (area === 'gh' || area === 'ge') {
      urgentes = actividades.filter(a => {
        const remaining = getSlaRemainingMs(a, slas);
        return remaining !== Infinity && remaining <= 2 * 3600 * 1000;
      });
    } else {
      urgentes = actividades.filter(a => a.prioridad === 'Urgente');
    }
    
    const uResueltas = urgentes.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    const uPendientes = urgentes.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso').length;

    return {
      labels: ['Pendientes', 'Resueltas'],
      datasets: [{
        data: [uPendientes, uResueltas],
        backgroundColor: ['#e8192c', '#10b981'],
        borderWidth: 0
      }]
    };
  }, [actividades, area, slas]);

  const chart4Options = {
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: { legend: { display: false } }
  };


  return (
    <div className="stats-grid">
      <div className="stat-card card-open">
        <div className="stat-top">
          <div>
            <div className="stat-label">TOTAL ABIERTOS</div>
            <div className="stat-value red">{String(stats.open).padStart(2, '0')}</div>
          </div>
          <div className="stat-icon red-icon"><i className="fa-regular fa-calendar"></i></div>
        </div>
        <div className="sparkline-wrapper">
          <Pie data={chart1Data} options={chart1Options} />
        </div>
      </div>

      <div className="stat-card card-progress">
        <div className="stat-top">
          <div>
            <div className="stat-label">EN PROGRESO</div>
            <div className="stat-value dark">{String(stats.inProgress).padStart(2, '0')}</div>
          </div>
          <div className="stat-icon dark-icon"><i className="fa-solid fa-sliders"></i></div>
        </div>
        <div className="sparkline-wrapper">
          <Bar data={chart2Data} options={chart2Options} />
        </div>
      </div>

      <div className="stat-card card-resolve">
        <div className="stat-top">
          <div>
            <div className="stat-label">TOTAL RESUELTOS</div>
            <div className="stat-value dark">{String(stats.resolved).padStart(2, '0')}</div>
          </div>
          <div className="stat-icon dark-icon"><i className="fa-regular fa-clock"></i></div>
        </div>
        <div className="sparkline-wrapper">
          <Bar data={chart3Data} options={chart3Options} />
        </div>
      </div>

      <div className="stat-card card-urgent">
        <div className="stat-top">
          <div>
            <div className="stat-label">{area === 'gh' || area === 'ge' ? 'PRÓXIMO A VENCER' : 'TAREAS URGENTES'}</div>
            <div className="stat-value red">{String(stats.urgent).padStart(2, '0')}</div>
          </div>
          <div className="stat-icon red-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
        </div>
        <div className="sparkline-wrapper">
          <Doughnut data={chart4Data} options={chart4Options} />
        </div>
      </div>
    </div>
  );
};
