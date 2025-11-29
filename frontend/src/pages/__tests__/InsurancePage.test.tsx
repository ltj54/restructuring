import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import InsurancePage from '../InsurancePage';

const mockRegister = vi.fn(() => ({
  name: 'field',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}));

const mockSaveProfile = vi.fn();
const mockSendInsurance = vi.fn();

const mockUseInsurancePage = vi.fn();

vi.mock('../../hooks/useInsurancePage', () => ({
  useInsurancePage: () => mockUseInsurancePage(),
}));

vi.mock('../../components/form/FormAlert', () => ({
  FormAlert: ({ message }: { message: string }) => <div role="alert">{message}</div>,
}));

vi.mock('../../components/form/TextField', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <input aria-label={label} />,
}));

describe('InsurancePage', () => {
  beforeEach(() => {
    mockUseInsurancePage.mockReturnValue({
      form: {
        register: mockRegister,
        handleSubmit: (cb: unknown) => cb,
        formState: { errors: {} },
      },
      banner: null,
      isLoading: false,
      isSaving: false,
      isSending: false,
      needsInfo: false,
      onSaveProfile: mockSaveProfile,
      onSendInsurance: mockSendInsurance,
    });
  });

  const renderPage = () =>
    renderToStaticMarkup(
      <MemoryRouter>
        <InsurancePage />
      </MemoryRouter>
    );

  it('shows the insurance call-to-action when profile is complete', () => {
    const html = renderPage();

    expect(html).toContain('Inntektstapsforsikring');
    expect(html).toContain('Send inn søknad');
  });

  it('renders the profile form when additional information is required', () => {
    mockUseInsurancePage.mockReturnValueOnce({
      form: {
        register: mockRegister,
        handleSubmit: (cb: unknown) => cb,
        formState: { errors: {} },
      },
      banner: null,
      isLoading: false,
      isSaving: false,
      isSending: false,
      needsInfo: true,
      onSaveProfile: mockSaveProfile,
      onSendInsurance: mockSendInsurance,
    });

    const html = renderPage();

    expect(html).toContain('Fyll ut manglende opplysninger');
    expect(html).toContain('Fornavn');
    expect(html).toContain('Etternavn');
    expect(html).toContain('Fødselsnummer');
  });
});
