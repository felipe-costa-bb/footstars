# Field Battle - Implementation TODO

## 📋 Project Overview
Strategic board-style soccer card game using zone-based gameplay (GK → Defense → Midfield → Attack → Goal) with dice-based randomness.

**Current Phase:** Multiplayer web application with Vue 3 + Tailwind UI  
**Status:** WebSocket server implemented, migrating to modern frontend

---

## ✅ Milestone 0 — Project Scaffold (Day 0) ✓ COMPLETE

- [x] Create project structure with proper folders
- [x] Initialize package.json with ES Modules support
- [x] Set up folder structure:
  - `/src/core` - UI-agnostic game engine
  - `/src/rules` - Rule helpers (dice, fatigue, super move)
  - `/src/cli` - Console runner and I/O
  - `/src/data` - JSON teams
  - `/src/types` - JSDoc typedefs
  - `/src/tests` - Unit tests (optional)

---

## 📦 Milestone 1 — Data Model & JSON Team Files (Day 0–1) ✓ COMPLETE

### Team JSON Schema
- [x] Create `fc_lightning.json` with 11 players
  - 1 GK (Goalkeeper)
  - 4 DF (Defenders)
  - 4 MF (Midfielders)
  - 2 FW (Forwards)
- [x] Create `real_titans.json` with 11 players
- [x] Each player must have:
  - `id` (unique within team)
  - `name`
  - `position` (GK, DF, MF, FW)
  - `attributes` object:
    - `power` (1-100) - for GK saves
    - `shoot` (1-100) - for shooting
    - `tackle` (1-100) - for defending/intercepting
    - `pass` (1-100) - for passing

### Validation
- [x] Create runtime validator for team JSON
- [x] Validate position counts (1 GK, 4 DF, 4 MF, 2 FW)
- [x] Validate attribute ranges (1-100)
- [x] Validate unique player IDs within team

---

## 🎯 Milestone 2 — Core Domain (Day 1–2) ✓ COMPLETE

### Core Classes
- [x] **Player** (`/src/core/player.js`)
  - Properties: id, name, position, attributes
  - Methods: getAttribute(attr)

- [x] **Team** (`/src/core/team.js`)
  - Properties: id, name, players
  - Methods: 
    - getPlayersByPosition(position)
    - getGoalkeeper()
    - findPlayerById(id)
    - validateRoster()

- [x] **Zones** (`/src/core/zones.js`)
  - Enum-like object: GK, DEFENSE, MIDFIELD, ATTACK
  - Helper functions: nextZone(zone), zoneName(zone)

- [x] **BallState** (`/src/core/ballState.js`)
  - Properties: teamInPossessionId, zone, lastEvent

- [x] **MatchState** (`/src/core/matchState.js`)
  - Properties: 
    - score { A: 0, B: 0 }
    - possessionCount { A: 0, B: 0, total: 0 }
    - ball (BallState)
    - currentTeamId
    - logs (array of events)
    - finished (boolean)

- [x] **GameEngine** (`/src/core/engine.js`)
  - Initialize with: teamA, teamB, rng, fatigue, superMove
  - Methods:
    - startMatch({ startingTeam })
    - currentTeam() / otherTeam()
    - playersInZone(teamId, zone)
    - pickOpponentForZone(teamId, zone)
    - resolvePass({ passer, targetZone, opponentInZone, context })
    - resolveShot({ shooter, opponentGK, context })
    - swapPossessionAtSameZone()
    - possessionTo(teamId, zone)
    - scoreGoal(shooter, res)
    - checkPossessionEnd()
    - checkWinCondition()
    - isFinished()
    - logEvent(event)

---

## 🎲 Milestone 3 — Rules & Algorithms (Day 2–3) ✓ COMPLETE

### RNG System
- [x] **RNG** (`/src/rules/rng.js`)
  - Seedable random number generator (xorshift32)
  - Methods: d6(), roll2d6()
  - Deterministic for testing

### Fatigue Tracking
- [x] **FatigueTracker** (`/src/rules/fatigue.js`)
  - Track participation count per player
  - After 3 contests → apply -3 penalty on next roll
  - Reset counter after penalty applied
  - Methods:
    - markParticipation(playerId)
    - consumePenaltyIfAny(playerId)

