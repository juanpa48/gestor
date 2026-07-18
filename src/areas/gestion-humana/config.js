import { AREAS } from '../../data/areasConfig';

export const tramitesGH = [
  "Vinculación de personal",
  "Desvinculación de personal",
  "Permiso ausentismo",
  "Solicitud cesantías",
  "Solicitud carta laboral",
  "Solicitud vacaciones"
];

export const GH_CONFIG = {
  ...AREAS.gh,
  grupos: [
    { nombre: 'Trámites de Personal', tramites: tramitesGH }
  ]
};
