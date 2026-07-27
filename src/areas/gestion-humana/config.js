import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const GH_CONFIG = {
  ...AREAS.gh,
  get tiposSolicitud() {
    const s = getAreaSettings('gh');
    return s.tiposSolicitud || s.grupos || [];
  }
};
