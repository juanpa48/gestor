import * as XLSX from 'xlsx';

export const getColumnsConfig = (area) => {
  let exactCols = [
    { title: 'Fecha de Creación', key: 'fechaCreacion' },
    { title: 'Solicitante', key: 'solicitante' },
    { title: 'Cargo', key: 'cargo' },
    { title: 'Solicitud del usuario', key: 'solicitud' },
    { title: 'Tipo de Ticket', key: 'tipo' },
    { title: 'Prioridad', key: 'prioridad' },
    { title: 'Estado', key: 'estado' },
    { title: 'Grupo de actividad', key: 'grupo' },
    { title: 'Grupo', key: 'grupoExtra' },
    { title: 'Fecha de Inicio', key: 'fechaInicio' },
    { title: 'Fecha de Finalización', key: 'fechaFin' },
    { title: 'Tiempo', key: 'tiempo' },
    { title: 'Clasificacion', key: 'clasificacion' },
    { title: 'Accion tenica', key: 'accion' },
    { title: 'Fecha progamada', key: 'fechaProgramada' },
    { title: 'Detalles (opcional)', key: 'detalles' },
    { title: 'Responsable', key: 'responsable' },
    { title: 'Fecha de Pausa (SLA)', key: 'fechaPausa' },
    { title: 'Tiempo Pausado (ms)', key: 'tiempoPausadoTotal' }
  ];

  if (area === 'gh' || area === 'ge') {
    exactCols = exactCols.filter(c => c.key !== 'tipo' && c.key !== 'prioridad' && c.key !== 'grupo');
  }
  
  if (area === 'gh') {
    exactCols.splice(exactCols.findIndex(c => c.key === 'estado') + 1, 0, { title: 'Novedad de Nómina', key: 'novedadNomina' });
  }

  return exactCols;
};

/**
 * Función auxiliar para formatear fechas ISO
 */
const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  let stringValue = String(value);
  
  if (stringValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
    try {
      const date = new Date(stringValue);
      stringValue = date.toLocaleString();
    } catch(e) {}
  }
  return stringValue;
};

/**
 * Función auxiliar para escapar textos de CSV
 */
const escapeCSV = (value) => {
  let stringValue = formatValue(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Aplanador principal: Convierte la lista de tickets en una matriz bidimensional (Header + Filas)
 * Extrae llaves dinámicas de `detalles`.
 */
export const prepareExportData = (tickets, exactCols) => {
  const exportCols = exactCols.filter(c => c.key !== 'detalles');
  
  const dynamicKeys = new Set();
  tickets.forEach(ticket => {
    if (ticket.detalles && typeof ticket.detalles === 'object') {
      Object.keys(ticket.detalles).forEach(key => {
        dynamicKeys.add(key);
      });
    }
  });
  const dynamicKeysArray = Array.from(dynamicKeys);

  const headers = exportCols.map(c => c.title);
  dynamicKeysArray.forEach(key => headers.push(`Detalle: ${key}`));

  const rows = tickets.map(row => {
    const standardValues = exportCols.map(c => {
      let val = '';
      if (c.key === 'novedadNomina') {
        val = row[c.key] ? 'Sí' : 'No';
      } else {
        val = typeof row[c.key] === 'object' && row[c.key] !== null ? JSON.stringify(row[c.key]) : (row[c.key] || '');
      }
      return val;
    });

    const dynamicValues = dynamicKeysArray.map(key => {
      let val = '';
      if (row.detalles && typeof row.detalles === 'object' && row.detalles[key] !== undefined) {
        val = row.detalles[key];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
      }
      return val;
    });

    return [...standardValues, ...dynamicValues];
  });

  return { headers, rows };
};

/**
 * Genera y descarga el archivo (CSV o XLSX)
 */
export const downloadReport = (tickets, exactCols, area, format = 'csv') => {
  const { headers, rows } = prepareExportData(tickets, exactCols);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Exportacion_${area.toUpperCase()}_${dateStr}`;

  if (format === 'csv') {
    const csvRows = rows.map(row => row.map(escapeCSV).join(','));
    const csvContent = [headers.map(escapeCSV).join(','), ...csvRows].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === 'xlsx') {
    // Para XLSX, mapeamos Headers y Rows a un arreglo de Objetos
    const dataObjects = rows.map(rowArray => {
      const obj = {};
      rowArray.forEach((val, idx) => {
        obj[headers[idx]] = formatValue(val);
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataObjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
};
