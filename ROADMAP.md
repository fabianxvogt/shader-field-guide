# Roadmap

## Now

- Classification: **INCREMENTAL** — accepted implementation repair backed by source fixtures; no browser/device performance or learning-efficacy claim.
- [x] Reviewed ordinary source published at [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`, exact accepted product source `011ef89dc5b0860b64c40b3e2dfd7ae091645e2a`.
- [x] Site version 3 deployed as a public preview from exact product source `011ef89dc5b0860b64c40b3e2dfd7ae091645e2a`: [shader-field-guide.fabian523417.chatgpt.site](https://shader-field-guide.fabian523417.chatgpt.site).
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
- [x] Post-deploy HTTP proof: root `200 text/html`; 15/15 public client assets `200` and matching the reviewed package manifest. Root HTML is recorded as Cloudflare-transformed runtime output, not a raw archive comparison.

## Next — root review gate

- [ ] Root independently inspect exact source and actual visuals.
- [ ] Root run a fresh-user journey: equation → one edit → compile → challenge → save → reload → export.
- [ ] Root test malformed/oversized expression recovery, unsupported WebGL fallback, and export reopen.
- [x] Separate isolated browser QA accepted the bounded notebook/WebGL scope; no browser/CUA rerun was used during publication.
- [x] Public preview gate: isolated notebook/WebGL QA passed before deployment and the served public asset proof matched the reviewed package.
- [ ] Root continue the separate full-v1, human, device, and sustained-performance review; no such claim is made here.

## Later

- [ ] Capture named-device WebGL2 performance observations and supported-browser matrix.
- [ ] Add reviewed source-line diagnostics after actual compiler logs are observed on target browsers.
- [ ] Consider a lesson-specific code diff view only if it improves learning without expanding the safe grammar.

## Done definition

This project is not marked full-v1 released until root review confirms the advertised workflow end to end. Public source publication and this public preview do not imply full-v1, human, device, or sustained-performance acceptance.
