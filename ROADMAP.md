# Roadmap

## Now

- Classification: **INCREMENTAL** — accepted implementation repair backed by source fixtures; no browser/device performance or learning-efficacy claim.
- [x] Reviewed ordinary source published at [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`, exact accepted product/release source `eba27afc76ae24e9035de1eeca5fecde5f1cd245`.
- [x] Private Sites version 2 saved from the accepted source; it remains undeployed.
- [x] Independent review blockers repaired: parser grammar/type checks, finite/range parameter validation, edited-expression CPU fallback, challenge semantics, bounded notebook input, and storage hydration/merge guards.
- [x] Standalone repository rooted at this project, branch `codex/v1`.
- [x] Five progressive visual lessons with reviewed starting equations.
- [x] Real bounded expression validation and generated GLSL ES 3.00 fragment source.
- [x] WebGL2 renderer with transparent Canvas 2D fallback path.
- [x] Parameter editing, pause, reduced motion, reset, undo, checked challenges.
- [x] Local variation notebook with versioned JSON import/export.
- [x] GLSL + configuration export and PNG snapshot export.
- [x] Separate GLSL/config/PNG export actions with bounded download cleanup and visible PNG failure recovery.
- [x] Notebook reload repair: hydration loading state, early-save merge, storage-failure retention, durable deletion, equal-revision conflict recovery, and quiescent identical-tab adoption with source regression coverage.
- [x] Source fixtures, lint, and production build scripts.
- [x] Local source checks completed; no CI workflow is configured.

## Next — root review gate

- [ ] Root independently inspect exact source and actual visuals.
- [ ] Root run a fresh-user journey: equation → one edit → compile → challenge → save → reload → export.
- [ ] Root test malformed/oversized expression recovery, unsupported WebGL fallback, and export reopen.
- [ ] Root decide whether browser/CUA QA is authorized.
- [ ] Root verify the public source branch and independently decide whether the private Site/browser release gate is ready.

## Later

- [ ] Capture named-device WebGL2 performance observations and supported-browser matrix.
- [ ] Add reviewed source-line diagnostics after actual compiler logs are observed on target browsers.
- [ ] Consider a lesson-specific code diff view only if it improves learning without expanding the safe grammar.

## Done definition

This project is not marked released until root review confirms the advertised workflow end to end. Public source publication does not imply a public app, Site deployment, browser preview, full-v1, human, device, or performance acceptance claim.
