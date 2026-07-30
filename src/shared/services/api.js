const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    // Si la respuesta no es JSON (ej. 500 html)
    data = { message: 'Respuesta no válida del servidor.' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado o inválido -> Desloguear
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Error en la petición al servidor');
  }
  return data;
};
