import { fetchJson } from "@/utils/api";

/* ============================================================
   MINE FORSIKRINGER
   ============================================================ */

export interface RegisterUserInsuranceRequest {
  source: 'EMPLOYER' | 'PRIVATE' | 'OTHER';
  providerName?: string;
  productName?: string;
  validFrom?: string;
  validTo?: string;
  notes?: string;
}

export async function registerMyInsurance(
  payload: RegisterUserInsuranceRequest,
): Promise<void> {
  await fetchJson('/insurance/my', {
    method: 'POST',
    body: payload, // fetchJson serialiserer selv
  });
}

export interface UserInsuranceResponse {
  id: number;
  source: 'EMPLOYER' | 'PRIVATE' | 'OTHER';
  providerName?: string;
  productName?: string;
  notes?: string;
  active: boolean;
  validFrom?: string;
  validTo?: string;
}

export async function getMyInsurances(): Promise<UserInsuranceResponse[]> {
  return fetchJson('/insurance/my');
}

/* ============================================================
   LOSS-ANALYSE
   ============================================================ */

export interface CoverageLossItem {
  area: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CoverageLossAnalysisResponse {
  losses: CoverageLossItem[];
}

export async function analyzeCoverageLoss(): Promise<CoverageLossAnalysisResponse> {
  return fetchJson('/insurance/analysis/loss', {
    method: 'POST',
  });
}

/* ============================================================
   GAP-ANALYSE
   ============================================================ */

export interface CoverageGapAnalysisRequest {
  age: number;
  hasChildren: boolean;
  hasMortgage: boolean;
  bufferMonths: number;
  hasPrivateHealth: boolean;
  hasPrivateDisability: boolean;
  hasCriticalIllness: boolean;
  hasTravel: boolean;
  hasChildInsurance: boolean;
}

export interface RecommendedProduct {
  id: number;
  name: string;
  provider: string;
}

export interface CoverageGap {
  area: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  recommendedProducts?: RecommendedProduct[];
}

export interface CoverageGapAnalysisResponse {
  gaps: CoverageGap[];
}

export async function analyzeCoverageGaps(
  payload: CoverageGapAnalysisRequest,
): Promise<CoverageGapAnalysisResponse> {
  return fetchJson('/insurance/analysis/gaps', {
    method: 'POST',
    body: payload,
  });
}

/* ============================================================
   KATALOG
   ============================================================ */

export interface InsuranceProductDto {
  id: number;
  name: string;
  description?: string;
  canBuyPrivately: boolean;
  providerName: string;
  providerWebsite?: string | null;
  categories: string[];
}

export async function getInsuranceProducts(): Promise<InsuranceProductDto[]> {
  return fetchJson('/insurance/products');
}
