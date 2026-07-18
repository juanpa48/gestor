import { createAreaContext } from '../../../shared/contexts/createAreaContext';
import { GE_CONFIG } from '../config';

export const { AreaProvider: GEProvider, useAreaContext: useAreaTickets } = createAreaContext(GE_CONFIG);
