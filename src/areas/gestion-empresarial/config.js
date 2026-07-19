import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const GE_CONFIG = {
  ...AREAS.ge,
  get grupos() {
    return getAreaSettings('ge').grupos;
  }
};
