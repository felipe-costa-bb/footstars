
import { calculateRatings } from '../src/core/ratingCalculator.js';

const players = [
    {
        name: "Vini Jr",
        position: "LW",
        overall_rating: 90,
        shoot: 85,
        pass: 82,
        dribbling: 91,
        tackle: 29,
        power: 68
    },
    {
        name: "Van Dijk",
        position: "CB",
        overall_rating: 89,
        shoot: 60,
        pass: 71,
        dribbling: 72,
        tackle: 91,
        power: 86
    },
    {
        name: "De Bruyne",
        position: "CM",
        overall_rating: 91,
        shoot: 85,
        pass: 94,
        dribbling: 87,
        tackle: 65,
        power: 78
    },
    {
        name: "Alisson",
        position: "GK",
        overall_rating: 89,
        shoot: 20,
        pass: 60,
        dribbling: 50,
        tackle: 20,
        power: 89 // GK reflexes/etc mapped to power
    }
];

console.log("--- Testing Rating Calculator ---");

players.forEach(p => {
    console.log(`\nPlayer: ${p.name} (${p.position} - ${p.overall_rating})`);
    console.log("Stats:", {
        SHO: p.shoot, PAS: p.pass, DRI: p.dribbling, TAC: p.tackle, POW: p.power
    });

    const ratings = calculateRatings(p);

    // Sort and print ratings
    const sorted = Object.entries(ratings)
        .sort((a, b) => b[1] - a[1]);

    console.log("Calculated Ratings:");
    sorted.forEach(([pos, rat]) => {
        const isNatural = pos === p.position ? " [NATURAL]" : "";
        console.log(`  ${pos}: ${rat}${isNatural}`);
    });
});
