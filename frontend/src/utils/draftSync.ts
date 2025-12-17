import { fetchJson } from './api';
import {
  InsuranceSnapshotRequest,
  saveInsuranceSnapshot,
  InsuranceSource,
  InsuranceType,
} from '@/api/insuranceApi';

export const DRAFT_KEYS = {
  plan: 'myPlan',
  planDiaries: 'myPlanDiaries',
  planPending: 'myPlanPendingSync',
  insurance: 'insuranceSnapshotDraft',
  insurancePending: 'insuranceSnapshotPending',
} as const;

export type PlanDraft = {
  persona?: string;
  phase?: string;
  needs?: string[];
};

export type PlanDiariesDraft = Record<string, string>;

export type InsuranceDraft = {
  source: InsuranceSource | null;
  types: InsuranceType[];
  uncertain: boolean;
};

const DEFAULT_PHASE = 'For omstilling';

function hasStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readJson<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function removeKey(key: string) {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readPlanDraft(): PlanDraft | null {
  return readJson<PlanDraft>(DRAFT_KEYS.plan);
}

export function writePlanDraft(draft: PlanDraft) {
  writeJson(DRAFT_KEYS.plan, draft);
}

export function readPlanDiariesDraft(): PlanDiariesDraft {
  return readJson<PlanDiariesDraft>(DRAFT_KEYS.planDiaries) ?? {};
}

export function writePlanDiariesDraft(diaries: PlanDiariesDraft) {
  writeJson(DRAFT_KEYS.planDiaries, diaries);
}

export function readInsuranceDraft(): InsuranceDraft | null {
  return readJson<InsuranceDraft>(DRAFT_KEYS.insurance);
}

export function writeInsuranceDraft(draft: InsuranceDraft) {
  writeJson(DRAFT_KEYS.insurance, draft);
}

export function markPlanPendingSync() {
  if (!hasStorage()) return;
  localStorage.setItem(DRAFT_KEYS.planPending, '1');
}

export function markInsurancePendingSync() {
  if (!hasStorage()) return;
  localStorage.setItem(DRAFT_KEYS.insurancePending, '1');
}

/**
 * Sync drafts created while unauthenticated to the backend once a user logs in.
 * Silently ignores failures to avoid blocking the UI.
 */
export async function syncAnonymousDrafts(): Promise<void> {
  if (!hasStorage()) return;

  await Promise.allSettled([syncPlanDraft(), syncInsuranceDraft()]);
}

async function syncPlanDraft() {
  if (!localStorage.getItem(DRAFT_KEYS.planPending)) return;

  const draft = readPlanDraft();
  if (!draft) {
    removeKey(DRAFT_KEYS.planPending);
    return;
  }

  const diaries = readPlanDiariesDraft();
  const persona = draft.persona ?? 'Annet';
  const phase = draft.phase ?? DEFAULT_PHASE;
  const needs = Array.isArray(draft.needs) ? draft.needs : [];

  try {
    // Save main plan + the diary for the primary phase
    await fetchJson('/plan/me', {
      method: 'PUT',
      body: {
        persona,
        phase,
        needs,
        diary: diaries[phase],
      },
    });

    // Persist all diary entries (endpoint merges per phase)
    for (const [diaryPhase, diary] of Object.entries(diaries)) {
      if (!diary) continue;
      await fetchJson('/plan/me', {
        method: 'PUT',
        body: {
          persona,
          phase: diaryPhase,
          needs,
          diary,
        },
      });
    }

    removeKey(DRAFT_KEYS.planPending);
    removeKey(DRAFT_KEYS.plan);
    removeKey(DRAFT_KEYS.planDiaries);
  } catch (err) {
    console.warn('Kunne ikke synkronisere lokalt lagret plan.', err);
  }
}

async function syncInsuranceDraft() {
  if (!localStorage.getItem(DRAFT_KEYS.insurancePending)) return;

  const draft = readInsuranceDraft();
  if (!draft) {
    removeKey(DRAFT_KEYS.insurancePending);
    return;
  }

  try {
    await saveInsuranceSnapshot({
      source: draft.source as InsuranceSnapshotRequest['source'],
      types: draft.types,
      uncertain: draft.uncertain,
    });
    removeKey(DRAFT_KEYS.insurancePending);
    removeKey(DRAFT_KEYS.insurance);
  } catch (err) {
    console.warn('Kunne ikke synkronisere lokalt lagret forsikringsvalg.', err);
  }
}