### Super Move System
- [x] **SuperMoveManager** (`/src/rules/superMove.js`)
  - One use per team per match
  - Adds +10 to one roll
  - Methods:
    - canUse(teamId)
    - use(teamId)

### Contest Resolution
- [x] **contest()** function (`/src/core/contest.js`)
  - Roll attacker: base_attr + 2d6 + modifiers
  - Roll defender: base_attr + 2d6 + modifiers
  - Modifiers:
    - Fatigue: -3 if pending
    - Super Move: +10 if used
    - Counter Attack: +5 if applicable
  - Return: { aRoll, dRoll, diff }
  - Mark both players for fatigue tracking

### Game Rules
- [x] **Pass Resolution**
  - Contest: Passer (pass) vs Defender (tackle)
  - Success (diff > 0): advance to next zone
  - Fail/Tie (diff ≤ 0): intercepted, swap possession at same field area

- [x] **Shot Resolution**
  - Contest: Shooter (shoot) vs GK (power)
  - Goal (diff ≥ 5): score +1, possession resets
  - Save (diff < 5): GK's team starts at DEFENSE zone
  - Counter-attack bonus (+5) if shot immediately after intercept in MF/ATT

- [x] **Win Conditions**
  - First team to score 1 goal, OR
  - Most goals after 3 total possessions
  - Tie handling (if needed)

---

## 🖥️ Milestone 4 — Console Runner (Day 3) ✓ COMPLETE

### CLI Implementation
- [x] **Main CLI** (`/src/cli/index.js`)
  - Load team JSON files
  - Initialize game engine with seeded RNG
  - Game loop:
    - Display current game state
    - Show available players for current zone
    - Prompt for player selection
    - Prompt for Super Move usage (when available)
    - Execute action (pass or shoot)
    - Display results with dice details
    - Check for game end
  - Display final score

### User Interaction
- [x] Input validation and error handling
- [x] Clear prompts for player selection
- [x] Super Move usage prompts
- [x] Readable output formatting

### Display Features
- [x] Show current zone and possession
- [x] Show player options with attributes
- [x] Show dice rolls and modifiers breakdown
- [x] Show fatigue status warnings
- [x] Show event logs (passes, interceptions, shots, saves, goals)
- [x] Show running score

---

## 🧪 Milestone 5 — Testing & Simulation (Day 4–5) ✓ MOSTLY COMPLETE

### Unit Tests
- [ ] Test RNG determinism with seeds *(can be added later)*
- [ ] Test fatigue tracking (3 contests → penalty) *(can be added later)*
- [ ] Test Super Move (one per team) *(can be added later)*
- [ ] Test pass success/failure *(can be added later)*
- [ ] Test shot goal threshold (diff ≥ 5) *(can be added later)*
- [ ] Test counter-attack bonus application *(can be added later)*
- [ ] Test win conditions *(can be added later)*
- [ ] Test zone transitions *(can be added later)*
- [ ] Test possession swapping *(can be added later)*

### Simulation Mode
- [x] Auto-play mode (AI picks best attribute players)
- [x] Run multiple simulations for balance testing
- [x] Statistics collection

---

## 🛠️ Milestone 6 — Developer UX (Day 5) ✓ COMPLETE

### Logging System
- [x] Structured event logging
- [x] Event types: PASS, INTERCEPT, SHOT, SAVE, GOAL
- [x] Detailed breakdown in logs:
  - Player IDs and names
  - Zones
  - Dice rolls (base + dice + modifiers)
  - Outcomes
- [x] Pretty console output (colors included!)

### State Management
- [ ] Save match state to JSON *(can be added later)*
- [ ] Load/resume match from JSON *(can be added later)*
- [ ] Export match logs *(can be added later)*

### Documentation
- [x] JSDoc comments for all classes and methods
- [x] README with setup instructions
- [x] Game rules documentation
- [x] Quick start guide (QUICKSTART.md)

---

## 🚀 Future Enhancements (Vue 3 Migration)

