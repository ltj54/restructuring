import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InsurancePage from '@/pages/InsurancePage';

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <InsurancePage />
    </MemoryRouter>
  );

describe('InsurancePage', () => {
  it('renders Gjensidige-focused headline and actions', () => {
    const html = renderPage();

    expect(html).toContain('Fa tilbud pa forsikring');
    expect(html).toContain('Send foresporsel til Gjensidige');
    expect(html).toContain('Tekst du kan sende');
  });

  it('shows source and product choices', () => {
    const html = renderPage();

    expect(html).toContain('Hvor kommer forsikringene dine fra?');
    expect(html).toContain('Hva onsker du tilbud pa?');
  });
});
