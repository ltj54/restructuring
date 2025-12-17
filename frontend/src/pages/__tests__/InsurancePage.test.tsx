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

    expect(html).toContain('Få tilbud på forsikring');
    expect(html).toContain('Send forespørsel til Gjensidige');
    expect(html).toContain('Tekst du kan sende');
  });

  it('shows source and product choices', () => {
    const html = renderPage();

    expect(html).toContain('Hvor kommer forsikringene dine fra?');
    expect(html).toContain('Hva ønsker du tilbud på?');
  });
});
