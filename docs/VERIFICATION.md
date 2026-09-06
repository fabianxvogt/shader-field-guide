# Verification record

## Local checks

- `npm run test` covers all five lesson expressions, generated fragment source, adversarial grammar/arity/type cases, explicit caps, finite/range parameter validation, CPU fallback use of the edited expression, and all five meaningful challenge properties including rejection of constant `0.0`.
- `npm run lint` is the source hygiene check.
- `npm run build` is the production compilation check.

## Repair evidence

- The editable source now parses a bounded expression grammar with token count, nesting, operator, arity, and scalar/vector type checks before GLSL generation.
- UI and WebMCP parameter writes clamp only known current-lesson controls; non-finite, unknown, and imported out-of-range values are rejected. Portable notebook names and files are capped.
- Canvas fallback calls the same parsed expression evaluator used for challenge sampling, with the same lesson coordinate transforms and post-field clamp/pow steps.
- Notebook hydration shows a loading state, merges any early in-memory save with the stored envelope, and cannot replace that early work with the pre-hydration snapshot. Bounded deletion tombstones keep intentional deletes from returning after union merges. Writes merge against the latest localStorage envelope, detect equal-revision read-back conflicts, retain in-memory work when storage writes fail, and report cross-tab conflicts; this is safe conflict behavior, not a linearizability claim.

## Deferred by instruction

No browser/CUA, GitHub publication, Site registration/deployment, or actual-device visual review was performed. The root owner must independently inspect the exact source and actual visuals before granting that gate.

## Limits

The renderer prefers WebGL2. When unavailable it uses a bounded Canvas 2D approximation so the learning loop remains usable. The product does not claim GPU driver timeout guarantees, universal browser support, or formal learning efficacy. The local notebook is device-local unless the user exports its versioned JSON.
