import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const TI_CONFIG = {
  ...AREAS.ti,
  get tiposSolicitud() {
    const s = getAreaSettings('ti');
    return s.tiposSolicitud || s.grupos || [];
  }
};
