# Shader Field Guide

Catalog 62 · standalone v1 browser app · branch `codex/v1`

Shader Field Guide is a five-lesson, browser-first learning lab for people who want to understand GLSL by changing one mathematical term and immediately seeing the result. It progresses through coordinates, distance/shape fields, color/composition, repetition, and animation. The useful outcome is a saved, portable shader creation: real GLSL source, a versioned configuration, and a PNG still.

## Status

**Public preview / full-v1 still open.** The reviewed ordinary source is public at [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`. The current accepted product source is `35f5d4005835df184d106b4a96d122d2b95296fc` (`Contain desktop shader output controls`), a CSS-only delta. Public Site version 3 remains live at [shader-field-guide.fabian523417.chatgpt.site](https://shader-field-guide.fabian523417.chatgpt.site) from prior product source `011ef89dc5b0860b64c40b3e2dfd7ae091645e2a`. Version 4 from `8e6656d…` is retained as an obsolete undeployed candidate; private Site version 5 is saved from `35f5d4…` but is not deployed, pending independent 1280/390px confirmation and root decision. This is not a full-v1, device, human, or sustained-performance claim.

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

Source fixtures cover all five lesson expressions, generated GLSL, injection rejection, caps, challenge properties, and the bounded export lifecycle. Separate isolated QA on the prior accepted product source observed WebGL2, a real bounded GLSL edit/compile, notebook save/reload/load/delete/reload, and two-tab convergence. The public root returned `200 text/html`; its real GLSL, notebook, Config JSON, and PNG controls are present, and all 15 public client assets from the prior reviewed package returned `200` with matching manifest hashes. The shared output-button sizing delta is source-accepted at `35f5d4…`; actual 1280/390px text and control geometry remains a separate browser gate for private version 5. Cloudflare may transform HTML responses, so they are not compared as raw archive bytes. Build and lint are local checks, not CI evidence.

See [ROADMAP.md](ROADMAP.md), [docs/README.md](docs/README.md), and [docs/SOURCES.md](docs/SOURCES.md).
