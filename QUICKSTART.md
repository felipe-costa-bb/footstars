# ⚽ Field Battle - Quick Start Guide

Welcome to Field Battle! This guide will help you get started with the game.

## 🎮 How to Play

### Starting the Game

```bash
npm start
```

This will launch the interactive console game where you can:
- Choose which team starts with the ball
- Select players for passes and shots
- Decide when to use your team's Super Move
- Watch the dice rolls and see the results in real-time

### Game Flow

1. **Kickoff**: One team starts with possession in the Goalkeeper zone
2. **Passing**: Choose a player to pass the ball forward through zones:
   - GK → Defense → Midfield → Attack
3. **Defense**: The opponent automatically selects their best defender
4. **Dice Roll**: Both players roll 2d6 + their attribute + modifiers
5. **Result**:
   - Pass succeeds: Ball advances to next zone
   - Pass fails: Opponent intercepts and gains possession
6. **Shooting**: When in Attack zone, choose a player to shoot
7. **Goal**: Shooter must beat goalkeeper by 5+ to score
8. **Win**: First to score OR best score after 3 possessions

### Special Mechanics

**Fatigue**: After a player participates in 3 contests, they get -3 on their next roll

**Super Move**: Each team can use this ONCE per match for +10 bonus

**Counter-Attack**: After intercepting in Midfield/Attack, immediate shot gets +5

## 🤖 Simulation Mode

Want to see the AI play? Run simulations:

```bash
# Watch a single match with full details
npm run simulate:single

# Run 10 matches and see statistics
npm run simulate

# Run 100 matches for balance testing
npm run simulate:many
```

## 📊 Understanding the Output

### During Play

```
CURRENT STATE
Score: Team A 0 - 0 Team B
Possessions: A: 0 | B: 0 | Total: 0
Ball: FC Lightning at Defense
Super Move: A: ✓ | B: ✓
```

### Player Selection

```
Select a player:
  1. Virgil van Dijk (DF) [2/3] - Pass: 75 | Tackle: 92 | Shoot: 55 | Power: 60
     [2/3] means they've contested 2 times (will be fatigued after 3)
  2. Sergio Ramos (DF) [TIRED!] - Pass: 73 | Tackle: 88 | Shoot: 62 | Power: 55
     [TIRED!] means their next roll will have -3 penalty
```

### Contest Results

```
CONTEST RESULT
Virgil van Dijk: 75 (base) + 8 (dice) = 83
João Cancelo: 85 (base) + 6 (dice) = 91
Result: João Cancelo wins by 8
```

## 🎯 Strategy Tips

1. **Save Your Super Move**: Consider saving it for important shots or when fatigued
2. **Watch Fatigue**: Rotate players if possible to avoid -3 penalties
3. **Counter-Attacks**: After intercepting in midfield/attack, shoot immediately for +5 bonus
4. **Know Your Players**: 
   - Use high Pass attribute players for passing
   - Use high Shoot attribute players for shooting
   - Defenders need high Tackle
   - Goalkeepers need high Power

## 📝 Example Game Session

```bash
$ npm start

⚽ FIELD BATTLE - CONSOLE EDITION ⚽

Loading teams...
✓ Loaded: FC Lightning vs Real Titans

Start with FC Lightning (Team A)? y

⚽ KICKOFF! FC Lightning starts with the ball!

CURRENT STATE
Score: Team A 0 - 0 Team B
Ball: FC Lightning at Goalkeeper

FC Lightning - PASSING FROM GOALKEEPER
Choose a player to pass the ball:
  1. Thibaut Courtois (GK) - Pass: 72 | Tackle: 45 | Shoot: 40 | Power: 91

Your choice (number): 1

→ Real Titans's Rúben Dias will defend in Defense

ROLLING DICE...

CONTEST RESULT
Thibaut Courtois: 72 (base) + 7 (dice) = 79
Rúben Dias: 90 (base) + 8 (dice) = 98
Result: Rúben Dias wins by 19

✗ Rúben Dias intercepts the pass!

[Game continues...]
```

## 🔧 Troubleshooting

**Game won't start?**
- Make sure you're using Node.js 16 or higher
- Run from the project root directory

**Want to use a specific random seed?**
- Edit `src/cli/index.js` and change the seed value
- This allows you to replay the exact same match

## 📚 Next Steps

- Check out `TODO.md` to see the development roadmap
- Modify team stats in `src/data/` to balance gameplay
- Look at the engine code in `src/core/engine.js` to understand game mechanics
- Read the full rules in `README.md`

## 🎲 Understanding Dice Rolls

The game uses 2d6 (two six-sided dice), giving results from 2-12:
- Average roll: 7
- Most common: 7 (16.7% chance)
- Least common: 2 or 12 (2.8% chance each)

A +10 Super Move bonus is roughly equivalent to an excellent roll!

---

**Have fun and may the best team win!** ⚽🏆
