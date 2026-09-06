'use client';
/* oxlint-disable next(no-img-element) */
/* oxlint-disable react(react-compiler) */

import {
  Download,
  FileJson,
  Gauge,
  History,
  ImageDown,
  Import,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  WandSparkles,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { downloadBlob, downloadText, requestPngBlob } from '@/lib/export-utils';
import {
  LESSONS,
  LIMITS,
  MAX_VARIATION_NAME_LENGTH,
  type Lesson,
  type LessonId,
  type ShaderParams,
  challengeStatus,
  evaluateFieldAt,
  makeConfig,
  makeFragmentShader,
  normalizeParameter,
  validateExpression,
  validateParameters,
} from '@/lib/shader-engine';

type RenderMode = 'webgl2' | 'fallback' | 'error';
type CompileState = 'clean' | 'draft' | 'error';
type Snapshot = { lessonId: LessonId; expression: string; params: ShaderParams };
type Variation = Snapshot & { id: string; name: string; savedAt: string };
type NotebookEnvelope = { version: 1; revision: number; writer: string; variations: Variation[] };

const STORAGE_KEY = 'shader-field-guide:notebook:v1';
const MAX_NOTEBOOK_BYTES = 64 * 1024;
const MAX_VARIATIONS = 20;
const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

function formatValue(value: number, step: number) {
  return step < 0.1 ? value.toFixed(2) : value.toFixed(1);
}

function makeVariationId() {
  return `variation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isPortableParams(value: unknown): value is ShaderParams {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value as Record<string, unknown>).every((entry) => typeof entry === 'number' && Number.isFinite(entry));
}

function isPortableVariation(value: unknown): value is Variation {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Variation>;
  const lesson = LESSONS.find((entry) => entry.id === item.lessonId);
  return typeof item.id === 'string' && typeof item.name === 'string' && item.name.length > 0 && item.name.length <= MAX_VARIATION_NAME_LENGTH && typeof item.expression === 'string' && Boolean(lesson) && isPortableParams(item.params) && Boolean(lesson && validateParameters(lesson, item.params).ok) && validateExpression(item.expression).ok;
}

function parseNotebook(raw: string | null): NotebookEnvelope | null {
  if (!raw || raw.length > MAX_NOTEBOOK_BYTES) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<NotebookEnvelope>;
    if (parsed.version !== 1 || typeof parsed.revision !== 'number' || !Number.isFinite(parsed.revision) || !Array.isArray(parsed.variations)) return null;
    return { version: 1, revision: parsed.revision, writer: typeof parsed.writer === 'string' ? parsed.writer : 'unknown', variations: parsed.variations.filter(isPortableVariation).slice(0, MAX_VARIATIONS) };
  } catch { return null; }
}

function mergeVariations(primary: Variation[], secondary: Variation[]) {
  const byId = new Map<string, Variation>();
  for (const item of [...primary, ...secondary]) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()].slice(0, MAX_VARIATIONS);
}

function getWebGL2(canvas: HTMLCanvasElement) {
  return canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }) as WebGL2RenderingContext | null;
}

function compileProgram(gl: WebGL2RenderingContext, fragmentSource: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('WebGL could not create a shader object.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || 'Unknown GLSL compiler error.';
      gl.deleteShader(shader);
      throw new Error(info.trim());
    }
    return shader;
  };
  let vertex: WebGLShader | null = null;
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    if (!program) throw new Error('WebGL could not create a program.');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || 'Unknown GLSL link error.';
      throw new Error(info.trim());
    }
    return program;
  } catch (error) {
    if (program) gl.deleteProgram(program);
    throw error;
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
  }
}

function drawFallback(ctx: CanvasRenderingContext2D, lesson: Lesson, expression: string, params: ShaderParams, time: number) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const image = ctx.createImageData(width, height);
  const aspect = width / height;
  const seconds = time;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = (x / width) * 2 - 1;
      const py = (y / height) * 2 - 1;
      const sx = px * aspect;
      const sy = py;
      const field = evaluateFieldAt(expression, lesson, params, seconds, sx / aspect, sy, width, height);
      const mix = Math.max(0, Math.min(1, params.mix));
      const r = (10 + field * 58) * (1 - mix) + (220 - field * 50) * mix;
      const g = (38 + field * 210) * (1 - mix) + (48 + field * 160) * mix;
      const b = (58 + field * 150) * (1 - mix) + (198 + field * 40) * mix;
      const index = (y * width + x) * 4;
      image.data[index] = r;
      image.data[index + 1] = g;
      image.data[index + 2] = b;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function formatCompileError(error: string) {
  const match = error.match(/(?:ERROR:\s*\d+:)?(\d+):\s*(.*)/i);
  return match ? `Fragment shader · generated line ${match[1]} · ${match[2]}` : `Fragment shader · ${error}`;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paramsRef = useRef<ShaderParams>({});
  const lessonRef = useRef<Lesson>(LESSONS[0]);
  const expressionRef = useRef(LESSONS[0].expression);
  const actionRefs = useRef<{ setParameter: (key: string, value: number) => { status: string; key?: string; value?: number; message?: string }; saveVariation: (name?: string) => { status: string; id?: string; name?: string } }>({ setParameter: () => ({ status: 'unavailable' }), saveVariation: () => ({ status: 'unavailable' }) });
  const [lessonIndex, setLessonIndex] = useState(0);
  const lesson = LESSONS[lessonIndex];
  const [params, setParams] = useState<ShaderParams>(lesson.defaults);
  const [draftExpression, setDraftExpression] = useState(lesson.expression);
  const [compiledExpression, setCompiledExpression] = useState(lesson.expression);
  const [compileState, setCompileState] = useState<CompileState>('clean');
  const [compileMessage, setCompileMessage] = useState('Ready to compile');
  const [renderMode, setRenderMode] = useState<RenderMode>('webgl2');
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [beforeImage, setBeforeImage] = useState('');
  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationName, setVariationName] = useState('My field study');
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [notice, setNotice] = useState('');
  const storageReadyRef = useRef(false);
  const storageRevisionRef = useRef(0);
  const storageWriterRef = useRef(makeVariationId());
  const challenge = useMemo(() => challengeStatus(lesson, params, compiledExpression), [compiledExpression, lesson, params]);

  useEffect(() => { lessonRef.current = lesson; paramsRef.current = params; expressionRef.current = compiledExpression; }, [compiledExpression, lesson, params]);

  useEffect(() => {
    try {
      const saved = parseNotebook(window.localStorage.getItem(STORAGE_KEY));
      if (saved) { storageRevisionRef.current = saved.revision; setVariations(saved.variations); }
    } catch { setNotice('Notebook storage is unavailable; exports still work.'); }
    storageReadyRef.current = true;
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;
    try {
      const persisted = parseNotebook(window.localStorage.getItem(STORAGE_KEY));
      const merged = mergeVariations(variations, persisted?.variations ?? []);
      const revision = Math.max(storageRevisionRef.current, persisted?.revision ?? 0) + 1;
      storageRevisionRef.current = revision;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, revision, writer: storageWriterRef.current, variations: merged } satisfies NotebookEnvelope));
      if (merged.length !== variations.length || merged.some((item, index) => item.id !== variations[index]?.id)) setVariations(merged);
    }
    catch { setNotice('Notebook storage is full; export a notebook to keep your work.'); }
  }, [variations]);

  useEffect(() => {
    const receiveNotebook = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const incoming = parseNotebook(event.newValue);
      if (incoming && incoming.revision > storageRevisionRef.current) { storageRevisionRef.current = incoming.revision; setVariations(incoming.variations); }
    };
    window.addEventListener('storage', receiveNotebook);
    return () => window.removeEventListener('storage', receiveNotebook);
  }, []);

  const setParameter = useCallback((key: string, value: number) => {
    const normalized = normalizeParameter(lessonRef.current, key, value);
    if (!normalized.ok) { setNotice(normalized.message); return { status: 'rejected', message: normalized.message }; }
    setHistory((previous) => [...previous.slice(-19), { lessonId: lessonRef.current.id, expression: expressionRef.current, params: { ...paramsRef.current } }]);
    setParams((previous) => ({ ...previous, [key]: normalized.value }));
    setChallengeComplete(false);
    return { status: 'updated', key, value: normalized.value };
  }, []);

  const saveVariation = useCallback((name = variationName) => {
    const trimmedName = (name.trim() || 'Untitled field').slice(0, MAX_VARIATION_NAME_LENGTH);
    const item: Variation = { id: makeVariationId(), name: trimmedName, lessonId: lessonRef.current.id, expression: expressionRef.current, params: { ...paramsRef.current }, savedAt: new Date().toISOString() };
    setVariations((previous) => mergeVariations([item], previous));
    setNotice(`Saved “${trimmedName}” to this device.`);
    return { status: 'saved', id: item.id, name: item.name };
  }, [variationName]);

  useEffect(() => { actionRefs.current = { setParameter, saveVariation }; }, [saveVariation, setParameter]);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: { name: string; title?: string; description: string; inputSchema: object; annotations?: object; execute: (input: unknown) => unknown }, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(modelContext.registerTool({
      name: 'set_field_parameter', title: 'Set a shader field parameter', description: 'Change one visible bounded parameter in the current Shader Field Guide lesson.',
      inputSchema: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'number' } }, required: ['key', 'value'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { const value = input as { key?: string; value?: number }; if (!value.key || typeof value.value !== 'number') throw new Error('key and numeric value are required'); const result = actionRefs.current.setParameter(value.key, value.value); if (result.status !== 'updated') throw new Error(result.message || 'Parameter was rejected'); return result; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(modelContext.registerTool({
      name: 'save_field_variation', title: 'Save current shader field variation', description: 'Save the current real shader expression and parameters to the local notebook.',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { return actionRefs.current.saveVariation((input as { name?: string }).name); },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 960; canvas.height = 640;
    const gl = getWebGL2(canvas);
    let animationFrame = 0;
    let program: WebGLProgram | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    const start = performance.now();
    if (gl) {
      try {
        const linkedProgram = compileProgram(gl, makeFragmentShader(lesson, compiledExpression));
        program = linkedProgram;
        const position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl['useProgram'](linkedProgram);
        const location = gl.getAttribLocation(linkedProgram, 'a_position');
        gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        setRenderMode('webgl2'); setCompileMessage('Live WebGL2 fragment shader');
        const draw = (now: number) => {
          const current = paramsRef.current;
          gl.viewport(0, 0, canvas.width, canvas.height); gl['useProgram'](linkedProgram);
          const uniform = (name: string) => gl.getUniformLocation(linkedProgram, name);
          gl.uniform2f(uniform('u_resolution'), canvas.width, canvas.height); gl.uniform1f(uniform('u_time'), paused || reducedMotion ? 0 : (now - start) / 1000);
          gl.uniform2f(uniform('u_center'), current.centerX ?? 0, current.centerY ?? 0); gl.uniform1f(uniform('u_radius'), current.radius ?? 0.35); gl.uniform1f(uniform('u_softness'), current.softness ?? 0.025); gl.uniform1f(uniform('u_cells'), current.cells ?? 5); gl.uniform1f(uniform('u_contrast'), current.contrast ?? 0.7); gl.uniform1f(uniform('u_mix'), current.mix ?? 0.5); gl.uniform1f(uniform('u_speed'), current.speed ?? 0.8); gl.uniform1f(uniform('u_drift'), current.drift ?? 0.25); gl.uniform1i(uniform('u_lesson'), lesson.id);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          const mini = miniCanvasRef.current?.getContext('2d');
          if (mini) { mini.canvas.width = 160; mini.canvas.height = 106; mini.drawImage(canvas, 0, 0, 160, 106); }
          animationFrame = requestAnimationFrame(draw);
        };
        animationFrame = requestAnimationFrame(draw);
      } catch (error) { setRenderMode('error'); setCompileState('error'); setCompileMessage(formatCompileError(error instanceof Error ? error.message : String(error))); }
    } else {
      ctx = canvas.getContext('2d');
      if (!ctx) { setRenderMode('error'); setCompileState('error'); setCompileMessage('No WebGL2 or Canvas 2D context is available in this browser.'); }
      else {
        setRenderMode('fallback'); setCompileMessage('WebGL2 unavailable · using bounded Canvas fallback');
        const draw = (now: number) => {
          drawFallback(ctx!, lessonRef.current, expressionRef.current, paramsRef.current, paused || reducedMotion ? 0 : (now - start) / 1000);
          const mini = miniCanvasRef.current?.getContext('2d');
          if (mini) { mini.canvas.width = 160; mini.canvas.height = 106; mini.drawImage(canvas, 0, 0, 160, 106); }
          animationFrame = requestAnimationFrame(draw);
        };
        animationFrame = requestAnimationFrame(draw);
      }
    }
    return () => { cancelAnimationFrame(animationFrame); if (program && gl) gl.deleteProgram(program); };
  }, [compiledExpression, lesson, paused, reducedMotion]);

  const selectLesson = (index: number) => {
    const next = LESSONS[index];
    setHistory((previous) => [...previous.slice(-19), { lessonId: lesson.id, expression: draftExpression, params: { ...params } }]);
    setLessonIndex(index); setParams(next.defaults); setDraftExpression(next.expression); setCompiledExpression(next.expression); setCompileState('clean'); setCompileMessage('Ready to explore'); setBeforeImage(''); setChallengeComplete(false);
  };

  const compileDraft = () => {
    const validation = validateExpression(draftExpression);
    if (!validation.ok) { setCompileState('error'); setCompileMessage(`${validation.message} (column ${validation.column})`); return; }
    const canvas = canvasRef.current; if (canvas) setBeforeImage(canvas.toDataURL('image/png'));
    setHistory((previous) => [...previous.slice(-19), { lessonId: lesson.id, expression: compiledExpression, params: { ...params } }]);
    setCompiledExpression(draftExpression); setCompileState('clean'); setCompileMessage('Compiling your bounded expression…'); setChallengeComplete(false);
  };

  const undo = () => {
    const snapshot = history.at(-1); if (!snapshot) return;
    const index = LESSONS.findIndex((item) => item.id === snapshot.lessonId);
    setHistory((previous) => previous.slice(0, -1)); setLessonIndex(index); setParams(snapshot.params); setDraftExpression(snapshot.expression); setCompiledExpression(snapshot.expression); setCompileState('clean'); setCompileMessage('Restored previous field'); setChallengeComplete(false);
  };

  const resetLesson = () => {
    setHistory((previous) => [...previous.slice(-19), { lessonId: lesson.id, expression: draftExpression, params: { ...params } }]);
    setParams(lesson.defaults); setDraftExpression(lesson.expression); setCompiledExpression(lesson.expression); setCompileState('clean'); setCompileMessage('Lesson reset to its reviewed starting point'); setBeforeImage(''); setChallengeComplete(false);
  };

  const loadVariation = (item: Variation) => {
    const index = LESSONS.findIndex((entry) => entry.id === item.lessonId);
    setLessonIndex(index); setParams(item.params); setDraftExpression(item.expression); setCompiledExpression(item.expression); setCompileState('clean'); setCompileMessage(`Restored “${item.name}”`); setBeforeImage(''); setChallengeComplete(false);
  };

  const exportNotebook = () => { downloadText(JSON.stringify({ format: 'shader-field-guide-notebook', version: 1, exportedAt: new Date().toISOString(), variations }, null, 2), 'shader-field-guide-notebook-v1.json', 'application/json'); setNotice('Notebook JSON exported. It can be reopened on another device.'); };
  const importNotebook = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > MAX_NOTEBOOK_BYTES) throw new Error(`Notebook is larger than the ${MAX_NOTEBOOK_BYTES / 1024} KB limit.`);
      const parsed = JSON.parse(await file.slice(0, MAX_NOTEBOOK_BYTES + 1).text()) as { format?: string; version?: number; variations?: Variation[] };
      if (parsed.format !== 'shader-field-guide-notebook' || parsed.version !== 1 || !Array.isArray(parsed.variations)) throw new Error('This is not a Shader Field Guide v1 notebook.');
      const valid = parsed.variations.filter(isPortableVariation);
      setVariations((previous) => mergeVariations(valid, previous)); setNotice(`Imported ${valid.length} variation${valid.length === 1 ? '' : 's'}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not read that notebook.'); }
  };
  const exportGLSL = () => {
    downloadText(makeFragmentShader(lesson, compiledExpression), `shader-field-guide-lesson-${lesson.id}.frag`);
    setNotice('GLSL source generated. Download started.');
  };
  const exportConfig = () => {
    downloadText(JSON.stringify(makeConfig(lesson, params, compiledExpression), null, 2), `shader-field-guide-lesson-${lesson.id}.json`, 'application/json');
    setNotice('Configuration JSON generated. Download started.');
  };
  const exportPNG = async () => {
    const canvas = canvasRef.current;
    if (!canvas) { setNotice('PNG export failed: the live canvas is not ready. Try again.'); return; }
    setNotice('Generating PNG still…');
    const result = await requestPngBlob(canvas);
    if (!result.ok) { setNotice(result.message); return; }
    try {
      downloadBlob(result.blob, `shader-field-guide-lesson-${lesson.id}.png`);
      setNotice('PNG still generated. Download started.');
    } catch {
      setNotice('PNG export failed to start the download. Try again.');
    }
  };

  return (
    <main className="guide-app">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><span>∿</span></div><div><p className="brand-name">Shader Field Guide</p><p className="brand-meta">A hands-on atlas of visual equations</p></div></div>
        <div className="topbar-actions"><span className="local-badge"><span className="status-dot" />Local notebook</span><Button variant="outline" size="sm" onClick={exportNotebook}><FileJson /> Export notebook</Button></div>
      </header>
      <div className="app-grid">
        <aside className="lesson-rail" aria-label="Shader lessons">
          <div className="rail-heading"><span className="eyebrow">PATH 01—05</span><span className="rail-count">{String(lessonIndex + 1).padStart(2, '0')} / 05</span></div>
          <nav className="lesson-list">{LESSONS.map((item, index) => <button key={item.id} className={`lesson-tab ${index === lessonIndex ? 'is-selected' : ''}`} onClick={() => selectLesson(index)} aria-current={index === lessonIndex ? 'step' : undefined}><span className="lesson-number">0{item.id}</span><span className="lesson-tab-copy"><strong>{item.title}</strong><small>{item.short}</small></span><span className="lesson-arrow" aria-hidden="true">↗</span></button>)}</nav>
          <div className="rail-note"><Lightbulb size={16} /><p><strong>How to use this.</strong><br />Change one term, look at the field, then name what moved.</p></div><p className="rail-footer">CATALOG 62 · BROWSER-FIRST · V1</p>
        </aside>
        <section className="workspace" aria-label="Shader lesson workspace">
          <div className="workspace-intro"><div><span className="eyebrow accent-eyebrow">COORDINATE LAB / {String(lesson.id).padStart(2, '0')}</span><h1>{lesson.title}</h1><p className="intro-copy">{lesson.intro}</p></div><div className="progress-orbit" aria-label={`${lesson.id} of 5 lessons complete visually`}>{LESSONS.map((item) => <span key={item.id} className={item.id <= lesson.id ? 'is-on' : ''} />)}</div></div>
          <div className="stage-card"><div className="stage-bar"><div className="stage-label"><Sparkles size={15} /><span>Live field / {lesson.tag}</span></div><div className="stage-actions"><span className={`engine-badge engine-${renderMode}`}><span />{renderMode === 'webgl2' ? 'WebGL2 live' : renderMode === 'fallback' ? 'Canvas fallback' : 'Renderer error'}</span><Button variant="ghost" size="sm" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume animation' : 'Pause animation'}>{paused ? <Play /> : <Pause />}{paused ? 'Resume' : 'Pause'}</Button></div></div><div className="canvas-shell"><canvas ref={canvasRef} aria-label={`Live visualization for ${lesson.title}`} /><div className="canvas-overlay overlay-top"><span>FRAGCOORD → FIELD</span><span>{paused ? 'PAUSED' : 'RUNNING'}</span></div><div className="canvas-overlay overlay-bottom"><span>SAFE EXPRESSION MODE</span><span>960 × 640</span></div></div><div className="stage-caption"><div><span className="caption-kicker">LOOK FOR</span><p>{lesson.lookFor}</p></div><div className="caption-rule" /><div><span className="caption-kicker">TAKEAWAY</span><p>{lesson.takeaway}</p></div></div></div>
          <div className="challenge-card"><div className="challenge-icon"><WandSparkles size={18} /></div><div className="challenge-copy"><span className="eyebrow">FIELD CHALLENGE</span><h2>{lesson.challenge}</h2><p>Checked from the saved parameters, not from a vague visual guess.</p></div><Button className={challengeComplete ? 'challenge-done' : ''} onClick={() => setChallengeComplete(challenge.pass)} disabled={challengeComplete}>{challengeComplete ? 'Challenge complete' : challenge.pass ? 'Check challenge' : 'Not ready yet'}</Button></div>
          {notice && <output className="notice"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notice"><XCircle size={15} /></button></output>}
        </section>
        <aside className="inspector" aria-label="Field controls and notebook">
          <section className="panel controls-panel"><div className="panel-heading"><div><span className="eyebrow">01 / NUDGE A TERM</span><h2>Field controls</h2></div><Gauge size={18} /></div><div className="control-list">{lesson.parameters.map((control) => <div className="control-row" key={control.key}><div className="control-label"><label htmlFor={`control-${control.key}`}>{control.label}</label><output>{formatValue(params[control.key] ?? control.min, control.step)}</output></div><Slider id={`control-${control.key}`} min={control.min} max={control.max} step={control.step} value={[params[control.key] ?? control.min]} onValueChange={(value) => setParameter(control.key, Number((value as readonly number[])[0] ?? control.min))} aria-label={control.label} /><p>{control.help}</p></div>)}</div></section>
          <section className="panel expression-panel"><div className="panel-heading"><div><span className="eyebrow">02 / BOUNDED SOURCE</span><h2>Expression</h2></div><span className="cap-badge">{LIMITS.maxLength} chars max</span></div><p className="panel-copy">Edit the highlighted term only. The guide accepts numbers, named uniforms, vectors, and a small math vocabulary—no loops, macros, recursion, or hidden workload.</p><label className="sr-only" htmlFor="expression">Bounded GLSL expression</label><textarea id="expression" className={`code-input ${compileState === 'error' ? 'has-error' : ''}`} value={draftExpression} onChange={(event) => { setDraftExpression(event.target.value); setCompileState('draft'); setCompileMessage('Draft changed · compile to see it live'); }} spellCheck={false} rows={4} /><div className="source-meta"><span>depth ≤ {LIMITS.maxDepth}</span><span>ops ≤ {LIMITS.maxOperations}</span><span>GLSL ES 3.00</span></div><Button className="compile-button" onClick={compileDraft}><Sparkles /> Compile expression</Button><output className={`compile-status status-${compileState}`}><span className="status-icon">{compileState === 'error' ? '!' : compileState === 'draft' ? '·' : '✓'}</span><span>{compileMessage}</span></output></section>
          <section className="panel compare-panel"><div className="panel-heading"><div><span className="eyebrow">03 / SEE THE SHIFT</span><h2>Before / after</h2></div><History size={18} /></div><div className="compare-strip"><div className="compare-tile">{beforeImage ? <img src={beforeImage} alt="Previous compiled field" /> : <div className="compare-empty">Compile once<br />to set a baseline</div>}<span>BEFORE</span></div><div className="compare-arrow">→</div><div className="compare-tile current-tile"><canvas className="mini-canvas" ref={miniCanvasRef} /><span>NOW</span></div></div></section>
          <section className="panel notebook-panel"><div className="panel-heading"><div><span className="eyebrow">04 / KEEP YOUR THREAD</span><h2>Personal notebook</h2></div><Save size={18} /></div><div className="save-row"><input value={variationName} onChange={(event) => setVariationName(event.target.value)} aria-label="Variation name" /><Button size="sm" onClick={() => saveVariation()}><Save /> Save</Button></div><div className="notebook-actions"><Button variant="outline" size="sm" onClick={undo} disabled={!history.length}><Undo2 /> Undo</Button><Button variant="outline" size="sm" onClick={resetLesson}><RotateCcw /> Reset</Button></div><div className="variation-list">{variations.length === 0 ? <p className="empty-note">Saved variations stay on this device. Export the notebook for a portable copy.</p> : variations.slice(0, 4).map((item) => <div className="variation-item" key={item.id}><button className="variation-load" aria-label={`Load ${item.name}`} onClick={() => loadVariation(item)}><span className="variation-swatch" /><span><strong>{item.name}</strong><small>Lesson {String(item.lessonId).padStart(2, '0')}</small></span></button><button className="icon-button" onClick={() => setVariations((previous) => previous.filter((entry) => entry.id !== item.id))} aria-label={`Delete ${item.name}`}><Trash2 size={14} /></button></div>)}</div><div className="file-actions"><Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}><Import /> Import</Button><Button variant="ghost" size="sm" onClick={exportNotebook}><Download /> Export</Button><input ref={fileInputRef} type="file" accept="application/json,.json" onChange={importNotebook} hidden /></div></section>
          <section className="panel export-panel"><div className="panel-heading"><div><span className="eyebrow">05 / TAKE IT WITH YOU</span><h2>Useful outputs</h2></div><Download size={18} /></div><p className="panel-copy">Leave with the exact source, the parameter configuration, or a PNG still—not a screenshot of the interface.</p><div className="export-grid"><Button variant="outline" size="sm" onClick={exportGLSL}><Download /> GLSL source</Button><Button variant="outline" size="sm" onClick={exportConfig}><FileJson /> Config JSON</Button><Button variant="outline" size="sm" onClick={exportPNG}><ImageDown /> PNG still</Button></div><label className="motion-toggle"><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><span>Reduce motion</span><small>freeze time-driven movement</small></label></section>
          <p className="support-note">WebGL2 is preferred for live GLSL. If unavailable, the Canvas fallback keeps the lesson interactive. This app does not claim driver-timeout guarantees.</p>
        </aside>
      </div>
    </main>
  );
}
