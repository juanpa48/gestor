// ============================================================
// REGISTRO MAESTRO DE ÁREAS
// ============================================================
// Fuente de verdad para las 3 áreas del sistema.
// Cada área define su identidad visual y claves de almacenamiento.

export const AREAS = {
  ge: {
    id: 'ge',
    nombre: 'Gestión Empresarial',
    nombreCorto: 'GE',
    icono: 'fa-building',
    color: '#6366f1',
    prefijo: 'GE',
    storageKey: 'db_actividades_ge',
    responsablesKey: 'db_responsables_ge',
  },
  gh: {
    id: 'gh',
    nombre: 'Gestión Humana',
    nombreCorto: 'GH',
    icono: 'fa-users',
    color: '#10b981',
    prefijo: 'GH',
    storageKey: 'db_actividades_gh',
    responsablesKey: 'db_responsables_gh',
  },
  ti: {
    id: 'ti',
    nombre: 'Soporte TI',
    nombreCorto: 'TI',
    icono: 'fa-headset',
    color: '#3b82f6',
    prefijo: 'TI',
    storageKey: 'db_actividades_ti',
    responsablesKey: 'db_responsables_ti',
  }
};

export const AREA_LIST = Object.values(AREAS);
