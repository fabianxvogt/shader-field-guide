export const LIMITS = { maxLength: 240, maxDepth: 8, maxOperations: 32, maxTokens: 96 } as const;
export const MAX_VARIATION_NAME_LENGTH = 80;

export type LessonId = 1 | 2 | 3 | 4 | 5;
export type ShaderParams = Record<string, number>;
export type Vec2 = { x: number; y: number };
export type ValueType = 'scalar' | 'vec2';
export type EvalEnvironment = Record<string, number | Vec2>;
export type LessonParameter = { key: string; label: string; min: number; max: number; step: number; help: string };
export type Lesson = { id: LessonId; title: string; short: string; tag: string; intro: string; lookFor: string; takeaway: string; expression: string; defaults: ShaderParams; parameters: LessonParameter[]; challenge: string };

export const LESSONS: Lesson[] = [
  { id: 1, title: 'Coordinates, made visible', short: 'Put a point on the map', tag: 'UV → signed space', intro: 'Every pixel arrives with a coordinate. Center it, stretch it, and watch a screen become a map you can reason about.', lookFor: 'A soft beacon follows the coordinate you choose.', takeaway: 'Signed coordinates put the origin in the middle, so distance and direction become easy to see.', expression: '1.0 - smoothstep(0.0, 0.035, length(p - u_center))', defaults: { centerX: 0.28, centerY: -0.12, contrast: 0.8, mix: 0.45, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'centerX', label: 'center X', min: -1.2, max: 1.2, step: 0.01, help: 'Move the origin left or right.' }, { key: 'centerY', label: 'center Y', min: -1.2, max: 1.2, step: 0.01, help: 'Move the origin up or down.' }, { key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Shape how quickly the field falls away.' }], challenge: 'Put the beacon exactly at the origin: center X 0 and center Y 0.' },
  { id: 2, title: 'Distance becomes shape', short: 'Carve a clean ring', tag: 'distance field', intro: 'Distance fields turn “how far?” into a reusable material. One subtraction gives you a ring; a smooth edge makes it feel drawn.', lookFor: 'The ring stays legible while its radius and edge softness change.', takeaway: 'A signed distance is a compact shape description: negative inside, zero at the edge, positive outside.', expression: '1.0 - smoothstep(0.0, u_softness, abs(length(p - u_center) - u_radius))', defaults: { centerX: 0, centerY: 0, radius: 0.36, softness: 0.025, contrast: 0.9, mix: 0.6, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'radius', label: 'radius', min: 0.12, max: 0.7, step: 0.01, help: 'Grow the ring from its center.' }, { key: 'softness', label: 'edge softness', min: 0.005, max: 0.12, step: 0.005, help: 'Blur the boundary without changing the field.' }, { key: 'centerX', label: 'center X', min: -0.8, max: 0.8, step: 0.01, help: 'Offset the shape in the field.' }], challenge: 'Make a crisp ring: radius between 0.30–0.42 and edge softness below 0.05.' },
  { id: 3, title: 'Color is composition', short: 'Compose a gradient', tag: 'field → palette', intro: 'Geometry is only half the picture. A field becomes a composition when contrast and color decide what the eye holds onto.', lookFor: 'A quiet gradient can feel more dimensional than a louder one.', takeaway: 'Mixing is a compositional choice: one scalar field can steer a whole palette.', expression: '0.5 + 0.5 * sin((p.x + p.y) * 4.0)', defaults: { centerX: 0, centerY: 0, contrast: 0.82, mix: 0.72, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Separate the quiets from the brights.' }, { key: 'mix', label: 'accent mix', min: 0, max: 1, step: 0.01, help: 'Blend more of the electric accent.' }, { key: 'centerX', label: 'palette bias', min: -0.8, max: 0.8, step: 0.01, help: 'Bias the field’s visual center.' }], challenge: 'Make the palette decisive: contrast at least 0.78 and accent mix at least 0.65.' },
  { id: 4, title: 'Repetition, without more code', short: 'Tile the field', tag: 'fract → repeat', intro: 'Repetition is a coordinate trick. Fold the space with fract, and one small shape becomes a whole fabric of decisions.', lookFor: 'The local cell stays the same while the larger rhythm changes.', takeaway: 'Transform the coordinates first; the shape expression can stay small and reusable.', expression: '0.5 + 0.5 * cos(q.x * 18.0) * cos(q.y * 18.0)', defaults: { centerX: 0, centerY: 0, cells: 4.2, contrast: 0.72, mix: 0.55, speed: 0.8, drift: 0.25 }, parameters: [{ key: 'cells', label: 'cell count', min: 2, max: 9, step: 0.1, help: 'Repeat the same local space.' }, { key: 'contrast', label: 'contrast', min: 0.2, max: 1.4, step: 0.01, help: 'Bring the woven pattern forward.' }, { key: 'mix', label: 'accent mix', min: 0, max: 1, step: 0.01, help: 'Tint the repeated cells.' }], challenge: 'Tune the fabric to five cells: cell count within 0.4 of 5.' },
  { id: 5, title: 'Animation is a moving coordinate', short: 'Make time tangible', tag: 'time → motion', intro: 'Animation does not need a new picture every frame. Add time to the coordinate, then let the same field breathe or travel.', lookFor: 'A slow offset creates motion you can still explain frame by frame.', takeaway: 'Time is just another bounded input. Move the space, and your existing equation becomes alive.', expression: '0.5 + 0.5 * cos(length(q) * 20.0 - u_time * u_speed * 2.0)', defaults: { centerX: 0, centerY: 0, cells: 3.4, contrast: 0.78, mix: 0.62, speed: 0.46, drift: 0.28 }, parameters: [{ key: 'speed', label: 'tempo', min: 0, max: 2, step: 0.01, help: 'Keep the pulse explainably slow.' }, { key: 'drift', label: 'drift', min: 0, max: 0.8, step: 0.01, help: 'Move the repeated space sideways.' }, { key: 'cells', label: 'cell count', min: 2, max: 8, step: 0.1, help: 'Choose how much detail moves.' }], challenge: 'Freeze a slow pulse: tempo at or below 0.55 and drift at or above 0.15.' },
];

const PARAMETER_RANGES: Record<string, readonly [number, number]> = { centerX: [-1.2, 1.2], centerY: [-1.2, 1.2], radius: [0.12, 0.7], softness: [0.005, 0.12], cells: [2, 9], contrast: [0.2, 1.4], mix: [0, 1], speed: [0, 2], drift: [0, 0.8] };
const FUNCTION_ARITY: Record<string, number> = { sin: 1, cos: 1, abs: 1, length: 1, fract: 1, floor: 1, smoothstep: 3, mix: 3, dot: 2, min: 2, max: 2, pow: 2, clamp: 3, vec2: 2 };
const IDENTIFIER_TYPES: Record<string, ValueType> = { p: 'vec2', q: 'vec2', u_center: 'vec2', u_radius: 'scalar', u_softness: 'scalar', u_cells: 'scalar', u_contrast: 'scalar', u_mix: 'scalar', u_speed: 'scalar', u_drift: 'scalar', u_time: 'scalar' };
const MEMBER_NAMES = new Set(['x', 'y']);
const OPERATOR_SET = new Set(['+', '-', '*', '/']);

type Token = { kind: 'number' | 'identifier' | 'operator' | 'punctuation' | 'eof'; text: string; start: number };
type Ast = { kind: 'number'; value: number } | { kind: 'name'; name: string } | { kind: 'member'; object: Ast; property: 'x' | 'y' } | { kind: 'unary'; operator: '+' | '-'; argument: Ast } | { kind: 'binary'; operator: '+' | '-' | '*' | '/'; left: Ast; right: Ast } | { kind: 'call'; name: string; args: Ast[] };
type ParseResult = { ok: true; ast: Ast; depth: number; tokens: number } | { ok: false; message: string; column: number };

function tokenize(expression: string): { ok: true; tokens: Token[] } | { ok: false; message: string; column: number } {
  const tokens: Token[] = [];
  let index = 0;
  while (index < expression.length) {
    const char = expression[index];
    if (/\s/.test(char)) { index += 1; continue; }
    const numeric = expression.slice(index).match(/^(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?/);
    if (numeric) {
      const value = Number(numeric[0]);
      if (!Number.isFinite(value)) return { ok: false, message: 'Numeric literal must be finite', column: index + 1 };
      tokens.push({ kind: 'number', text: numeric[0], start: index }); index += numeric[0].length; continue;
    }
    const identifier = expression.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) { tokens.push({ kind: 'identifier', text: identifier[0], start: index }); index += identifier[0].length; continue; }
    if (OPERATOR_SET.has(char)) { tokens.push({ kind: 'operator', text: char, start: index }); index += 1; continue; }
    if ('(),.'.includes(char)) { tokens.push({ kind: 'punctuation', text: char, start: index }); index += 1; continue; }
    return { ok: false, message: 'Character is not part of the bounded expression grammar', column: index + 1 };
  }
  tokens.push({ kind: 'eof', text: '', start: expression.length });
  return { ok: true, tokens };
}

function parserError(token: Token, message: string) { return { ok: false as const, message, column: token.start + 1 }; }

class ExpressionParser {
  private index = 0;
  private maxDepth = 0;
  private readonly tokens: Token[];
  constructor(tokens: Token[]) { this.tokens = tokens; }
  parse(): ParseResult {
    const ast = this.parseAdditive(0);
    if (!ast.ok) return ast;
    const next = this.peek();
    if (next.kind !== 'eof') return parserError(next, 'Expected an operator or the end of the expression');
    const type = inferType(ast.node);
    if (!type.ok) return parserError(this.peek(), type.message);
    if (type.type !== 'scalar') return parserError(this.peek(), 'The expression must produce one scalar field value');
    return { ok: true, ast: ast.node, depth: this.maxDepth, tokens: this.tokens.length - 1 };
  }
  private peek() { return this.tokens[this.index]; }
  private take() { const token = this.peek(); this.index += 1; return token; }
  private parseAdditive(depth: number): { ok: true; node: Ast } | { ok: false; message: string; column: number } {
    let left = this.parseMultiplicative(depth);
    while (left.ok && (this.peek().text === '+' || this.peek().text === '-')) { const operator = this.take().text as '+' | '-'; const right = this.parseMultiplicative(depth); if (!right.ok) return right; left = { ok: true, node: { kind: 'binary', operator, left: left.node, right: right.node } }; }
    return left;
  }
  private parseMultiplicative(depth: number): { ok: true; node: Ast } | { ok: false; message: string; column: number } {
    let left = this.parseUnary(depth);
    while (left.ok && (this.peek().text === '*' || this.peek().text === '/')) { const operator = this.take().text as '*' | '/'; const right = this.parseUnary(depth); if (!right.ok) return right; left = { ok: true, node: { kind: 'binary', operator, left: left.node, right: right.node } }; }
    return left;
  }
  private parseUnary(depth: number): { ok: true; node: Ast } | { ok: false; message: string; column: number } {
    if (this.peek().text === '+' || this.peek().text === '-') { const operator = this.take().text as '+' | '-'; const argument = this.parseUnary(depth); return argument.ok ? { ok: true, node: { kind: 'unary', operator, argument: argument.node } } : argument; }
    return this.parsePrimary(depth);
  }
  private parsePrimary(depth: number): { ok: true; node: Ast } | { ok: false; message: string; column: number } {
    const token = this.peek();
    if (token.kind === 'number') { this.take(); return { ok: true, node: { kind: 'number', value: Number(token.text) } }; }
    if (token.text === '(') {
      this.take(); const nextDepth = depth + 1; this.maxDepth = Math.max(this.maxDepth, nextDepth); if (nextDepth > LIMITS.maxDepth) return parserError(token, `Expression nesting exceeds depth ${LIMITS.maxDepth}`);
      const inner = this.parseAdditive(nextDepth); if (!inner.ok) return inner; if (this.peek().text !== ')') return parserError(this.peek(), 'Expected a closing parenthesis'); this.take(); return inner;
    }
    if (token.kind !== 'identifier') return parserError(token, 'Expected a number, name, or function call');
    this.take();
    if (FUNCTION_ARITY[token.text] !== undefined) return this.parseCall(token, depth);
    if (IDENTIFIER_TYPES[token.text] === undefined) return parserError(token, `Unknown name “${token.text}”`);
    if (this.peek().text === '.') {
      this.take(); const property = this.take(); if (property.kind !== 'identifier' || !MEMBER_NAMES.has(property.text)) return parserError(property, 'Only .x and .y members are allowed');
      return { ok: true, node: { kind: 'member', object: { kind: 'name', name: token.text }, property: property.text as 'x' | 'y' } };
    }
    if (this.peek().text === '(') return parserError(token, `“${token.text}” is not a callable function`);
    return { ok: true, node: { kind: 'name', name: token.text } };
  }
  private parseCall(token: Token, depth: number): { ok: true; node: Ast } | { ok: false; message: string; column: number } {
    if (this.peek().text !== '(') return parserError(token, `Function ${token.text} needs parentheses`);
    this.take(); const nextDepth = depth + 1; this.maxDepth = Math.max(this.maxDepth, nextDepth); if (nextDepth > LIMITS.maxDepth) return parserError(token, `Expression nesting exceeds depth ${LIMITS.maxDepth}`);
    const args: Ast[] = [];
    if (this.peek().text !== ')') {
      while (true) { const arg = this.parseAdditive(nextDepth); if (!arg.ok) return arg; args.push(arg.node); if (this.peek().text !== ',') break; this.take(); }
    }
    if (this.peek().text !== ')') return parserError(this.peek(), 'Expected a closing parenthesis after function arguments');
    this.take();
    if (args.length !== FUNCTION_ARITY[token.text]) return parserError(token, `${token.text} expects ${FUNCTION_ARITY[token.text]} argument${FUNCTION_ARITY[token.text] === 1 ? '' : 's'}`);
    const type = inferCallType(token.text, args);
    if (!type.ok) return parserError(token, type.message);
    return { ok: true, node: { kind: 'call', name: token.text, args } };
  }
}

function inferCallType(name: string, args: Ast[]): { ok: true; type: ValueType } | { ok: false; message: string } {
  const types = args.map((arg) => inferType(arg));
  if (types.some((type) => !type.ok)) return { ok: false, message: 'Invalid nested expression' };
  const values = types.map((type) => type.ok ? type.type : 'scalar');
  if (name === 'vec2') return values.every((type) => type === 'scalar') ? { ok: true, type: 'vec2' } : { ok: false, message: 'vec2 expects scalar components' };
  if (['sin', 'cos', 'fract', 'floor'].includes(name)) return values[0] === 'scalar' ? { ok: true, type: 'scalar' } : { ok: false, message: `${name} expects a scalar` };
  if (name === 'length') return values[0] === 'vec2' ? { ok: true, type: 'scalar' } : { ok: false, message: 'length expects a vec2' };
  if (name === 'dot') return values[0] === 'vec2' && values[1] === 'vec2' ? { ok: true, type: 'scalar' } : { ok: false, message: 'dot expects two vec2 values' };
  if (name === 'smoothstep') return values.every((type) => type === 'scalar') ? { ok: true, type: 'scalar' } : { ok: false, message: 'smoothstep expects scalar values' };
  if (name === 'pow') return values.every((type) => type === 'scalar') ? { ok: true, type: 'scalar' } : { ok: false, message: 'pow expects scalar values' };
  if (['min', 'max', 'clamp', 'mix'].includes(name)) return values.every((type) => type === 'scalar') ? { ok: true, type: 'scalar' } : { ok: false, message: `${name} is limited to scalar arguments in this guide` };
  if (name === 'abs') return { ok: true, type: values[0] };
  return { ok: false, message: `Unsupported function ${name}` };
}

function inferType(ast: Ast): { ok: true; type: ValueType } | { ok: false; message: string } {
  if (ast.kind === 'number') return { ok: true, type: 'scalar' };
  if (ast.kind === 'name') return IDENTIFIER_TYPES[ast.name] ? { ok: true, type: IDENTIFIER_TYPES[ast.name] } : { ok: false, message: `Unknown name “${ast.name}”` };
  if (ast.kind === 'member') return { ok: true, type: 'scalar' };
  if (ast.kind === 'unary') return inferType(ast.argument);
  if (ast.kind === 'call') return inferCallType(ast.name, ast.args);
  const left = inferType(ast.left); const right = inferType(ast.right); if (!left.ok || !right.ok) return { ok: false, message: 'Invalid nested expression' };
  if (ast.operator === '+' || ast.operator === '-') return left.type === right.type ? { ok: true, type: left.type } : { ok: false, message: 'Add and subtract require matching types' };
  if (left.type === 'scalar' || right.type === 'scalar' || left.type === right.type) return { ok: true, type: left.type === 'vec2' || right.type === 'vec2' ? 'vec2' : 'scalar' };
  return { ok: false, message: 'Those values cannot be multiplied or divided' };
}

function parseExpression(expression: string): ParseResult {
  const tokenized = tokenize(expression); if (!tokenized.ok) return tokenized;
  if (tokenized.tokens.length - 1 > LIMITS.maxTokens) return { ok: false, message: `Expression has more than ${LIMITS.maxTokens} tokens`, column: tokenized.tokens[LIMITS.maxTokens]?.start + 1 || 1 };
  return new ExpressionParser(tokenized.tokens).parse();
}

export type ExpressionValidation = { ok: true } | { ok: false; message: string; column: number };
export function validateExpression(expression: string): ExpressionValidation {
  if (!expression.trim()) return { ok: false, message: 'Expression is empty', column: 1 };
  if (expression.length > LIMITS.maxLength) return { ok: false, message: `Expression is ${expression.length} chars; cap is ${LIMITS.maxLength}`, column: LIMITS.maxLength + 1 };
  if (/\b(for|while|do|if|else|switch|case|struct|void|main|macro|define|return)\b/i.test(expression)) return { ok: false, message: 'Control flow and macros are not allowed in field expressions', column: 1 };
  const operationCount = (expression.match(/[+\-*/]/g) || []).length;
  if (operationCount > LIMITS.maxOperations) return { ok: false, message: `Expression has ${operationCount} operations; cap is ${LIMITS.maxOperations}`, column: 1 };
  const parsed = parseExpression(expression);
  return parsed.ok ? { ok: true } : parsed;
}

export function normalizeParameter(lesson: Lesson, key: string, value: number): { ok: true; value: number } | { ok: false; message: string } {
  const schema = lesson.parameters.find((parameter) => parameter.key === key);
  if (!schema) return { ok: false, message: `“${key}” is not a control in Lesson ${lesson.id}` };
  if (!Number.isFinite(value)) return { ok: false, message: `${schema.label} must be finite` };
  return { ok: true, value: Math.min(schema.max, Math.max(schema.min, value)) };
}

export function validateParameters(lesson: Lesson, params: unknown): { ok: true } | { ok: false; message: string } {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return { ok: false, message: 'Parameters must be an object' };
  const record = params as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const range = PARAMETER_RANGES[key];
    if (!range) return { ok: false, message: `Unknown parameter “${key}”` };
    const value = record[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, message: `Parameter “${key}” must be finite` };
    if (value < range[0] || value > range[1]) return { ok: false, message: `Parameter “${key}” must be between ${range[0]} and ${range[1]}` };
  }
  for (const parameter of lesson.parameters) {
    const value = record[parameter.key];
    if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, message: `Missing finite parameter “${parameter.key}”` };
    if (value < parameter.min || value > parameter.max) return { ok: false, message: `Parameter “${parameter.key}” is outside this lesson’s range` };
  }
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
  field = clamp(field, 0.0, 1.0);
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

function safeNumber(value: number) { return Number.isFinite(value) ? Math.max(-1000, Math.min(1000, value)) : 0; }
function fract(value: number) { return value - Math.floor(value); }
function vec2Map(value: Vec2, fn: (entry: number) => number): Vec2 { return { x: fn(value.x), y: fn(value.y) }; }
function asVec2(value: number | Vec2): Vec2 { return typeof value === 'number' ? { x: value, y: value } : value; }
function asScalar(value: number | Vec2) { return typeof value === 'number' ? value : 0; }

function evalAst(ast: Ast, env: EvalEnvironment): number | Vec2 {
  if (ast.kind === 'number') return ast.value;
  if (ast.kind === 'name') return env[ast.name] ?? 0;
  if (ast.kind === 'member') { const object = asVec2(evalAst(ast.object, env)); return object[ast.property]; }
  if (ast.kind === 'unary') { const value = evalAst(ast.argument, env); return typeof value === 'number' ? safeNumber(ast.operator === '-' ? -value : value) : vec2Map(value, (entry) => safeNumber(ast.operator === '-' ? -entry : entry)); }
  if (ast.kind === 'binary') {
    const left = evalAst(ast.left, env); const right = evalAst(ast.right, env);
    const operation = (a: number, b: number) => ast.operator === '+' ? a + b : ast.operator === '-' ? a - b : ast.operator === '*' ? a * b : Math.abs(b) < 0.000001 ? 0 : a / b;
    if (typeof left === 'number' && typeof right === 'number') return safeNumber(operation(left, right));
    const a = asVec2(left); const b = asVec2(right); return { x: safeNumber(operation(a.x, b.x)), y: safeNumber(operation(a.y, b.y)) };
  }
  const args = ast.args.map((arg) => evalAst(arg, env));
  const scalarArgs = args.map(asScalar);
  if (ast.name === 'vec2') return { x: safeNumber(scalarArgs[0]), y: safeNumber(scalarArgs[1]) };
  if (ast.name === 'sin') return safeNumber(Math.sin(scalarArgs[0]));
  if (ast.name === 'cos') return safeNumber(Math.cos(scalarArgs[0]));
  if (ast.name === 'abs') return typeof args[0] === 'number' ? Math.abs(args[0]) : vec2Map(args[0] as Vec2, Math.abs);
  if (ast.name === 'fract') return fract(scalarArgs[0]);
  if (ast.name === 'floor') return Math.floor(scalarArgs[0]);
  if (ast.name === 'length') { const value = args[0] as Vec2; return safeNumber(Math.hypot(value.x, value.y)); }
  if (ast.name === 'dot') { const a = args[0] as Vec2; const b = args[1] as Vec2; return safeNumber(a.x * b.x + a.y * b.y); }
  if (ast.name === 'smoothstep') { const edge0 = scalarArgs[0]; const edge1 = scalarArgs[1]; const t = Math.max(0, Math.min(1, Math.abs(edge1 - edge0) < 0.000001 ? 0 : (scalarArgs[2] - edge0) / (edge1 - edge0))); return t * t * (3 - 2 * t); }
  if (ast.name === 'mix') return safeNumber(scalarArgs[0] * (1 - scalarArgs[2]) + scalarArgs[1] * scalarArgs[2]);
  if (ast.name === 'min') return safeNumber(Math.min(scalarArgs[0], scalarArgs[1]));
  if (ast.name === 'max') return safeNumber(Math.max(scalarArgs[0], scalarArgs[1]));
  if (ast.name === 'pow') return safeNumber(Math.pow(Math.max(0, scalarArgs[0]), scalarArgs[1]));
  if (ast.name === 'clamp') return safeNumber(Math.max(scalarArgs[1], Math.min(scalarArgs[2], scalarArgs[0])));
  return 0;
}

function environmentFor(lesson: Lesson, params: ShaderParams, time: number, x: number, y: number, width: number, height: number): EvalEnvironment {
  const value = (key: string, fallback: number) => Number.isFinite(params[key]) ? params[key] : fallback;
  const p = { x: x * (width / height), y };
  let q = { ...p };
  if (lesson.id >= 4) q = { x: fract(p.x * value('cells', 5)) - 0.5, y: fract(p.y * value('cells', 5)) - 0.5 };
  if (lesson.id >= 5) q.x += Math.sin(time * value('speed', 0.8)) * value('drift', 0.25);
  return { p, q, u_center: { x: value('centerX', 0), y: value('centerY', 0) }, u_radius: value('radius', 0.35), u_softness: value('softness', 0.025), u_cells: value('cells', 5), u_contrast: value('contrast', 0.7), u_mix: value('mix', 0.5), u_speed: value('speed', 0.8), u_drift: value('drift', 0.25), u_time: time };
}

export function evaluateFieldAt(expression: string, lesson: Lesson, params: ShaderParams, time: number, x: number, y: number, width: number, height: number): number {
  const parsed = parseExpression(expression); if (!parsed.ok) return 0;
  const raw = asScalar(evalAst(parsed.ast, environmentFor(lesson, params, time, x, y, width, height)));
  const field = Math.max(0, Math.min(1, safeNumber(raw)));
  return Math.max(0, Math.min(1, Math.pow(field, 1 / Math.max(0.2, Number.isFinite(params.contrast) ? params.contrast : 0.7))));
}

function expressionFacts(expression: string) {
  const parsed = parseExpression(expression); if (!parsed.ok) return parsed;
  const calls = new Set<string>(); const identifiers = new Set<string>();
  const visit = (node: Ast) => { if (node.kind === 'name') identifiers.add(node.name); if (node.kind === 'call') { calls.add(node.name); node.args.forEach(visit); } if (node.kind === 'member') visit(node.object); if (node.kind === 'unary') visit(node.argument); if (node.kind === 'binary') { visit(node.left); visit(node.right); } };
  visit(parsed.ast); return { ok: true as const, calls, identifiers };
}

function variedField(expression: string, lesson: Lesson, params: ShaderParams) {
  const samples = [[-0.7, -0.4], [-0.15, 0.3], [0, 0], [0.05, 0], [0.35, -0.2], [0.8, 0.65]];
  const values = samples.map(([x, y]) => evaluateFieldAt(expression, lesson, params, 0.63, x, y, 1, 1));
  return values.every(Number.isFinite) && Math.max(...values) - Math.min(...values) > 0.04;
}

export function challengeStatus(lesson: Lesson, params: ShaderParams, expression: string) {
  const facts = expressionFacts(expression); const varied = variedField(expression, lesson, params);
  if (!facts.ok) return { pass: false, label: 'invalid expression' };
  if (lesson.id === 1) return { pass: Math.abs(params.centerX ?? 99) < 0.05 && Math.abs(params.centerY ?? 99) < 0.05 && facts.calls.has('length') && facts.identifiers.has('u_center') && varied, label: 'origin' };
  if (lesson.id === 2) return { pass: (params.radius ?? 0) >= 0.3 && (params.radius ?? 0) <= 0.42 && (params.softness ?? 1) < 0.05 && facts.calls.has('length') && facts.identifiers.has('u_radius') && varied, label: 'ring' };
  if (lesson.id === 3) return { pass: (params.contrast ?? 0) >= 0.78 && (params.mix ?? 0) >= 0.65 && facts.calls.has('sin') && varied, label: 'contrast' };
  if (lesson.id === 4) return { pass: Math.abs((params.cells ?? 0) - 5) <= 0.4 && facts.calls.has('cos') && facts.identifiers.has('q') && varied, label: 'five cells' };
  return { pass: (params.speed ?? 99) <= 0.55 && (params.drift ?? 0) >= 0.15 && facts.calls.has('cos') && facts.identifiers.has('u_time') && varied, label: 'slow pulse' };
}

export function makeConfig(lesson: Lesson, params: ShaderParams, expression = lesson.expression) { return { format: 'shader-field-guide-config', version: 1, lessonId: lesson.id, lesson: lesson.title, expression, parameters: params, limits: LIMITS }; }
