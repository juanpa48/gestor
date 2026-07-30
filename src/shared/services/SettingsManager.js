import { apiClient } from './api';

let settingsCache = null;

const refreshCache = async () => {
  try {
    const data = await apiClient('/settings');
    settingsCache = data;
    localStorage.setItem('db_settings_cache', JSON.stringify(data));
  } catch (error) {
    console.warn('[SettingsManager] Servidor no disponible, usando cache local.');
    const cached = localStorage.getItem('db_settings_cache');
    if (cached && !settingsCache) {
      settingsCache = JSON.parse(cached);
    }
  }
};

refreshCache();

export const initSettingsDB = () => {
  refreshCache();
};

export const getAreaSettings = (areaId) => {
  if (settingsCache && settingsCache[areaId]) {
    return settingsCache[areaId];
  }
  
  try {
    const cached = localStorage.getItem('db_settings_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[areaId]) return parsed[areaId];
    }
  } catch (e) {}
  
  return { tiposSolicitud: [], slas: { Urgente: 2, Alta: 8, Media: 24, Baja: 48 } };
};

export const saveAreaSettings = (areaId, grupos, slas) => {
  const config = {
    tiposSolicitud: grupos,
    slas: slas || { Urgente: 2, Alta: 8, Media: 24, Baja: 48 }
  };
  
  if (!settingsCache) settingsCache = {};
  settingsCache[areaId] = config;
  localStorage.setItem('db_settings_cache', JSON.stringify(settingsCache));
  
  apiClient(`/settings/${areaId}`, {
    method: 'PUT',
    body: JSON.stringify(config)
  }).catch(err => console.error('Error saving settings:', err));
};
