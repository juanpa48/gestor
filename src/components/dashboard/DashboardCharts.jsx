import React, { useMemo } from 'react';
import { useTickets } from '../../contexts/TicketContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = "'DM Sans', sans-serif";

export const DashboardCharts = () => {
  const { actividades } = useTickets();

  const chartData = useMemo(() => {
    const acts = actividades || [];
    
    // 1. Total Abiertos (Distribución por prioridad)
    const abiertos = acts.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso');
    const pUrgente = abiertos.filter(a => a.prioridad === 'Urgente').length;
    const pAlta = abiertos.filter(a => a.prioridad === 'Alta').length;
    const pMedia = abiertos.filter(a => a.prioridad === 'Media').length;
    const pBaja = abiertos.filter(a => a.prioridad === 'Baja').length;

    // 2. En Progreso (Distribución por estado global)
    const ePendiente = acts.filter(a => a.estado === 'Pendiente').length;
    const eProgreso = acts.filter(a => a.estado === 'En progreso').length;
    const eResuelto = acts.filter(a => a.estado === 'Resuelto').length;

    // 3. Tareas Urgentes
    const urgentes = acts.filter(a => a.prioridad === 'Urgente');
    const uResueltas = urgentes.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    const uPendientes = urgentes.filter(a => a.estado === 'Pendiente' || a.estado === 'En progreso').length;

    // 4. Volumen por Área
    const strArea = (grupo) => (grupo || '').toLowerCase();
    const aArea1 = acts.filter(a => strArea(a.grupo).includes('área 1') || strArea(a.grupo).includes('area 1')).length;
    const aArea2 = acts.filter(a => strArea(a.grupo).includes('área 2') || strArea(a.grupo).includes('area 2')).length;

    return {
      pie: {
        labels: ['Urgente', 'Alta', 'Media', 'Baja'],
        datasets: [{
          data: [pUrgente, pAlta, pMedia, pBaja],
          backgroundColor: ['#e8192c', '#f59e0b', '#3b82f6', '#10b981'],
          borderWidth: 0
        }]
      },
      barHoriz: {
        labels: ['Pend.', 'Progr.', 'Res.'],
        datasets: [{
          data: [ePendiente, eProgreso, eResuelto],
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      barVert: {
        labels: ['Área 1', 'Área 2'],
        datasets: [{
          data: [aArea1, aArea2],
          backgroundColor: '#10b981',
          borderRadius: 4
        }]
      },
      doughnut: {
        labels: ['Pendientes', 'Resueltos'],
        datasets: [{
          data: [uPendientes, uResueltas],
          backgroundColor: ['#e8192c', '#10b981'],
          borderWidth: 0
        }]
      }
    };
  }, [actividades]);

  return (
    <div className="charts-grid">
      <div className="chart-card fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="chart-title">Prioridad (Abiertos)</div>
        <div className="chart-container" style={{ height: '140px', position: 'relative' }}>
          <Pie data={chartData.pie} options={{
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
          }} />
        </div>
      </div>

      <div className="chart-card fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="chart-title">Estado Global</div>
        <div className="chart-container" style={{ height: '140px', position: 'relative' }}>
          <Bar data={chartData.barHoriz} options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: { padding: 0 },
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } }
          }} />
        </div>
      </div>

      <div className="chart-card fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="chart-title">Volumen por Área</div>
        <div className="chart-container" style={{ height: '140px', position: 'relative' }}>
          <Bar data={chartData.barVert} options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 0 },
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 10 } } } }
          }} />
        </div>
      </div>

      <div className="chart-card fade-in" style={{ animationDelay: '0.7s' }}>
        <div className="chart-title">Urgencias</div>
        <div className="chart-container" style={{ height: '140px', position: 'relative' }}>
          <Doughnut data={chartData.doughnut} options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            layout: { padding: 0 },
            plugins: { legend: { display: false } }
          }} />
        </div>
      </div>
    </div>
  );
};
