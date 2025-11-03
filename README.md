# ⚽ Field Battle

A strategic board-style soccer card game using zone-based gameplay with dice-based randomness.

## 🎮 Game Overview

Field Battle is a tactical soccer simulation where two teams compete by moving the ball through zones (GK → Defense → Midfield → Attack → Goal) using dice rolls and player attributes.

## 🏗️ Current Status

**Phase:** Console-based JS OOP prototype  
**Future:** Vue 3 web application

## 📦 Installation

```bash
# Install dependencies (none for MVP, pure Node.js)
npm install

# Run interactive game
npm start

# Run simulation mode
npm run simulate
```

## 🖥️ CLI Usage

The simulator supports various command-line options for customization:

### Commands

```bash
# Run single verbose match
node src/cli/simulate.js single [--rounds-per-half=30] [--force-full=true]

# Run multiple simulated matches (default: 10)
node src/cli/simulate.js multi [n] [--rounds-per-half=30] [--force-full=true]

# Show help
node src/cli/simulate.js --help
```

### Options

- `--rounds-per-half=N`: Number of rounds per half (default: 45)
- `--force-full=BOOL`: Force full match even if goal scored early (default: false)
- `--help, -h`: Show help message

### Environment Variables

- `ROUNDS_PER_HALF=N`: Same as `--rounds-per-half`
- `FORCE_FULL_MATCH=BOOL`: Same as `--force-full`

### Examples

```bash
# Run single match with custom half length
node src/cli/simulate.js single --rounds-per-half=30

# Run 20 matches forcing full 90 rounds
node src/cli/simulate.js multi 20 --force-full=true

# Use environment variables
ROUNDS_PER_HALF=20 FORCE_FULL_MATCH=true node src/cli/simulate.js multi 5
```

## 🎯 Game Rules

### Field Zones
1. **GK** (Goalkeeper) - Starting position
2. **Defense** - First defensive line
3. **Midfield** - Center of the field
4. **Attack** - Offensive zone
5. **Goal** - Shooting zone

### Actions

**Passing:** Passer (pass attribute) vs Defender (tackle attribute)
- Success: Advance to next zone
- Failure: Intercepted, opponent gains possession

**Shooting:** Shooter (shoot attribute) vs Goalkeeper (power attribute)
- Win by ≥5: GOAL!
- Otherwise: Saved, GK's team starts at Defense

### Dice & Modifiers

Every contest rolls 1d10 (ten-sided die) plus modifiers:

- **Instant Success:** Attacker rolls 10 → automatic success
- **Instant Failure:** Attacker rolls 1 → automatic failure
- **Fatigue:** After 3 contests, player gets -3 on next roll
- **Super Move:** +10 bonus (once per team per match)
- **Counter-Attack:** +5 on shot immediately after intercept in MF/ATT

### Win Conditions

- First team to score 1 goal (unless forceFullMatch is enabled), OR
- Most goals after two halves of 45 rounds each (90 total rounds)

## 📁 Project Structure

```
/src
  /core            # UI-agnostic game engine
    player.js      # Player entity
    team.js        # Team entity
    zones.js       # Zone definitions
    ballState.js   # Ball state tracking
    matchState.js  # Match state tracking
    contest.js     # Contest resolution
    engine.js      # Main game engine
  /rules           # Rule helpers
    rng.js         # Seedable random number generator
    fatigue.js     # Fatigue tracking system
    superMove.js   # Super move manager
  /cli             # Console runner
    index.js       # Main CLI interface
    simulate.js    # Simulation mode (coming soon)
  /data            # JSON team files
    fc_lightning.json
    real_titans.json
  /types           # JSDoc typedefs
    typedefs.js
  /tests           # Unit tests (coming soon)
```

## 🎮 How to Play

1. The game loads two teams from JSON files
2. A coin flip (or choice) determines starting possession
3. The team in possession moves through zones:
   - Choose a player to pass the ball
   - Opponent automatically defends
   - Dice are rolled with modifiers applied
4. In Attack zone, choose to shoot at goal
5. First to score wins (or best after 3 possessions)

## 👥 Team Format

Teams are defined in JSON with 11 players:

```json
{
  "name": "FC Lightning",
  "players": [
    {
      "id": "player-1",
      "name": "Thibaut Courtois",
      "position": "GK",
      "attributes": {
        "power": 91,
        "shoot": 40,
        "tackle": 45,
        "pass": 72
      }
    }
    // ... 10 more players
  ]
}
```

### Positions Required:
- 1 GK (Goalkeeper)
- 4 DF (Defenders)
- 4 MF (Midfielders)
- 2 FW (Forwards)

### Attributes (1-100):
- **power**: Goalkeeper save ability
- **shoot**: Shooting accuracy and power
- **tackle**: Defensive/interception ability
- **pass**: Passing accuracy

## 🔮 Future Features (Vue 3)

- Visual field representation
- Animated card movements
- Player card display
- Interactive player selection
- Real-time dice animations
- Match replay system
- Team builder/editor
- Multiplayer support

## 📝 Development

See [TODO.md](TODO.md) for detailed implementation roadmap.

## 📄 License

MIT
