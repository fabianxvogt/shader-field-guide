import {
  LESSONS,
  MAX_VARIATION_NAME_LENGTH,
  type LessonId,
  type ShaderParams,
  validateExpression,
  validateParameters,
} from './shader-engine.ts';

export { MAX_VARIATION_NAME_LENGTH } from './shader-engine.ts';

export const STORAGE_KEY = 'shader-field-guide:notebook:v1';
export const MAX_NOTEBOOK_BYTES = 64 * 1024;
export const MAX_VARIATIONS = 20;
export const MAX_DELETED_IDS = 256;

export type Variation = { lessonId: LessonId; expression: string; params: ShaderParams; id: string; name: string; savedAt: string };
export type NotebookState = { variations: Variation[]; deletedIds: string[] };
export type NotebookEnvelope = { version: 1; revision: number; writer: string; variations: Variation[]; deletedIds?: string[] };
export type NotebookStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function isPortableParams(value: unknown): value is ShaderParams {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'number' && Number.isFinite(entry));
}

export function isPortableVariation(value: unknown): value is Variation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Variation>;
  const lesson = LESSONS.find((entry) => entry.id === item.lessonId);
  return typeof item.id === 'string' && typeof item.name === 'string' && item.name.length > 0 && item.name.length <= MAX_VARIATION_NAME_LENGTH && typeof item.expression === 'string' && Boolean(lesson) && isPortableParams(item.params) && Boolean(lesson && validateParameters(lesson, item.params).ok) && validateExpression(item.expression).ok;
}

export function parseNotebook(raw: string | null): NotebookEnvelope | null {
  if (!raw || raw.length > MAX_NOTEBOOK_BYTES) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<NotebookEnvelope>;
    if (parsed.version !== 1 || typeof parsed.revision !== 'number' || !Number.isFinite(parsed.revision) || !Array.isArray(parsed.variations)) return null;
    const deletedIds = Array.isArray(parsed.deletedIds) ? [...new Set(parsed.deletedIds.filter((id): id is string => typeof id === 'string'))].slice(0, MAX_DELETED_IDS) : [];
    return { version: 1, revision: parsed.revision, writer: typeof parsed.writer === 'string' ? parsed.writer : 'unknown', variations: parsed.variations.filter(isPortableVariation).slice(0, MAX_VARIATIONS), deletedIds };
  } catch { return null; }
}

export function mergeVariations(primary: Variation[], secondary: Variation[]) {
  const byId = new Map<string, Variation>();
  for (const item of [...primary, ...secondary]) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()].slice(0, MAX_VARIATIONS);
}

export function mergeNotebookState(primary: NotebookState, secondary: NotebookState): NotebookState {
  const deletedIds = [...new Set([...primary.deletedIds, ...secondary.deletedIds])].slice(0, MAX_DELETED_IDS);
  const deleted = new Set(deletedIds);
  return { deletedIds, variations: mergeVariations(primary.variations, secondary.variations).filter((item) => !deleted.has(item.id)) };
}

function canonicalState(state: NotebookState) {
  const variations = state.variations
    .map((item) => ({ ...item, params: Object.fromEntries(Object.entries(item.params).sort(([a], [b]) => a.localeCompare(b))) }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify({ deletedIds: [...new Set(state.deletedIds)].sort(), variations });
}

export function notebookStatesEqual(first: NotebookState, second: NotebookState) {
  return canonicalState(first) === canonicalState(second);
}

export function adoptNotebookEvent(current: NotebookState, currentRevision: number, localWriter: string, incoming: NotebookEnvelope) {
  if (incoming.revision < currentRevision || (incoming.revision === currentRevision && incoming.writer === localWriter)) {
    return { accepted: false as const, changed: false as const, conflict: false as const, revision: currentRevision, state: current };
  }
  const merged = mergeNotebookState(current, { variations: incoming.variations, deletedIds: incoming.deletedIds ?? [] });
  const changed = !notebookStatesEqual(current, merged);
  return { accepted: true as const, changed, conflict: changed && incoming.revision === currentRevision, revision: Math.max(currentRevision, incoming.revision), state: changed ? merged : current };
}

export function deleteVariation(state: NotebookState, id: string) {
  if (!state.variations.some((item) => item.id === id)) return { ok: true as const, state };
  if (state.deletedIds.includes(id)) return { ok: true as const, state: { variations: state.variations.filter((item) => item.id !== id), deletedIds: state.deletedIds } };
  if (state.deletedIds.length >= MAX_DELETED_IDS) return { ok: false as const, message: 'Deletion history is full; export your notebook before deleting more.', state };
  return { ok: true as const, state: { variations: state.variations.filter((item) => item.id !== id), deletedIds: [...state.deletedIds, id] } };
}

export function notebookSaveStatus(hydrated: boolean) {
  return hydrated ? { ok: true as const } : { ok: false as const, message: 'Notebook is still loading. Try again.' };
}

export function hydrateNotebook(storage: NotebookStorage, earlyState: NotebookState = { variations: [], deletedIds: [] }) {
  try {
    const saved = parseNotebook(storage.getItem(STORAGE_KEY));
    const storedState = { variations: saved?.variations ?? [], deletedIds: saved?.deletedIds ?? [] };
    return { storageAvailable: true, revision: saved?.revision ?? 0, state: mergeNotebookState(earlyState, storedState) };
  } catch {
    return { storageAvailable: false, revision: 0, state: earlyState };
  }
}

export function persistNotebook(storage: NotebookStorage, state: NotebookState, currentRevision: number, writer: string) {
  let persisted: NotebookEnvelope | null;
  try {
    persisted = parseNotebook(storage.getItem(STORAGE_KEY));
  } catch {
    return { ok: false as const, reason: 'unavailable' as const, revision: currentRevision, state };
  }
  const merged = mergeNotebookState(state, { variations: persisted?.variations ?? [], deletedIds: persisted?.deletedIds ?? [] });
  const revision = Math.max(currentRevision, persisted?.revision ?? 0) + 1;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, revision, writer, variations: merged.variations, deletedIds: merged.deletedIds } satisfies NotebookEnvelope));
    const observed = parseNotebook(storage.getItem(STORAGE_KEY));
    if (observed && (observed.revision > revision || (observed.revision === revision && observed.writer !== writer))) {
      const conflictState = mergeNotebookState(merged, { variations: observed.variations, deletedIds: observed.deletedIds ?? [] });
      return { ok: false as const, reason: 'conflict' as const, revision: observed.revision, state: conflictState };
    }
    return { ok: true as const, revision, state: merged };
  } catch {
    return { ok: false as const, reason: 'full' as const, revision: currentRevision, state };
  }
}
