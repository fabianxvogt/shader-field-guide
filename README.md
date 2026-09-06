# Shader Field Guide

Catalog 62 · standalone v1 browser app · branch `codex/v1`

Shader Field Guide is a five-lesson, browser-first learning lab for people who want to understand GLSL by changing one mathematical term and immediately seeing the result. It progresses through coordinates, distance/shape fields, color/composition, repetition, and animation. The useful outcome is a saved, portable shader creation: real GLSL source, a versioned configuration, and a PNG still.

## Status

**Public preview / full-v1 still open.** The reviewed ordinary source is public at [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`. The accepted runtime product remains `35f5d4005835df184d106b4a96d122d2b95296fc` (`Contain desktop shader output controls`), a CSS-only delta. Public Site version 6 is now live at [shader-field-guide.fabian523417.chatgpt.site](https://shader-field-guide.fabian523417.chatgpt.site), deployed from saved documentation/source revision `0ef3da730762ec5f3d6559e2762b197dd24b835a` with those unchanged `35f` product bytes. Its clean runtime package contains 59 logical payload files. The real 35f desktop/narrow smoke passed output-control reachability with WebGL2 and no page/console errors. This is not a full-v1, device, human, or sustained-performance claim.

No CI workflow is configured, so no CI success is claimed. The public preview is live; native export breadth, device parity, full-v1, and human acceptance remain separate root gates.

## Run locally

```sh
npm install
npm run dev
```

Production checks:

```sh
npm run test
npm run lint
npm run build
```

The app prefers WebGL2 and compiles a real fragment shader on each accepted expression. Browsers without WebGL2 use a bounded Canvas 2D evaluator with the same edited expression grammar and coordinate semantics. LocalStorage is device-local only; notebook JSON import/export is the portable path.

## Boundaries

The editable expression is capped at 240 characters, 96 tokens, nesting depth 8, and 32 operators. A real parser checks token order, function arity, scalar/vector types, finite numeric literals, and an allowlisted set of identifiers and math functions. Statements, assignments, comments, control flow, macros, loops, recursion, and arbitrary shader source are excluded. Notebook imports are capped at 64 KB, 20 variations, 80-character names, known parameters, and declared finite ranges. These are product bounds, not a claim of driver timeout guarantees.

## Evidence and next gate

Source fixtures cover all five lesson expressions, generated GLSL, injection rejection, caps, challenge properties, and the bounded export lifecycle. Separate isolated QA observed WebGL2, a real bounded GLSL edit/compile, notebook save/reload/load/delete/reload, and two-tab convergence. The accepted 35f browser smoke covered real 1280px and 390px viewports: output text and controls stayed reachable, WebGL2 was live, and no page/console errors were observed. The public root returned `200 text/html`; its real GLSL, notebook, Config JSON, and PNG controls are present. The clean release package contains 59 logical payload files; product bytes remain those accepted at `35f5d4…`. Cloudflare may transform HTML responses, so they are not compared as raw archive bytes. Build and lint are local checks, not CI evidence.

See [ROADMAP.md](ROADMAP.md), [docs/README.md](docs/README.md), and [docs/SOURCES.md](docs/SOURCES.md).
