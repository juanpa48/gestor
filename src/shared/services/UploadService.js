const API_URL = 'http://localhost:3001/api/upload';

export const UploadService = {
  /**
   * Sube múltiples archivos al backend local y los organiza en carpetas
   * @param {FileList|Array} files - Archivos seleccionados en el input
   * @param {string} ticketId - ID del ticket (ej. REQ-001) para la carpeta
   * @param {string} area - Área correspondiente (ej. 'ti', 'ge', 'gh')
   * @returns {Promise<Array<string>>} - Array con las URLs públicas de los archivos subidos
   */
  uploadFiles: async (files, ticketId, area = 'misc') => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    if (area) {
      formData.append('area', area);
    }
    // Importante: agregar el ticketId ANTES de los archivos
    if (ticketId) {
      formData.append('ticketId', ticketId);
    }

    // 'adjuntos' debe coincidir con el nombre esperado en backend: upload.array('adjuntos')
    for (let i = 0; i < files.length; i++) {
      formData.append('adjuntos', files[i]);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.urls;
      } else {
        throw new Error(result.message || 'Error desconocido al subir archivos');
      }
    } catch (error) {
      console.error('UploadService Error:', error);
      throw error;
    }
  }
};
