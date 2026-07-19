const API_URL = 'http://localhost:3001/api/upload';

export const UploadService = {
  /**
   * Sube múltiples archivos al backend local
   * @param {FileList|Array} files - Archivos seleccionados en el input
   * @returns {Promise<Array<string>>} - Array con las URLs públicas de los archivos subidos
   */
  uploadFiles: async (files) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
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
