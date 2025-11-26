import { renderToStaticMarkup } from 'react-dom/server';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { server } from '../../test/server';
import { ApiError } from '../../utils/api';
import { useInsurance } from '../useInsurance';

const authState = {
  isAuthenticated: true,
  token: 'test-token',
};

// ---- Mock useAuth ----
vi.mock('../useAuth', () => ({
  useAuth: () => authState,
}));

// ---- Mock config ----
vi.mock('../../utils/config', () => ({
  API_BASE_URL: 'http://localhost/api',
}));

// ---- Create a JSDOM-like document object so CI does not crash ----
const mockDocument = {
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

Object.defineProperty(globalThis, 'document', {
  writable: true,
  value: mockDocument,
});

// ---- Mock URL APIs used by the hook ----
Object.defineProperty(globalThis, 'URL', {
  writable: true,
  value: {
    createObjectURL: vi.fn(() => 'blob:url'),
    revokeObjectURL: vi.fn(),
  },
});

// ---- renderHook helper ----
function renderHook<T>(hook: () => T) {
  let value: T | undefined;

  function TestComponent() {
    value = hook();
    return null;
  }

  renderToStaticMarkup(<TestComponent />);

  if (typeof value === 'undefined') {
    throw new Error('Hook did not run');
  }

  return { result: { current: value } };
}

describe('useInsurance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the insurance request and downloads the XML', async () => {
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    };

    mockDocument.createElement.mockReturnValue(anchor);

    server.use(
      http.post('http://localhost/api/insurance/send', () =>
        HttpResponse.text('<xml />', {
          status: 200,
          headers: {
            'Content-Disposition': 'attachment; filename="insurance.xml"',
            'Content-Type': 'application/xml',
          },
        })
      )
    );

    const { result } = renderHook(() => useInsurance());

    const message = await result.current.sendInsurance();

    expect(message).toBe('Forsikringssøknad generert og lastet ned.');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(anchor.click).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('throws an ApiError when the user is not authenticated', async () => {
    authState.isAuthenticated = false;
    authState.token = null;

    const { result } = renderHook(() => useInsurance());

    await expect(result.current.sendInsurance()).rejects.toBeInstanceOf(ApiError);

    authState.isAuthenticated = true;
    authState.token = 'test-token';
  });

  it('propagates API failures', async () => {
    server.use(
      http.post('http://localhost/api/insurance/send', () =>
        HttpResponse.json({ message: 'Kunne ikke generere' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useInsurance());

    await expect(result.current.sendInsurance()).rejects.toThrow('Kunne ikke generere');
  });
});
