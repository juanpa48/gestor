import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const GE_CONFIG = {
  ...AREAS.ge,
  get tiposSolicitud() {
    const s = getAreaSettings('ge');
    return s.tiposSolicitud || s.grupos || [];
  }
};
