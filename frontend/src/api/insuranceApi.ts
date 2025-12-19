import { fetchJson } from '@/utils/api';

export type InsuranceSource = 'EMPLOYER' | 'PRIVATE' | 'UNKNOWN';

export type InsuranceType =
  | 'TREATMENT'
  | 'INCOME'
  | 'DISABILITY'
  | 'LIFE'
  | 'PENSION'
  | 'UNKNOWN';

export type InsuranceSnapshotRequest = {
  source: InsuranceSource;
  types: InsuranceType[];
  uncertain: boolean;
};

export async function saveInsuranceSnapshot(payload: InsuranceSnapshotRequest): Promise<void> {
  await fetchJson('/insurance/snapshot', {
    method: 'POST',
    body: payload,
  });
}
