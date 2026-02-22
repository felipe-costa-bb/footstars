
import { cardManager } from '../src/core/cardManager.js';

console.log("Searching for Tomás Costa...");

const results = cardManager.searchPlayers({ name: "Tomás" });

if (results.length > 0) {
    const player = results.find(p => p.name === "Tomás Costa");
    if (player) {
        console.log("Found player:", player);
        console.log("League:", player.league);
        console.log("Team:", player.team);
    } else {
        console.log("Found players matching 'Tomás', but not Tomás Costa:", results.map(p => p.name));
    }
} else {
    console.log("No players found with name 'Tomás'");
}
