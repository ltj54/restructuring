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

    expect(html).toContain('Forsikring');
    expect(html).toContain('Gjensidige');
    expect(html).toContain('Meldingsmal');
  });

  it('shows source and product choices', () => {
    const html = renderPage();

    expect(html).toContain('Hvor kommer forsikringene dine fra?');
    expect(html).toContain('Hva ønsker du tilbud på?');
  });
});






