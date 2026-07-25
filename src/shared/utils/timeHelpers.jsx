import React from 'react';
import { calculateWorkingMilliseconds } from './businessHours';

/**
 * Parsea la fecha de creación de un ticket a objeto Date.
 * Maneja múltiples formatos incluyendo el fallback a Regex.
 */
export const parseFechaCreacion = (ticket) => {
  if (ticket.fechaISO) {
    const d = new Date(ticket.fechaISO);
    if (!isNaN(d.getTime())) return d;
  }
  const raw = ticket.fechaCreacion || '';
  if (!raw) return null;
  const d2 = new Date(raw);
  if (!isNaN(d2.getTime())) return d2;

  const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);

    const timeMatch = raw.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
    let hours = 0, minutes = 0, seconds = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      if (/p\.?\s*m\.?/i.test(raw) && hours < 12) hours += 12;
      if (/a\.?\s*m\.?/i.test(raw) && hours === 12) hours = 0;
    }
    const d3 = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(d3.getTime())) return d3;
  }
  return null;
};

/**
 * Calcula los milisegundos restantes del SLA de un ticket.
 * Retorna Infinity si ya está cerrado o no tiene fecha.
 */
export const getSlaRemainingMs = (ticket, slas) => {
  if (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado' || ticket.estado === 'Finalizado') {
    return Infinity;
  }

  const startMs = parseFechaCreacion(ticket)?.getTime();
  if (!startMs) return Infinity;

  let limiteSlaHoras = slas[ticket.prioridad] || 48;
  if ((ticket.id && ticket.id.startsWith('GH-')) || ticket.area === 'gh') {
    limiteSlaHoras = 9;
  }
  
  const limiteMs = limiteSlaHoras * 3600 * 1000;
  
  let endMs = Date.now();
  if (ticket.estado === 'Suspendido' && ticket.fechaPausa) {
    endMs = ticket.fechaPausa;
  } else if (ticket.agentPauseStart) {
    endMs = ticket.agentPauseStart;
  }

  const consumidoMs = calculateWorkingMilliseconds(startMs, endMs) - (ticket.tiempoPausadoTotal || 0);
  return limiteMs - consumidoMs;
};

/**
 * Calcula el tiempo SLA restante y devuelve un badge React.
 * Retorna null si no aplica (ej. si no hay fechaCreacion o ya se resolvió).
 */
export const calculateSlaBadge = (ticket, slas) => {
  if (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado' || ticket.estado === 'Finalizado') {
    return <span className="sla-badge ok" title="Cumplido a tiempo"><i className="fa-solid fa-flag-checkered"></i> Cumplido</span>;
  }

  const restanteMs = getSlaRemainingMs(ticket, slas);
  if (restanteMs === Infinity) return null;

  const absMs = Math.abs(restanteMs);
  const totalMins = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const timeString = `${hours}h ${mins}m`;
  
  if (restanteMs < 0) {
    return <span className="sla-badge danger" title="El tiempo límite se ha agotado"><i className="fa-solid fa-fire"></i> Vencido -{timeString}</span>;
  } else if (restanteMs <= 2 * 3600 * 1000) { // Menos de 2 horas
    return <span className="sla-badge warning" title="El tiempo está por agotarse"><i className="fa-solid fa-triangle-exclamation"></i> Por vencer {timeString}</span>;
  } else {
    return <span className="sla-badge ok" title="El ticket está dentro del tiempo"><i className="fa-solid fa-check"></i> A tiempo {timeString}</span>;
  }
};