### Architecture Preparation
- [ ] Ensure engine is UI-agnostic
- [ ] Event-driven architecture for UI updates
- [ ] Separate game state from display logic
- [ ] Clean API for Vue integration

### Vue 3 Features (Later)
- [ ] Visual field representation
- [ ] Animated card movements
- [ ] Player card display with attributes
- [ ] Interactive player selection
- [ ] Real-time dice roll animations
- [ ] Match replay system
- [ ] Team builder/editor
- [ ] Multiplayer support

---

## �️ Real-time Multiplayer (MVP)

Goal: Allow two players on different machines to connect to a lightweight server and see the same console-style match output in their browsers. One player will control Team A and the other Team B. This is an incremental, low-risk step toward a full Vue UI.

High-level decisions
- Transport: WebSocket (lightweight, realtime). Use the `ws` package on the server for MVP.
- Server-side authority: The server will host the `GameEngine` instance per session and stream events to connected clients. Clients are thin viewers/controls that send intent messages (ready/start, simple actions later).
- Session model: Sessions are created on server (session id) and two clients may join (player A/B). No production auth—simple name input and session id join.

Minimal message protocol (JSON over WS)
- Client -> Server
  - { type: 'create_session', payload: { name } } -> returns sessionId
  - { type: 'join_session', payload: { sessionId, name } } -> server assigns role A or B
  - { type: 'client_ready' } -> signal ready to start
  - { type: 'start_match', payload: { seed?, roundsPerHalf? } } -> only host/first player
  - { type: 'action', payload: {...} } -> reserved for future interactive controls
- Server -> Client
  - { type: 'session_info', payload: { sessionId, role, players } }
  - { type: 'engine_event', payload: { event } } -> mirror existing console log events (PASS, INTERCEPT, SHOT, SAVE, GOAL, etc.)
  - { type: 'state_snapshot', payload: { matchState } } -> full state for late join/reconnect
  - { type: 'error', payload: { message } }

Minimal file additions
- `src/server/index.js` — HTTP static server + WebSocket server, session manager
- `src/server/sessionManager.js` — manage sessions, connected sockets, assign roles
- `public/index.html` — simple page to join/create session and show console log
- `public/app.js` — client-side WS wiring, render console lines, show basic controls
- `public/styles.css` — small styles for console-like output

Incremental implementation plan (priority order)
1. Add server scaffold (`src/server/index.js`) that serves `public/` and runs a `ws` server. Provide `npm` script to start server.
2. Implement `SessionManager` able to create session IDs, accept joins, track sockets, and assign roles (A/B). Add basic in-memory session store.
3. Create minimal web client that connects, joins/creates a session, and prints `engine_event` messages to a scrolling console view.
4. Wire `GameEngine` to session lifecycle: when two players are ready the server calls `engine.startMatch()` and subscribes to its events (use `engine.logEvent()` output or expose a callback). Stream those events to connected clients as `engine_event` messages.
5. Add controls for host to start match with optional seed/roundsPerHalf; route `start_match` to server to start engine with supplied options.
6. Add simple reconnect and state snapshot support: new clients receive `state_snapshot` to catch up.
7. Add lightweight validation and limits (message size, number of sessions per server) and document caveats.

Acceptance criteria (MVP)
- Two browsers connect to server using session id and see the same event stream.
- Server runs authoritative `GameEngine` instance per session and streams `engine_event` messages.
- One player can start the match and both clients observe the same sequence (passes, shots, saves, goals).
- Basic reconnect: reconnecting client receives `state_snapshot` (best-effort)

Notes & follow-ups
- For richer transport and reconnection features consider `socket.io` later. For now `ws` keeps dependencies minimal.
- We'll add tests for `SessionManager` and an integration test that spins up a headless WebSocket client pair to validate end-to-end streaming.


---

## 🌐 Milestone: Modern Web UI with Vue 3 + Tailwind (IN PROGRESS)

### Phase 1: Fix Current WebSocket Server Issues ✓ COMPLETE
- [x] Fix SessionManager.setGameEngine missing method
- [x] Integrate GameEngine simulation into server
- [x] Test basic multiplayer functionality with current HTML client
- [x] Fix event streaming to clients

