import assert from 'node:assert/strict';
import test from 'node:test';
import { downloadBlob, downloadText, DOWNLOAD_CLEANUP_DELAY_MS, requestPngBlob } from '../lib/export-utils.ts';
import { hydrateNotebook, mergeVariations, parseNotebook, persistNotebook, type NotebookStorage, type Variation } from '../lib/notebook-storage.ts';
import { LESSONS, LIMITS, challengeStatus, evaluateFieldAt, makeConfig, makeFragmentShader, normalizeParameter, validateExpression, validateParameters, type ShaderParams } from '../lib/shader-engine.ts';

void test('all five lessons have valid bounded expressions and generated source', () => {
  assert.equal(LESSONS.length, 5);
  for (const lesson of LESSONS) {
    assert.deepEqual(validateExpression(lesson.expression), { ok: true });
    const source = makeFragmentShader(lesson, lesson.expression);
    assert.match(source, /#version 300 es/);
    assert.ok(source.includes(`float field = ${lesson.expression};`));
  }
});

void test('validator rejects injection, control flow, unbounded size, and deep nesting', () => {
  assert.equal(validateExpression('p.x; gl_FragColor = vec4(1.0)').ok, false);
  assert.equal(validateExpression('for(p.x)').ok, false);
  assert.equal(validateExpression('x'.repeat(LIMITS.maxLength + 1)).ok, false);
  assert.equal(validateExpression('(((((((((p.x)))))))))').ok, false);
  assert.equal(validateExpression('unknownThing + p.x').ok, false);
  for (const malformed of ['p p', '1..2', 'sin', 'sin()', 'length(1, 2)', '1e309']) assert.equal(validateExpression(malformed).ok, false, malformed);
});

void test('parameter boundaries are finite, schema-aware, and range-aware', () => {
  assert.deepEqual(normalizeParameter(LESSONS[4], 'speed', 99), { ok: true, value: 2 });
  assert.equal(normalizeParameter(LESSONS[4], 'speed', Number.NaN).ok, false);
  assert.equal(normalizeParameter(LESSONS[4], 'not-a-control', 0).ok, false);
  assert.equal(validateParameters(LESSONS[4], { speed: 0.4, drift: 0.2, cells: 3.4 }).ok, true);
  assert.equal(validateParameters(LESSONS[4], { speed: 1e308, drift: 0.2, cells: 3.4 }).ok, false);
  assert.equal(validateParameters(LESSONS[4], { speed: 0.4, drift: 0.2, cells: 3.4, injected: 1 }).ok, false);
  assert.equal(validateParameters(LESSONS[4], { speed: 0.4, drift: 0.2 }).ok, false);
});

void test('CPU fallback evaluates the same edited expression entry point', () => {
  const lesson = LESSONS[0];
  assert.equal(evaluateFieldAt('0.0', lesson, lesson.defaults, 0, 0, 0, 960, 640), 0);
  const left = evaluateFieldAt('p.x', lesson, lesson.defaults, 0, -0.7, 0, 960, 640);
  const right = evaluateFieldAt('p.x', lesson, lesson.defaults, 0, 0.7, 0, 960, 640);
  assert.notEqual(left, right);
});

void test('challenge checks reject a constant wrong expression for every lesson', () => {
  const passingParams: ShaderParams[] = [
    { centerX: 0, centerY: 0, contrast: 0.8, mix: 0.7 },
    { centerX: 0, centerY: 0, radius: 0.36, softness: 0.02, contrast: 0.8, mix: 0.7 },
    { contrast: 0.8, mix: 0.7 },
    { cells: 5, contrast: 0.8, mix: 0.7 },
    { speed: 0.4, drift: 0.2, cells: 3.4, contrast: 0.8, mix: 0.7 },
  ];
  for (const [index, lesson] of LESSONS.entries()) assert.equal(challengeStatus(lesson, passingParams[index], '0.0').pass, false, lesson.title);
});

void test('challenge checks inspect meaningful lesson properties', () => {
  assert.equal(challengeStatus(LESSONS[0], { centerX: 0, centerY: 0 }, LESSONS[0].expression).pass, true);
  assert.equal(challengeStatus(LESSONS[0], { centerX: 0.4, centerY: 0 }, LESSONS[0].expression).pass, false);
  assert.equal(challengeStatus(LESSONS[3], { cells: 5 }, LESSONS[3].expression).pass, true);
  assert.equal(challengeStatus(LESSONS[4], { speed: 0.4, drift: 0.2 }, LESSONS[4].expression).pass, true);
});

void test('exports contain real parseable fragment source and configuration', async () => {
  const lesson = LESSONS[1];
  const expression = 'length(p) - u_radius';
  const source = makeFragmentShader(lesson, expression);
  const configText = JSON.stringify(makeConfig(lesson, lesson.defaults, expression));
  const downloaded: Blob[] = [];
  let cleanup: (() => void) | undefined;
  const environment = {
    createAnchor: () => ({ href: '', download: '', rel: '', click: () => undefined, remove: () => undefined }),
    appendAnchor: () => undefined,
    createObjectURL: (blob: Blob) => { downloaded.push(blob); return `blob:${downloaded.length}`; },
    revokeObjectURL: () => undefined,
    scheduleCleanup: (callback: () => void) => { cleanup = callback; },
  };
  downloadText(source, 'lesson.frag', 'text/plain', environment);
  downloadText(configText, 'lesson.json', 'application/json', environment);
  assert.equal(await downloaded[0].text(), source);
  const parsed = JSON.parse(await downloaded[1].text()) as { format: string; version: number; expression: string };
  assert.equal(parsed.format, 'shader-field-guide-config');
  assert.equal(parsed.version, 1);
  assert.equal(parsed.expression, expression);
  cleanup?.();
});

void test('download lifecycle defers URL and anchor cleanup after the click', () => {
  const events: string[] = [];
  let cleanup: (() => void) | undefined;
  let revoked = '';
  const anchor = { href: '', download: '', rel: '', click: () => events.push('click'), remove: () => events.push('remove') };
  const result = downloadBlob(new Blob(['source'], { type: 'text/plain' }), 'lesson.frag', {
    createAnchor: () => anchor,
    appendAnchor: () => events.push('append'),
    createObjectURL: () => 'blob:lesson',
    revokeObjectURL: (url) => { revoked = url; events.push('revoke'); },
    scheduleCleanup: (callback, delayMs) => { assert.equal(delayMs, DOWNLOAD_CLEANUP_DELAY_MS); cleanup = callback; },
  });
  assert.equal(result.filename, 'lesson.frag');
  assert.deepEqual(events, ['append', 'click']);
  assert.equal(revoked, '');
  cleanup?.();
  assert.deepEqual(events, ['append', 'click', 'remove', 'revoke']);
});

void test('PNG capture reports valid output only and recovers from null or throw', async () => {
  const valid = await requestPngBlob({ toBlob: (callback) => callback(new Blob(['png'], { type: 'image/png' })) });
  assert.equal(valid.ok, true);
  if (valid.ok) assert.equal(await valid.blob.text(), 'png');

  const missing = await requestPngBlob({ toBlob: (callback) => callback(null) });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.match(missing.message, /Try again/);

  const thrown = await requestPngBlob({ toBlob: () => { throw new Error('canvas unavailable'); } });
  assert.equal(thrown.ok, false);
  if (!thrown.ok) assert.match(thrown.message, /Try again/);
});

function makeVariation(id: string, name: string, lessonId: 1 | 2 = 2): Variation {
  const lesson = LESSONS[lessonId - 1];
  return { id, name, lessonId, expression: lesson.expression, params: lesson.defaults, savedAt: '2026-09-06T00:00:00.000Z' };
}

function memoryStorage(initial: string | null = null, failWrites = false): NotebookStorage & { value: string | null } {
  const storage = {
    value: initial,
    getItem: () => storage.value,
    setItem: (_key: string, value: string) => {
      if (failWrites) throw new Error('storage unavailable');
      storage.value = value;
    },
  };
  return storage;
}

void test('notebook hydration merges an early save and survives a reload', () => {
  const stored = makeVariation('stored', 'Stored work');
  const early = makeVariation('early', 'Saved before hydration');
  const storage = memoryStorage(JSON.stringify({ version: 1, revision: 4, writer: 'old-tab', variations: [stored] }));
  const hydrated = hydrateNotebook(storage, [early]);
  assert.deepEqual(hydrated.variations.map((item) => item.id), ['early', 'stored']);
  const persisted = persistNotebook(storage, hydrated.variations, hydrated.revision, 'new-tab');
  assert.equal(persisted.ok, true);
  const reloaded = hydrateNotebook(storage).variations;
  assert.deepEqual(reloaded.map((item) => item.id), ['early', 'stored']);
  assert.equal(parseNotebook(storage.value)?.revision, 5);
});

void test('notebook storage failure retains in-memory work and malformed rows stay rejected', () => {
  const valid = makeVariation('valid', 'Valid work');
  const malformed = { ...makeVariation('bad', 'Bad work'), expression: 'p.x; alert(1)' };
  const parsed = parseNotebook(JSON.stringify({ version: 1, revision: 2, writer: 'bad-input', variations: [valid, malformed] }));
  assert.deepEqual(parsed?.variations.map((item) => item.id), ['valid']);

  const storage = memoryStorage(null, true);
  const persisted = persistNotebook(storage, [valid], 0, 'writer');
  assert.equal(persisted.ok, false);
  if (!persisted.ok) assert.equal(persisted.reason, 'full');
  assert.deepEqual(persisted.variations, [valid]);
  const hydrated = hydrateNotebook(storage, [valid]);
  assert.equal(hydrated.storageAvailable, true);
  assert.deepEqual(hydrated.variations, [valid]);
  assert.deepEqual(mergeVariations([valid], []), [valid]);
});
