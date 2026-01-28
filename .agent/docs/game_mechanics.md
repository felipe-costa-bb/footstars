# Game Mechanics

## Core Concept
A simulated soccer match played in zones. Success depends on comparing player attributes + dice rolls + modifiers.

## Zones
Movement is linear and relative to the attacking team:
1.  **GK** (Goalkeeper) - Starting possession.
2.  **Defense**
3.  **Midfield**
4.  **Attack**
5.  **Goal** (Shooting zone)

## Actions

### Passing
-   **Context**: Moving ball from current zone to next.
-   **Contest**: Attacker's `pass` vs Defender's `tackle`.
-   **Outcome**:
    -   **Success**: Ball moves to next zone.
    -   **Failure**: Interception. Possession swaps, ball stays in similar zone relative to new attacker.

### Shooting
-   **Context**: Only available in **Attack** zone.
-   **Contest**: Shooter's `shoot` vs GK's `power`.
-   **Outcome**:
    -   **GOAL**: Diff ≥ 5. Score increases, reset to kickoff.
    -   **SAVE**: Diff < 5. GK catches ball, possession swaps to GK's team at **Defense**.

## Dice & Modifiers
-   **Base Roll**: `2d6` (random 2-12).
-   **Modifiers**:
    -   **Fatigue**: -3 to roll if player has acted 3 times recently.
    -   **Super Move**: +10 (Once per game per team).
    -   **Counter-Attack**: +5 to shot if immediate turnover in high zone.

## Win Condition
-   First to score 1 goal (default/quick match).
-   OR best score after set number of possessions.
