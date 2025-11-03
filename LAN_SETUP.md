# Field Battle - LAN Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Two computers on the same network (or two browser tabs)

### Setup

1. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client && npm install
   cd ..
   ```

2. **Start the backend server** (one terminal):
   ```bash
   npm run server
   ```

   You'll see output like:
   ```
   🎮 Field Battle Server Running

   Local:  http://localhost:3000
   LAN:    http://192.168.x.x:3000
   WebSocket: ws://192.168.x.x:3000

   Open in two browser tabs to test multiplayer
   ```

3. **Start the frontend dev server** (another terminal):
   ```bash
   cd client
   npm run dev
   ```

   You'll see output like:
   ```
   VITE v5.0.8  ready in 234 ms

   ➜  Local:   http://localhost:5173/
   ➜  LAN:    http://192.168.x.x:5173/
   ```

### Local Testing (Same Computer)

1. Open two browser tabs:
   - Tab 1: `http://localhost:5173`
   - Tab 2: `http://localhost:5173`

### LAN Testing (Multiple Computers)

1. Find your machine's IP from the server output (e.g., `192.168.x.x`)
2. On Computer A:
   - Open browser to `http://<your-ip>:5173`
   - Click "Create Game"
   - Select your team and copy the session ID
3. On Computer B:
   - Open browser to `http://<your-ip>:5173`
   - Click "Join Game"
   - Paste the session ID
   - Select a different team
4. Both players click "I'm Ready"
5. Player A clicks "Start Match"

## Architecture

- **Backend**: Node.js WebSocket server on port 3000
  - Handles session management
  - Runs the GameEngine
  - Streams real-time events to clients
  
- **Frontend**: Vue 3 + Vite on port 5173
  - Responsive UI with Tailwind CSS
  - Real-time updates via WebSocket
  - Team selection and lobby system

## Network Configuration

The server listens on `0.0.0.0:3000` to accept connections from:
- Local machine: `http://localhost:3000`
- LAN machines: `http://<local-ip>:3000`

The frontend dev server also listens on `0.0.0.0:5173`.

## Firewall

If your firewall blocks connections, allow:
- Port 3000 (backend)
- Port 5173 (frontend dev server)

## Troubleshooting

### "Failed to load teams"
- Ensure backend server is running
- Check that the server output shows it's listening on `0.0.0.0:3000`

### "Connection refused"
- Verify you're using the correct IP address from the server output
- Check firewall settings
- Ensure both machines are on the same network

### WebSocket connection fails
- The frontend automatically connects to `ws://<your-ip>:3000`
- If it fails, check browser console for errors
- Ensure the backend server is running

## Production Deployment

For production, you would:
1. Build the Vue frontend: `npm run build` in `/client`
2. Serve built files from the backend
3. Use environment variables for configuration
4. Add authentication and rate limiting
5. Use a proper reverse proxy (nginx)

## Environment Variables

- `PORT`: Backend port (default: 3000)
- `HOST`: Backend host (default: 0.0.0.0)
