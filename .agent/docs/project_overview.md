# Project Overview

**Field Battle** is a strategic board-style soccer card game where two teams compete by moving a ball through zones (GK → Defense → Midfield → Attack → Goal) using dice rolls and player attributes.

## Architecture

The project is structured into three main layers:

1.  **Core Game Engine** (`src/core/`):
    -   A UI-agnostic, pure JavaScript (ES Modules) rule engine.
    -   Manages game state, player attributes, contest resolution, and simulation.
    -   Can run in a console environment or on a server.

2.  **Multiplayer Server** (`src/server/`):
    -   A Node.js server using `ws` for WebSocket communication.
    -   Manages sessions (`SessionManager`) and hosts authoritative `GameEngine` instances.
    -   Streams game events (`PASS`, `SHOT`, `GOAL`) to connected clients.

3.  **Client Application** (`client/`):
    -   **Current**: Migrating to a Vue 3 + Tailwind CSS Single Page Application (SPA).
    -   **Legacy**: A simple HTML/JS client in `public/` (served for testing).
    -   Connects to the server via WebSockets to visualize the match state.

## Folder Structure

-   `src/`: Backend and core logic.
    -   `core/`: Game engine entities (Player, Team, MatchState).
    -   `rules/`: Helper logic (RNG, Fatigue, SuperMove).
    -   `server/`: WebSocket server implementation.
    -   `cli/`: Console-based game runner/simulator.
    -   `data/`: JSON files defining teams and players.
-   `client/`: Vue 3 frontend source code.
-   `public/`: Static assets and legacy HTML client.
