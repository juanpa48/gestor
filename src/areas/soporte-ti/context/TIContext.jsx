import { createAreaContext } from '../../../shared/contexts/createAreaContext';
import { TI_CONFIG } from '../config';

export const { AreaProvider: TIProvider, useAreaContext: useTIContext } = createAreaContext(TI_CONFIG);
