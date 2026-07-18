import { AREAS } from '../../data/areasConfig';
import { tramitesArea1, tramitesArea2 } from '../../data/tramitesData';

export const GE_CONFIG = {
  ...AREAS.ge,
  grupos: [
    { nombre: 'Estructurales y Legales', tramites: tramitesArea1 },
    { nombre: 'Operativos y Documentales', tramites: tramitesArea2 }
  ]
};
