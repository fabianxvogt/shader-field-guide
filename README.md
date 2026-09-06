# Shader Field Guide

Catalog 62 · standalone v1 browser app · branch `codex/v1`

Shader Field Guide is a five-lesson, browser-first learning lab for people who want to understand GLSL by changing one mathematical term and immediately seeing the result. It progresses through coordinates, distance/shape fields, color/composition, repetition, and animation. The useful outcome is a saved, portable shader creation: real GLSL source, a versioned configuration, and a PNG still.

## Status

**Building / root review required.** This checkout is intentionally not opened in a browser, published to GitHub, or deployed to Sites in this task. No public URL is claimed.

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

Source fixtures cover all five lesson expressions, generated GLSL, injection rejection, caps, and challenge properties. Build and lint are required before root review. Actual browser/WebGL/device behavior, keyboard-first journey, persistence after refresh, export reopen, visual quality, and fallback behavior still require the independent root review gate.

See [ROADMAP.md](ROADMAP.md), [docs/README.md](docs/README.md), and [docs/SOURCES.md](docs/SOURCES.md).
