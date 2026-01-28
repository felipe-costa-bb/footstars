# Coding Conventions

## Code Style
-   **JavaScript**: Use ES Modules (`import`/`export`).
-   **Type Hints**: Use JSDoc comments for all classes and methods. Do NOT migrate to TypeScript unless explicitly requested.
-   **Formatting**: Follow standard JS style (semicolons, 2-space indentation).

## Frontend (Vue 3)
-   **Components**: Use Single File Components (`.vue`).
-   **API**: Use `<script setup>` with the Composition API.
-   **State**: Use Pinia stores for global state (e.g., game session, settings).
-   **Styles**: Use Tailwind CSS utility classes. Avoid custom CSS in `<style>` blocks unless absolutely necessary.

## Testing
-   **Unit Tests**: Use `vitest`.
-   **Location**: `src/tests/` or alongside components in `__tests__` directories.
-   **Pattern**: Test business logic in `src/core/` thoroughly (determinism is key).

## State Management (Backend)
-   **Authority**: The `GameEngine` on the server is the single source of truth.
-   **Session**: `SessionManager` handles client connections and mapping to game instances.
