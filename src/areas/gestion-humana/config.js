import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const GH_CONFIG = {
  ...AREAS.gh,
  get grupos() {
    return getAreaSettings('gh').grupos;
  }
};
