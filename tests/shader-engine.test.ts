import assert from 'node:assert/strict';
import test from 'node:test';
import { LESSONS, LIMITS, challengeStatus, evaluateFieldAt, makeFragmentShader, normalizeParameter, validateExpression, validateParameters, type ShaderParams } from '../lib/shader-engine.ts';

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
