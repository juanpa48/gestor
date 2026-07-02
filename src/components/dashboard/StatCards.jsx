import React, { useMemo } from 'react';
import { useTickets } from '../../contexts/TicketContext';
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
  const { actividades } = useTickets();

  // Mapear los datos reales para las estadísticas principales
  const stats = useMemo(() => {
    const open = actividades.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso').length;
    const inProg = actividades.filter(a => a.estado === 'En progreso').length;
    const urgent = actividades.filter(a => a.prioridad === 'Urgente' && !['Resuelto', 'Cerrado'].includes(a.estado)).length;
    const resolved = actividades.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    return { open, inProgress: inProg, urgent, resolved };
  }, [actividades]);

  // Chart 1: Total Abiertos (Pie)
  const chart1Data = useMemo(() => {
    const abiertos = actividades.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso');
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
  }, [actividades]);

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

  // Chart 3: Resolución (Barra Vertical)
  const chart3Data = useMemo(() => {
    const strArea = (grupo) => (grupo || '').toLowerCase();
    const aArea1 = actividades.filter(a => strArea(a.grupo).includes('área 1') || strArea(a.grupo).includes('area 1')).length;
    const aArea2 = actividades.filter(a => strArea(a.grupo).includes('área 2') || strArea(a.grupo).includes('area 2')).length;

    return {
      labels: ['Área 1', 'Área 2'],
      datasets: [{
        data: [aArea1, aArea2],
        backgroundColor: '#10b981',
        borderRadius: 4
      }]
    };
  }, [actividades]);

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

  // Chart 4: Tareas Urgentes (Doughnut)
  const chart4Data = useMemo(() => {
    const urgentes = actividades.filter(a => a.prioridad === 'Urgente');
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
  }, [actividades]);

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
            <div className="stat-label">TAREAS URGENTES</div>
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
