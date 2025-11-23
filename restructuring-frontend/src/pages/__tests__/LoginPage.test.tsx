import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import LoginPage from '../LoginPage';

const mockRegister = vi.fn(() => ({
  name: 'field',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

const mockSubmit = vi.fn();

vi.mock('../../hooks/useLoginForm', () => ({
  useLoginForm: () => ({
    form: {
      register: mockRegister,
      handleSubmit: (cb: unknown) => cb,
      formState: { errors: {} },
    },
    feedback: null,
    isSubmitting: false,
    onSubmit: mockSubmit,
  }),
}));

vi.mock('../../layouts/AuthLayout', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: ReactNode }) => (
    <div data-testid="auth-layout">
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));

describe('LoginPage', () => {
  it('renders essential login form elements', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(html).toContain('Logg inn');
    expect(html).toContain('E-post');
    expect(html).toContain('Passord');
    expect(html).toContain('Logg inn');
    expect(html).toContain('href="/forgot-password"');
    expect(html).toContain('href="/register"');
  });
});
