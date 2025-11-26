import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Backend-mock
export const server = setupServer(...handlers);
