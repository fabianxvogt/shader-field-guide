# Roadmap

## Now

- Classification: **INCREMENTAL** — implementation repair backed by source fixtures; no browser/device performance or learning-efficacy claim.
- [x] Independent review blockers repaired: parser grammar/type checks, finite/range parameter validation, edited-expression CPU fallback, challenge semantics, bounded notebook input, and storage hydration/merge guards.
- [x] Standalone repository rooted at this project, branch `codex/v1`.
- [x] Five progressive visual lessons with reviewed starting equations.
- [x] Real bounded expression validation and generated GLSL ES 3.00 fragment source.
- [x] WebGL2 renderer with transparent Canvas 2D fallback path.
- [x] Parameter editing, pause, reduced motion, reset, undo, checked challenges.
- [x] Local variation notebook with versioned JSON import/export.
- [x] GLSL + configuration export and PNG snapshot export.
- [x] Source fixtures, lint, and production build scripts.

## Next — root review gate

- [ ] Root independently inspect exact source and actual visuals.
- [ ] Root run a fresh-user journey: equation → one edit → compile → challenge → save → reload → export.
- [ ] Root test malformed/oversized expression recovery, unsupported WebGL fallback, and export reopen.
- [ ] Root decide whether browser/CUA QA is authorized.
- [ ] Root decide whether GitHub publication and Sites deployment are authorized.

## Later

- [ ] Capture named-device WebGL2 performance observations and supported-browser matrix.
- [ ] Add reviewed source-line diagnostics after actual compiler logs are observed on target browsers.
- [ ] Consider a lesson-specific code diff view only if it improves learning without expanding the safe grammar.

## Done definition

This project is not marked released until root review confirms the advertised workflow end to end. No deployment or publication is implied by this local v1 checkout.
