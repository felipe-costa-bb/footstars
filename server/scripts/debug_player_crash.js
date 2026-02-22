import { Player } from '../src/core/player.js';

try {
    const flatPlayer = {
        id: '123',
        name: 'Test Player',
        position: 'ST',
        power: 80,
        shoot: 80,
        tackle: 80,
        pass: 80
    };

    console.log('Attempting to create Player with flat attributes...');
    const player = new Player(flatPlayer);
    console.log('Success:', player);
} catch (e) {
    console.error('Caught Expected Error:', e.message);
}
