import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InsurancePage from '@/pages/InsurancePage';
import { AuthProvider } from '@/hooks/useAuth';

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AuthProvider>
        <InsurancePage />
      </AuthProvider>
    </MemoryRouter>
  );

describe('InsurancePage', () => {
  it('renders Gjensidige-focused headline and actions', () => {
    const html = renderPage();

    expect(html).toContain('F\u00e5 tilbud p\u00e5 forsikring');
    expect(html).toContain('Send foresp\u00f8rsel til Gjensidige');
    expect(html).toContain('Tekst du kan sende');
  });

  it('shows source and product choices', () => {
    const html = renderPage();

    expect(html).toContain('Hvor kommer forsikringene dine fra?');
    expect(html).toContain('Hva \u00f8nsker du tilbud p\u00e5?');
  });
});
