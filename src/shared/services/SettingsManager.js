import { AREAS } from '../../data/areasConfig';

// Default Data
const defaultTramitesGE = [
  {
    nombre: 'Estructurales y Legales',
    tramites: [
      "Creación y/o Cancelación de empresas",
      "Devolución de saldo a favor en rentas",
      "RUT por primera vez",
      "Constitución y cancelación de establecimientos de comercio",
      "Cambio de representante legal y sus anexos",
      "Anexo y retiro de revisoría fiscal",
      "Venta de acciones y compraventas",
      "Reforma de estatutos",
      "Cambio de dirección de la empresa",
      "Capitalización",
      "Anexo y cambio de actividades económicas",
      "Cambio de correos electrónicos y números telefónicos",
      "Inscripción o renovación en el RUP",
      "Inscripción o renovación en el RUB",
      "Renovación o actualización de cámara de comercio",
      "Otro (especificar en descripción)"
    ]
  },
  {
    nombre: 'Operativos y Documentales',
    tramites: [
      "Actualización de RUT",
      "Resolución de facturación",
      "Firma Electrónica",
      "Facturas electrónicas",
      "Documento soporte",
      "Certificados",
      "Firma electrónica de estados financieros y declaraciones de renta",
      "Renovación de firma digital de Token",
      "Otro (especificar en descripción)"
    ]
  }
];

const defaultTramitesGH = [
  {
    nombre: 'Trámites de Personal',
    tramites: [
      "Vinculación de personal",
      "Desvinculación de personal",
      "Permiso ausentismo",
      "Solicitud cesantías",
      "Solicitud carta laboral",
      "Solicitud vacaciones"
    ]
  }
];

const defaultTramitesTI = [
  {
    nombre: 'Soporte Técnico',
    tramites: [
      "Soporte"
    ]
  }
];

export const initSettingsDB = () => {
  let settings = localStorage.getItem('db_settings');
  if (!settings) {
    settings = {
      ge: { grupos: defaultTramitesGE },
      gh: { grupos: defaultTramitesGH },
      ti: { grupos: defaultTramitesTI }
    };
    localStorage.setItem('db_settings', JSON.stringify(settings));
  }
};

export const getAreaSettings = (areaId) => {
  initSettingsDB();
  const settings = JSON.parse(localStorage.getItem('db_settings'));
  return settings[areaId] || { grupos: [] };
};

export const saveAreaSettings = (areaId, grupos) => {
  initSettingsDB();
  const settings = JSON.parse(localStorage.getItem('db_settings'));
  settings[areaId] = { grupos };
  localStorage.setItem('db_settings', JSON.stringify(settings));
};
