# Project docs

- [SOURCES.md](SOURCES.md) — primary Khronos references used for the GLSL/WebGL contract.
- [VERIFICATION.md](VERIFICATION.md) — local verification evidence and intentionally deferred checks.

The project is Catalog ID 62. The root delivery standard is the governing release contract. This app is a creative/product tool, so completion requires a useful edit loop, undo/reset, local save/reopen, useful export, and clear errors.

## Public source and release status

- Public ordinary source: [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`.
- Accepted product source: `011ef89dc5b0860b64c40b3e2dfd7ae091645e2a`.
- Public preview: [shader-field-guide.fabian523417.chatgpt.site](https://shader-field-guide.fabian523417.chatgpt.site), Site version 3 deployed from that exact product source.
- No CI workflow is configured; local checks are not CI evidence.
- The preview is not a full-v1, human, device, or sustained-performance acceptance claim. Isolated QA covered WebGL2, bounded GLSL edit/compile, notebook save/reload/load/delete/reload, and two-tab convergence. Public HTTP checks covered the root and all 15 public client assets; Cloudflare HTML transformation is expected and documented.
