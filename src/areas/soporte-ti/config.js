import { AREAS } from '../../data/areasConfig';
import { getAreaSettings } from '../../shared/services/SettingsManager';

export const TI_CONFIG = {
  ...AREAS.ti,
  get grupos() {
    return getAreaSettings('ti').grupos;
  }
};
