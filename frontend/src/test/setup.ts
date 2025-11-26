import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// --------------------------------------------
// Initialiser MSW + sikre mocks
// --------------------------------------------
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  // ----------------------------
  // Mock URL API
  // ----------------------------
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();

  // ----------------------------
  // Mock document
  // ----------------------------
  if (!globalThis.document) {
    globalThis.document = {
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
    } as unknown as Document;
  } else {
    globalThis.document.createElement = vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    }));

    globalThis.document.body = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as unknown as HTMLElement;
  }

  // ----------------------------
  // Mock localStorage
  // ----------------------------
  globalThis.localStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  } as unknown as Storage;

  // ----------------------------
  // Mock window
  // ----------------------------
  globalThis.window = {
    URL: globalThis.URL,
    document: globalThis.document,
  } as unknown as Window;
});

// --------------------------------------------
// Rydd opp etter hver test
// --------------------------------------------
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// --------------------------------------------
// Lukk MSW når testene er ferdige
// --------------------------------------------
afterAll(() => {
  server.close();
});
