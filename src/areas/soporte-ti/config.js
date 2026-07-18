import { AREAS } from '../../data/areasConfig';

export const tramitesTI = [
  "Soporte"
];

export const TI_CONFIG = {
  ...AREAS.ti,
  grupos: [
    { nombre: 'Soporte Técnico', tramites: tramitesTI }
  ]
};
