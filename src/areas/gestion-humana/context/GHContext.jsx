import { createAreaContext } from '../../../shared/contexts/createAreaContext';
import { GH_CONFIG } from '../config';

export const { AreaProvider: GHProvider, useAreaContext: useGHContext } = createAreaContext(GH_CONFIG);
