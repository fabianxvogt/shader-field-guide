export const LIMITS = { maxLength: 240, maxDepth: 8, maxOperations: 32 } as const;
export type LessonId = 1 | 2 | 3 | 4 | 5;
export type ShaderParams = Record<string, number>;
export type LessonParameter = { key: string; label: string; min: number; max: number; step: number; help: string };
export type Lesson = { id: LessonId; title: string; short: string; tag: string; intro: string; lookFor: string; takeaway: string; expression: string; defaults: ShaderParams; parameters: LessonParameter[]; challenge: string };

export const LESSONS: Lesson[] = [
  { id: 1, title: 'Coordinates, made visible', short: 'Put a point on the map', tag: 'UV → signed space', intro: 'Every pixel arrives with a coordinate. Center it, stretch it, and watch a screen become a map you can reason about.', lookFor: 'A soft beacon follows the coordinate you choose.', takeaway: 'Signed coordinates put the origin in the middle, so distance and direction become easy to see.', expression: '1.0 - smoothstep(0.0, 0.035, length(p - u_center))', defaults: { centerX: 0.28, centerY: -0.12, contrast: 0.8, mix: 0.45, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'centerX', label: 'center X', min: -1.2, max: 1.2, step: 0.01, help: 'Move the origin left or right.' }, { key: 'centerY', label: 'center Y', min: -1.2, max: 1.2, step: 0.01, help: 'Move the origin up or down.' }, { key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Shape how quickly the field falls away.' }], challenge: 'Put the beacon exactly at the origin: center X 0 and center Y 0.' },
  { id: 2, title: 'Distance becomes shape', short: 'Carve a clean ring', tag: 'distance field', intro: 'Distance fields turn “how far?” into a reusable material. One subtraction gives you a ring; a smooth edge makes it feel drawn.', lookFor: 'The ring stays legible while its radius and edge softness change.', takeaway: 'A signed distance is a compact shape description: negative inside, zero at the edge, positive outside.', expression: '1.0 - smoothstep(0.0, u_softness, abs(length(p - u_center) - u_radius))', defaults: { centerX: 0, centerY: 0, radius: 0.36, softness: 0.025, contrast: 0.9, mix: 0.6, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'radius', label: 'radius', min: 0.12, max: 0.7, step: 0.01, help: 'Grow the ring from its center.' }, { key: 'softness', label: 'edge softness', min: 0.005, max: 0.12, step: 0.005, help: 'Blur the boundary without changing the field.' }, { key: 'centerX', label: 'center X', min: -0.8, max: 0.8, step: 0.01, help: 'Offset the shape in the field.' }], challenge: 'Make a crisp ring: radius between 0.30–0.42 and edge softness below 0.05.' },
  { id: 3, title: 'Color is composition', short: 'Compose a gradient', tag: 'field → palette', intro: 'Geometry is only half the picture. A field becomes a composition when contrast and color decide what the eye holds onto.', lookFor: 'A quiet gradient can feel more dimensional than a louder one.', takeaway: 'Mixing is a compositional choice: one scalar field can steer a whole palette.', expression: '0.5 + 0.5 * sin((p.x + p.y) * 4.0)', defaults: { centerX: 0, centerY: 0, contrast: 0.82, mix: 0.72, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Separate the quiets from the brights.' }, { key: 'mix', label: 'accent mix', min: 0, max: 1, step: 0.01, help: 'Blend more of the electric accent.' }, { key: 'centerX', label: 'palette bias', min: -0.8, max: 0.8, step: 0.01, help: 'Bias the field’s visual center.' }], challenge: 'Make the palette decisive: contrast at least 0.78 and accent mix at least 0.65.' },
  { id: 4, title: 'Repetition, without more code', short: 'Tile the field', tag: 'fract → repeat', intro: 'Repetition is a coordinate trick. Fold the space with fract, and one small shape becomes a whole fabric of decisions.', lookFor: 'The local cell stays the same while the larger rhythm changes.', takeaway: 'Transform the coordinates first; the shape expression can stay small and reusable.', expression: '0.5 + 0.5 * cos(q.x * 18.0) * cos(q.y * 18.0)', defaults: { centerX: 0, centerY: 0, cells: 4.2, contrast: 0.72, mix: 0.55, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'cells', label: 'cell count', min: 2, max: 9, step: 0.1, help: 'Repeat the same local space.' }, { key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Bring the woven pattern forward.' }, { key: 'mix', label: 'accent mix', min: 0, max: 1, step: 0.01, help: 'Tint the repeated cells.' }], challenge: 'Tune the fabric to five cells: cell count within 0.4 of 5.' },
  { id: 5, title: 'Animation is a moving coordinate', short: 'Make time tangible', tag: 'time → motion', intro: 'Animation does not need a new picture every frame. Add time to the coordinate, then let the same field breathe or travel.', lookFor: 'A slow offset creates motion you can still explain frame by frame.', takeaway: 'Time is just another bounded input. Move the space, and your existing equation becomes alive.', expression: '0.5 + 0.5 * cos(length(q) * 20.0 - u_time * u_speed * 2.0)', defaults: { centerX: 0, centerY: 0, cells: 3.4, contrast: 0.78, mix: 0.62, speed: 0.46, drift: 0.28 }, parameters: [{ key: 'speed', label: 'tempo', min: 0, max: 2, step: 0.01, help: 'Keep the pulse explainably slow.' }, { key: 'drift', label: 'drift', min: 0, max: 0.8, step: 0.01, help: 'Move the repeated space sideways.' }, { key: 'cells', label: 'cell count', min: 2, max: 8, step: 0.1, help: 'Choose how much detail moves.' }], challenge: 'Freeze a slow pulse: tempo at or below 0.55 and drift at or above 0.15.' },
];

const ALLOWED_IDENTIFIERS = new Set(['p', 'q', 'u_center', 'u_radius', 'u_softness', 'u_cells', 'u_contrast', 'u_mix', 'u_speed', 'u_drift', 'u_time', 'x', 'y', 'sin', 'cos', 'abs', 'length', 'fract', 'floor', 'smoothstep', 'mix', 'dot', 'min', 'max', 'pow', 'clamp']);
export type ExpressionValidation = { ok: true } | { ok: false; message: string; column: number };

export function validateExpression(expression: string): ExpressionValidation {
  if (!expression.trim()) return { ok: false, message: 'Expression is empty', column: 1 };
  if (expression.length > LIMITS.maxLength) return { ok: false, message: `Expression is ${expression.length} chars; cap is ${LIMITS.maxLength}`, column: LIMITS.maxLength + 1 };
  if (!/^[0-9A-Za-z_+\-*/().,\s]+$/.test(expression)) return { ok: false, message: 'Use only numbers, names, operators, commas, and parentheses', column: 1 };
  if (/[;#=:[\]{}]|\/\/|\/\*/.test(expression)) return { ok: false, message: 'Statements, comments, arrays, and assignments are not allowed', column: Math.max(1, expression.search(/[;#=:[\]{}]/)) + 1 };
  if (/\b(for|while|do|if|else|switch|case|struct|void|main|macro|define|return)\b/i.test(expression)) return { ok: false, message: 'Control flow and macros are not allowed in field expressions', column: 1 };
  let depth = 0; let maxDepth = 0;
  for (let index = 0; index < expression.length; index += 1) { if (expression[index] === '(') { depth += 1; maxDepth = Math.max(maxDepth, depth); } if (expression[index] === ')') depth -= 1; if (depth < 0) return { ok: false, message: 'Closing parenthesis has no matching opener', column: index + 1 }; }
  if (depth !== 0) return { ok: false, message: 'Parentheses do not balance', column: expression.length };
  if (maxDepth > LIMITS.maxDepth) return { ok: false, message: `Expression nesting is ${maxDepth}; cap is ${LIMITS.maxDepth}`, column: 1 };
  const operationCount = (expression.match(/[+\-*/]/g) || []).length;
  if (operationCount > LIMITS.maxOperations) return { ok: false, message: `Expression has ${operationCount} operations; cap is ${LIMITS.maxOperations}`, column: 1 };
  const identifiers = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const unknown = identifiers.find((identifier) => !ALLOWED_IDENTIFIERS.has(identifier));
  if (unknown) return { ok: false, message: `Unknown name “${unknown}”`, column: expression.indexOf(unknown) + 1 };
  return { ok: true };
}

export function makeFragmentShader(lesson: Lesson, expression: string) {
  return `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_softness;
uniform float u_cells;
uniform float u_contrast;
uniform float u_mix;
uniform float u_speed;
uniform float u_drift;
uniform int u_lesson;
out vec4 outColor;
void main() {
  vec2 p = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  vec2 q = p;
  if (u_lesson >= 4) q = fract(p * u_cells) - 0.5;
  if (u_lesson >= 5) q.x += sin(u_time * u_speed) * u_drift;
  // User expression is intentionally inserted on this single generated line.
  float field = ${expression};
  field = clamp(pow(field, 1.0 / max(u_contrast, 0.2)), 0.0, 1.0);
  vec3 deep = vec3(0.018, 0.11, 0.14);
  vec3 electric = vec3(0.05, 0.83, 0.70);
  vec3 ember = vec3(0.93, 0.22, 0.48);
  vec3 color = mix(deep, electric, field);
  color = mix(color, ember, clamp(u_mix, 0.0, 1.0) * field * 0.76);
  float vignette = smoothstep(1.65, 0.12, length(p));
  outColor = vec4(color * (0.68 + 0.32 * vignette), 1.0);
}`;
}

export function makeConfig(lesson: Lesson, params: ShaderParams, expression = lesson.expression) { return { format: 'shader-field-guide-config', version: 1, lessonId: lesson.id, lesson: lesson.title, expression, parameters: params, limits: LIMITS }; }
export function challengeStatus(lesson: Lesson, params: ShaderParams, expression: string) {
  if (lesson.id === 1) return { pass: Math.abs(params.centerX ?? 99) < 0.05 && Math.abs(params.centerY ?? 99) < 0.05, label: 'origin' };
  if (lesson.id === 2) return { pass: (params.radius ?? 0) >= 0.3 && (params.radius ?? 0) <= 0.42 && (params.softness ?? 1) < 0.05 && expression.includes('length'), label: 'ring' };
  if (lesson.id === 3) return { pass: (params.contrast ?? 0) >= 0.78 && (params.mix ?? 0) >= 0.65, label: 'contrast' };
  if (lesson.id === 4) return { pass: Math.abs((params.cells ?? 0) - 5) <= 0.4, label: 'five cells' };
  return { pass: (params.speed ?? 99) <= 0.55 && (params.drift ?? 0) >= 0.15, label: 'slow pulse' };
}