### Phase 2: Vue 3 + Tailwind Frontend Setup
**Goal:** Replace basic HTML client with modern Vue 3 + Tailwind application

#### 2.1 Project Setup
- [ ] Initialize Vue 3 project in `/client` folder using Vite
  - `npm create vite@latest client -- --template vue`
- [ ] Install Tailwind CSS and configure for Vue
  - `npm install -D tailwindcss postcss autoprefixer`
  - `npx tailwindcss init -p`
- [ ] Configure Vite dev server to proxy WebSocket to port 3000
- [ ] Set up Vue Router for navigation
- [ ] Install additional dependencies:
  - `@vueuse/core` for composables
  - `pinia` for state management

#### 2.2 Team Selection System
- [ ] Extend server to expose team list endpoint (`GET /api/teams`)
  - Return list of available teams from `/src/data/*.json`
  - Include team name, players preview, and team stats
- [ ] Create Team model/store in Vue
- [ ] Build team selection components:
  - `TeamCard.vue` - Display team info card with preview
  - `TeamSelector.vue` - Grid of available teams
  - `PlayersList.vue` - Show team composition (GK, DF, MF, FW)

#### 2.3 Lobby & Session Management UI
- [ ] Create lobby views:
  - **HomeView.vue** - Entry point with "Create Game" and "Join Game" options
  - **CreateGameView.vue** - Choose your team, generate session ID, wait for opponent
  - **JoinGameView.vue** - Enter session ID, choose team, join existing game
  - **LobbyView.vue** - Waiting room showing both players, ready states, team selections
- [ ] Lobby features:
  - Display session ID prominently for sharing
  - Show "Waiting for opponent..." state with animated loading
  - Display both players' names and selected teams
  - Ready button for each player
  - Start button (only visible to game creator when both ready)
  - Copy session ID button
  - Player can see opponent's team selection in real-time

#### 2.4 Game View & Match Display
- [ ] **GameView.vue** - Main game screen
  - Console-style event feed with animations
  - Score display (Team A vs Team B)
  - Current possession indicator
  - Zone visualization (GK → DEF → MID → ATT → GOAL)
  - Ball position indicator
  - Player cards showing active players in current action
  - Match progress (round counter, half indicator)
- [ ] Event rendering components:
  - `EventLog.vue` - Scrollable match event feed
  - `ScoreBoard.vue` - Live score display
  - `ZoneField.vue` - Visual representation of field zones
  - `PlayerCard.vue` - Show player involved in action with stats
  - `PossessionIndicator.vue` - Animated indicator of which team has ball

#### 2.5 WebSocket Integration with Vue
- [ ] Create WebSocket composable (`useWebSocket.ts`)
  - Connection management
  - Reconnection logic
  - Message queue for offline events
- [ ] Create game state store (Pinia)
  - Session management
  - Match state
  - Event history
  - Player info
- [ ] Implement message handlers for:
  - `session_info` - Update lobby state
  - `both_ready` - Enable start button
  - `match_started` - Navigate to game view
  - `engine_event` - Update match state and event log
  - `match_ended` - Show final results

### Phase 3: Enhanced Features
- [ ] Add animations and transitions:
  - Fade in/out for events
  - Slide animations for zone changes
  - Celebration animations for goals
  - Pulse effect for active player
- [ ] Responsive design for mobile
- [ ] Dark/light theme toggle
- [ ] Sound effects (optional):
  - Goal celebration
  - Pass/shot sounds
  - Referee whistle
- [ ] Match replay/history feature
- [ ] Share results (export match summary)

### Phase 4: Server Enhancements for Team Selection
- [ ] Update SessionManager to store team selections:
  - Add `teamId` field to player data
  - Validate team selection is unique per session
- [ ] Update WebSocket protocol:
  - `create_session`: Add `teamId` parameter
  - `join_session`: Add `teamId` parameter
  - `team_selected`: New message type for changing team
  - `session_info`: Include team selections in payload
- [ ] Load team data dynamically in GameEngine:
  - Accept team IDs instead of hardcoded teams
  - Load team JSON based on player selections
- [ ] Add team validation:
  - Prevent duplicate team selection in same session
  - Validate team exists before starting match

