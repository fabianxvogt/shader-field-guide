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

export type Variation = { lessonId: LessonId; expression: string; params: ShaderParams; id: string; name: string; savedAt: string };
export type NotebookEnvelope = { version: 1; revision: number; writer: string; variations: Variation[] };
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
    return { version: 1, revision: parsed.revision, writer: typeof parsed.writer === 'string' ? parsed.writer : 'unknown', variations: parsed.variations.filter(isPortableVariation).slice(0, MAX_VARIATIONS) };
  } catch { return null; }
}

export function mergeVariations(primary: Variation[], secondary: Variation[]) {
  const byId = new Map<string, Variation>();
  for (const item of [...primary, ...secondary]) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()].slice(0, MAX_VARIATIONS);
}

export function hydrateNotebook(storage: NotebookStorage, earlyVariations: Variation[] = []) {
  try {
    const saved = parseNotebook(storage.getItem(STORAGE_KEY));
    return { storageAvailable: true, revision: saved?.revision ?? 0, variations: mergeVariations(earlyVariations, saved?.variations ?? []) };
  } catch {
    return { storageAvailable: false, revision: 0, variations: earlyVariations };
  }
}

export function persistNotebook(storage: NotebookStorage, variations: Variation[], currentRevision: number, writer: string) {
  let persisted: NotebookEnvelope | null;
  try {
    persisted = parseNotebook(storage.getItem(STORAGE_KEY));
  } catch {
    return { ok: false as const, reason: 'unavailable' as const, revision: currentRevision, variations };
  }
  const merged = mergeVariations(variations, persisted?.variations ?? []);
  const revision = Math.max(currentRevision, persisted?.revision ?? 0) + 1;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, revision, writer, variations: merged } satisfies NotebookEnvelope));
    return { ok: true as const, revision, variations: merged };
  } catch {
    return { ok: false as const, reason: 'full' as const, revision: currentRevision, variations };
  }
}
