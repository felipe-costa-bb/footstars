# Development Workflow

## Running the Project

### 1. Console Game (CLI)
Interact with the game logic directly in the terminal.
```bash
npm start
```
Use this to verify core game logic changes without UI overhead.

### 2. Full Stack (Server + Client)
Run the WebSocket server:
```bash
npm run server
```
*(Runs on port 3000 by default)*

Run the Vue Frontend (in a separate terminal):
```bash
cd client
npm run dev
```

### 3. Simulation
Run automated AI-vs-AI matches to test balance or crash-test logic.
```bash
npm run simulate         # Run 10 matches
npm run simulate:single  # Run 1 match with verbose logs
```

## Testing
Run unit tests with Vitest:
```bash
npm test
```
