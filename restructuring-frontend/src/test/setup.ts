import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  Object.defineProperty(globalThis, 'window', {
    value: {
      URL: {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      },
    },
    writable: true,
  });

  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn(),
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    },
    writable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});
