# Technology Stack

## Summary
A unified JavaScript codebase using Node.js for the backend/logic and Vue 3 for the frontend, communicating via raw WebSockets.

## Backend (Node.js)
-   **Runtime**: Node.js (>=16.0.0).
-   **Module System**: ES Modules (`"type": "module"` in `package.json`).
-   **Dependencies**:
    -   `ws`: Lightweight WebSocket server.
    -   `vitest`: Unit testing framework.
-   **Key Concepts**: Object-Oriented Programming (Classes for `Player`, `Team`, `GameEngine`).

## Frontend (Vue 3)
-   **Framework**: Vue 3 (Composition API with `<script setup>`).
-   **Build Tool**: Vite.
-   **Styling**: Tailwind CSS.
-   **State Management**: Pinia (planned/in-progress).
-   **Router**: Vue Router.

## Protocol
-   **Transport**: WebSocket (`ws`).
-   **Format**: JSON messages.
-   **Pattern**:
    -   Client sends **Actions** (intent).
    -   Server sends **Events** (facts that happened) & **State Snapshots**.
