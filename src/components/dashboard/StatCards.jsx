import React, { useEffect, useState } from 'react';
import { useTickets } from '../../contexts/TicketContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export const StatCards = () => {
  const { actividades } = useTickets();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, urgent: 0, resolved: 0 });

  useEffect(() => {
    const open = actividades.filter(a => a.estado === 'Pendiente').length;
    const inProg = actividades.filter(a => a.estado === 'En progreso').length;
    const urgent = actividades.filter(a => a.prioridad === 'Urgente').length;
    const resolved = actividades.filter(a => a.estado === 'Resuelto' || a.estado === 'Cerrado').length;
    setStats({ open, inProgress: inProg, urgent, resolved });
  }, [actividades]);

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false, min: 0 } },
    elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } },
    layout: { padding: 0 }
  };

  const getSparklineData = (color, bg) => ({
    labels: ['1','2','3','4','5','6','7'],
    datasets: [{
      data: [Math.random()*10, Math.random()*15, Math.random()*8, Math.random()*20, Math.random()*12, Math.random()*25, Math.random()*15],
      borderColor: color,
      backgroundColor: bg,
      fill: true
    }]
  });

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
          <LineChart data={getSparklineData('#e11d48', 'rgba(225, 29, 72, 0.1)')} options={sparklineOptions} />
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
          <LineChart data={getSparklineData('#0f172a', 'rgba(15, 23, 42, 0.05)')} options={sparklineOptions} />
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
          <LineChart data={getSparklineData('#0f172a', 'rgba(15, 23, 42, 0.05)')} options={sparklineOptions} />
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
          <LineChart data={getSparklineData('#e11d48', 'rgba(225, 29, 72, 0.1)')} options={sparklineOptions} />
        </div>
      </div>
    </div>
  );
};
