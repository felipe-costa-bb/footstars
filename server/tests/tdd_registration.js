/**
 * TDD Test: User Registration
 * 
 * Test the complete registration flow:
 * 1. Register a new user
 * 2. Verify user is created with correct data
 * 3. Verify starter pack is granted
 * 4. Verify coins are initialized
 */

import { auth } from '../src/infrastructure/auth.js';
import { dbRequest } from '../src/infrastructure/db/repository.js';
import { cardManager } from '../src/core/cardManager.js';

// Clean test user before tests
const TEST_USERNAME = `testuser_${Date.now()}`;
const TEST_PASSWORD = 'testpass123';

async function runTests() {
    console.log('=== TDD: User Registration Tests ===\n');

    let passed = 0;
    let failed = 0;

    // TEST 1: Register new user
    try {
        console.log('TEST 1: Register new user');
        const result = await auth.register(TEST_USERNAME, TEST_PASSWORD);

        if (!result.user) throw new Error('No user returned');
        if (!result.user.id) throw new Error('No user ID');
        if (result.user.username !== TEST_USERNAME) throw new Error('Username mismatch');
        if (!result.token) throw new Error('No token returned');

        console.log('  ✅ PASS: User registered successfully');
        console.log(`     User ID: ${result.user.id}`);
        passed++;
    } catch (err) {
        console.log(`  ❌ FAIL: ${err.message}`);
        failed++;
    }

    // TEST 2: Verify user exists in DB
    try {
        console.log('\nTEST 2: Verify user in database');
        const user = dbRequest.findUserByUsername(TEST_USERNAME);

        if (!user) throw new Error('User not found in DB');
        if (!user.password_hash) throw new Error('Password hash missing');

        console.log('  ✅ PASS: User exists in database');
        passed++;
    } catch (err) {
        console.log(`  ❌ FAIL: ${err.message}`);
        failed++;
    }

    // TEST 3: Verify starter pack was granted
    try {
        console.log('\nTEST 3: Verify starter pack granted');
        const user = dbRequest.findUserByUsername(TEST_USERNAME);
        const cards = dbRequest.getUserCards(user.id);

        if (!cards || cards.length === 0) throw new Error('No cards found - starter pack not granted');
        if (cards.length !== 11) throw new Error(`Expected 11 cards, got ${cards.length}`);

        console.log(`  ✅ PASS: Starter pack granted (${cards.length} cards)`);
        passed++;
    } catch (err) {
        console.log(`  ❌ FAIL: ${err.message}`);
        failed++;
    }

    // TEST 4: Verify user has initial coins
    try {
        console.log('\nTEST 4: Verify initial coins');
        const user = dbRequest.findUserByUsername(TEST_USERNAME);
        const coins = dbRequest.getUserCoins(user.id);

        // Expected: Users should start with 1000 coins
        if (coins === undefined || coins === null) throw new Error('Coins not returned');
        if (coins < 0) throw new Error(`Invalid coins value: ${coins}`);

        // Check if coins is 0 (current bug) or 1000 (expected)
        if (coins === 0) {
            throw new Error(`User has 0 coins - should start with 1000`);
        }

        console.log(`  ✅ PASS: User has ${coins} coins`);
        passed++;
    } catch (err) {
        console.log(`  ❌ FAIL: ${err.message}`);
        failed++;
    }

    // TEST 5: Duplicate registration should fail
    try {
        console.log('\nTEST 5: Duplicate registration should fail');
        await auth.register(TEST_USERNAME, TEST_PASSWORD);
        console.log('  ❌ FAIL: Should have thrown error for duplicate');
        failed++;
    } catch (err) {
        if (err.message.includes('already taken')) {
            console.log('  ✅ PASS: Correctly rejected duplicate registration');
            passed++;
        } else {
            console.log(`  ❌ FAIL: Wrong error: ${err.message}`);
            failed++;
        }
    }

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
