# Verification record

## Local checks

- `npm run test` covers all five lesson expressions, generated fragment source, adversarial grammar/arity/type cases, explicit caps, finite/range parameter validation, CPU fallback use of the edited expression, and all five meaningful challenge properties including rejection of constant `0.0`.
- `npm run lint` is the source hygiene check.
- `npm run build` is the production compilation check.

## Repair evidence

- The editable source now parses a bounded expression grammar with token count, nesting, operator, arity, and scalar/vector type checks before GLSL generation.
- UI and WebMCP parameter writes clamp only known current-lesson controls; non-finite, unknown, and imported out-of-range values are rejected. Portable notebook names and files are capped.
- Canvas fallback calls the same parsed expression evaluator used for challenge sampling, with the same lesson coordinate transforms and post-field clamp/pow steps.
- Notebook hydration shows a loading state, merges any early in-memory save with the stored envelope, and cannot replace that early work with the pre-hydration snapshot. Bounded deletion tombstones keep intentional deletes from returning after union merges. Writes merge against the latest localStorage envelope, detect equal-revision read-back conflicts, retain in-memory work when storage writes fail, and report cross-tab conflicts. Canonical logical equality makes identical remote adoption a no-op, so active tabs quiesce; this is safe conflict behavior, not a linearizability claim.

## Deferred by instruction

The reviewed source is published on the configured public branch, and Site version 3 is publicly previewable from product SHA `011ef89dc5b0860b64c40b3e2dfd7ae091645e2a`. Separate isolated QA observed WebGL2, bounded GLSL edit/compile, notebook save/reload/load/delete/reload, and two-tab convergence. This publication lane used HTTP checks only: the root returned `200 text/html`, and all 15 public client assets returned `200` with hashes matching the reviewed package manifest. Cloudflare edge HTML transformation is expected; it is not treated as an asset mismatch. No browser/CUA was run in this publication lane, and no device, human, full-v1, or sustained-performance claim is made.

## Limits

The renderer prefers WebGL2. When unavailable it uses a bounded Canvas 2D approximation so the learning loop remains usable. The product does not claim GPU driver timeout guarantees, universal browser support, or formal learning efficacy. The local notebook is device-local unless the user exports its versioned JSON.
