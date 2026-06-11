# AI Review Rules for Web3D TypeScript Repository

## Project Context

This repository is a Web3D TypeScript project based on React, Three.js, and react-three-fiber.

AI review should focus on practical risks in PR changes, not generic frontend suggestions.

## Review Priorities

1. TypeScript type safety
2. React Hook correctness
3. react-three-fiber lifecycle correctness
4. Web3D rendering performance
5. GPU / memory resource lifecycle
6. Interaction and state consistency
7. Asset loading and fallback behavior
8. Testing coverage

## TypeScript Rules

- Avoid unnecessary `any`.
- Avoid unsafe type assertions.
- Check null and undefined handling.
- Keep public API types stable.
- Ensure async errors are handled.

## React Rules

- Check Hook dependency arrays.
- Check cleanup in `useEffect`.
- Avoid unnecessary rerenders.
- Avoid React state updates inside high-frequency render loops unless necessary.

## Web3D Rules

- Avoid creating `Vector3`, `Matrix4`, `Color`, `Quaternion`, `Box3`, `Raycaster`, `Geometry`, `Material`, or `Texture` inside `useFrame` or render loops.
- Reuse objects where possible.
- Dispose GPU resources when no longer used:
  - `geometry.dispose()`
  - `material.dispose()`
  - `texture.dispose()`
  - `renderTarget.dispose()`
  - `controls.dispose()`
- Clean up event listeners, observers, animation frames, and post-processing resources.
- Check camera, renderer, and resize synchronization.
- Check pointer, mouse, touch, drag, selection, and raycast state consistency.
- Check asset loading failure handling.

## Testing Rules

Suggest tests when PR changes:

- rendering lifecycle
- resize behavior
- asset loading
- pointer / touch interaction
- resource cleanup
- public API behavior

## Output Rules

AI review output should include:

1. Risk Level: Low / Medium / High / Blocker
2. Key Findings
3. Web3D-Specific Risks
4. Testing Suggestions
5. Human Reviewer Focus

Rules:

- Be concise.
- Do not force issues.
- Do not comment on pure formatting unless it affects maintainability.
- Mark uncertain items as "needs human confirmation".
