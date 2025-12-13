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
  it('renders navigation tabs and heading', () => {
    const html = renderPage();

    expect(html).toContain('Forsikring i omstilling');
    expect(html).toContain('Hva mister jeg?');
    expect(html).toContain('Behovsanalyse');
    expect(html).toContain('Produktkatalog');
  });

  it('shows registration form and loss analysis action', () => {
    const html = renderPage();

    expect(html).toContain('Registrer forsikring');
    expect(html).toContain('Mine forsikringer');
    expect(html).toContain('Analyser hva jeg mister');
  });
});
