// src/shared/utils/businessHours.js

const SCHEDULE = {
  // 0: Sunday, 1: Monday, ..., 6: Saturday
  1: { start: 7.5, end: 17 }, // Lunes: 07:30 to 17:00
  2: { start: 7.5, end: 17 }, // Martes: 07:30 to 17:00
  3: { start: 7.5, end: 17 }, // Miercoles: 07:30 to 17:00
  4: { start: 7.5, end: 17 }, // Jueves: 07:30 to 17:00
  5: { start: 7, end: 16 },   // Viernes: 07:00 to 16:00
};

// Helper to convert decimal hours to milliseconds
const hrToMs = (hr) => hr * 3600 * 1000;

/**
 * Gets the absolute timestamp boundaries of business hours for a given day.
 * Returns null if it's a non-working day.
 */
function getBusinessHoursForDay(date) {
  const day = date.getDay();
  const config = SCHEDULE[day];
  if (!config) return null;

  // Validar si es día festivo
  try {
    const festivos = window.__FESTIVOS_CACHE || [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayDate = String(date.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${dayDate}`;
    
    if (festivos.some(f => (f.fecha || f) === localDateString)) {
      return null; // Tratar como día no laboral
    }
  } catch(e) {}

  // Set time to 00:00:00.000 for the current day
  const startOfDayMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  
  return {
    start: startOfDayMs + hrToMs(config.start),
    end: startOfDayMs + hrToMs(config.end)
  };
}

/**
 * Calculates the exact amount of business-hour milliseconds elapsed between two dates.
 * It strictly ignores weekends and hours outside the defined SCHEDULE.
 * 
 * @param {number} startMs - Start timestamp in ms
 * @param {number} endMs - End timestamp in ms
 * @returns {number} The total elapsed working milliseconds
 */
export function calculateWorkingMilliseconds(startMs, endMs) {
  if (!startMs || !endMs || startMs >= endMs) return 0;

  let totalMs = 0;
  
  // Clone the start date so we can safely iterate day by day
  let current = new Date(startMs);

  // We iterate until 'current' crosses 'endMs'
  while (current.getTime() <= endMs) {
    const bizHours = getBusinessHoursForDay(current);
    
    if (bizHours) {
      // Find the exact overlap for this specific day
      const actualStart = Math.max(startMs, bizHours.start);
      
      // Calculate midnight of the next day to bound the actualEnd properly
      const nextDayMs = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime();
      const actualEnd = Math.min(endMs, bizHours.end, nextDayMs);

      if (actualStart < actualEnd) {
        totalMs += (actualEnd - actualStart);
      }
    }
    
    // Jump to 00:00:00 of the next day
    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
  }

  return totalMs;
}