### Phase 5: Testing & Polish
- [ ] Unit tests for Vue components
- [ ] E2E tests with Playwright
- [ ] Performance optimization
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Documentation updates:
  - User guide for new UI
  - Developer guide for Vue architecture
  - Component storybook (optional)

---

## 📦 Updated Project Structure

```
footstars/
├── client/                    # NEW: Vue 3 frontend
│   ├── src/
│   │   ├── components/        # Vue components
│   │   │   ├── lobby/
│   │   │   │   ├── TeamCard.vue
│   │   │   │   ├── TeamSelector.vue
│   │   │   │   ├── PlayersList.vue
│   │   │   │   └── LobbyRoom.vue
│   │   │   ├── game/
│   │   │   │   ├── EventLog.vue
│   │   │   │   ├── ScoreBoard.vue
│   │   │   │   ├── ZoneField.vue
│   │   │   │   ├── PlayerCard.vue
│   │   │   │   └── PossessionIndicator.vue
│   │   │   └── common/
│   │   │       ├── Button.vue
│   │   │       └── Input.vue
│   │   ├── views/
│   │   │   ├── HomeView.vue
│   │   │   ├── CreateGameView.vue
│   │   │   ├── JoinGameView.vue
│   │   │   ├── LobbyView.vue
│   │   │   └── GameView.vue
│   │   ├── composables/
│   │   │   ├── useWebSocket.js
│   │   │   └── useGameState.js
│   │   ├── stores/
│   │   │   ├── session.js
│   │   │   ├── game.js
│   │   │   └── teams.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── assets/
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── src/
│   ├── core/                  # Game engine (unchanged)
│   ├── rules/                 # Game rules (unchanged)
│   ├── data/                  # Team JSON files
│   ├── server/                # WebSocket server
│   │   ├── index.js          # Server entry + HTTP + WebSocket
│   │   ├── sessionManager.js # Session management
│   │   └── routes.js         # NEW: REST API routes
│   ├── cli/                   # Console simulator
│   └── tests/                 # Tests
├── public/                    # OLD: Basic HTML client (can be removed later)
└── package.json              # Root package.json
```

---

## 🎯 Acceptance Criteria for Vue 3 UI

- [ ] Players can create a game and select their team from available options
- [ ] Session ID is prominently displayed and easily shareable (copy button)
- [ ] Second player can join using session ID and select a different team
- [ ] Lobby shows both players with their selected teams and ready states
- [ ] Game creator can start match when both players are ready
- [ ] Match view displays:
  - Real-time event feed with smooth animations
  - Visual field representation with zones
  - Active players involved in current action
  - Live score and possession tracking
  - Match progress (rounds, halves)
- [ ] UI is responsive and works on desktop and mobile
- [ ] WebSocket reconnection works seamlessly
- [ ] Application is accessible (keyboard navigation, screen reader support)

---

## 📝 Current Status

**Phase:** 🚧 Multiplayer WebSocket Server Complete, Starting Vue 3 Migration  
**Next Step:** Set up Vue 3 + Tailwind frontend and implement team selection  
**Completed:** Core engine, console CLI, WebSocket server, basic HTML client

---

## 🎮 Acceptance Criteria for Console MVP

- [x] Load two valid team JSON files
- [x] Deterministic runs via RNG seed
- [x] Complete gameplay loop:
  - [x] Passing through zones
  - [x] Interceptions with possession swap
  - [x] Shots with goal-by-5 rule
  - [x] Saves leading to opponent possession at DEF
  - [x] Super Move (once per team)
  - [x] Fatigue penalties (after 3 contests)
  - [x] Counter-attack bonus (after intercept + immediate shot)
- [x] Win conditions working correctly
- [x] Clear, readable logs with dice breakdowns
- [x] Error handling for invalid inputs
- [x] Game can be played start to finish in console

**✅ ALL ACCEPTANCE CRITERIA MET!**

---

## 📚 Notes & Decisions

- Using ES Modules (`"type": "module"` in package.json)
- Pure JavaScript OOP, no TypeScript for MVP
- JSDoc for type hints
- Console-first, web-ready architecture
- Deterministic RNG for testing
- Zone system relative to team in possession
