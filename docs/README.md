# Project docs

- [SOURCES.md](SOURCES.md) — primary Khronos references used for the GLSL/WebGL contract.
- [VERIFICATION.md](VERIFICATION.md) — local verification evidence and intentionally deferred checks.

The project is Catalog ID 62. The root delivery standard is the governing release contract. This app is a creative/product tool, so completion requires a useful edit loop, undo/reset, local save/reopen, useful export, and clear errors.

## Public source and release status

- Public ordinary source: [github.com/fabianxvogt/shader-field-guide](https://github.com/fabianxvogt/shader-field-guide), branch `codex/v1`.
- Accepted product source: `35f5d4005835df184d106b4a96d122d2b95296fc` (CSS-only shared output-button sizing repair).
- Public preview: [shader-field-guide.fabian523417.chatgpt.site](https://shader-field-guide.fabian523417.chatgpt.site), Site version 6 from saved source revision `0ef3da730762ec5f3d6559e2762b197dd24b835a` and unchanged runtime product `35f5d4005835df184d106b4a96d122d2b95296fc`.
- Versions 4 and 5 are retained as obsolete undeployed candidates. The clean public runtime package contains 59 logical payload files.
- No CI workflow is configured; local checks are not CI evidence.
- The preview is not a full-v1, human, device, or sustained-performance acceptance claim. Isolated QA covered WebGL2, bounded GLSL edit/compile, notebook save/reload/load/delete/reload, and two-tab convergence. Actual 35f desktop/narrow smoke passed output-control reachability at 1280px and 390px with no page/console errors. Post-deploy HTTP proof found the root as `200 text/html` and all 15 served client assets byte-matching the reviewed manifest; Cloudflare HTML transformation is expected and documented.
