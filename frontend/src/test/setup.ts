import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// ---------------------------
// Start MSW Server
// ---------------------------
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  //
  // Mock window.URL
  //
  Object.defineProperty(globalThis, 'URL', {
    writable: true,
    value: {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    },
  });

  //
  // Mock document
  //
  Object.defineProperty(globalThis, 'document', {
    writable: true,
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
  });

  //
  // Mock localStorage
  //
  Object.defineProperty(globalThis, 'localStorage', {
    writable: true,
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});
