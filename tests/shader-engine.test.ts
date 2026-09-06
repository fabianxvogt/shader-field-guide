import assert from 'node:assert/strict';
import test from 'node:test';
import { LESSONS, LIMITS, challengeStatus, makeFragmentShader, validateExpression } from '../lib/shader-engine.ts';

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
});

void test('challenge checks inspect meaningful lesson properties', () => {
  assert.equal(challengeStatus(LESSONS[0], { centerX: 0, centerY: 0 }, LESSONS[0].expression).pass, true);
  assert.equal(challengeStatus(LESSONS[0], { centerX: 0.4, centerY: 0 }, LESSONS[0].expression).pass, false);
  assert.equal(challengeStatus(LESSONS[3], { cells: 5 }, LESSONS[3].expression).pass, true);
  assert.equal(challengeStatus(LESSONS[4], { speed: 0.4, drift: 0.2 }, LESSONS[4].expression).pass, true);
});
