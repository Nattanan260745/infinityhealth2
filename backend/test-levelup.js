const BASE_URL = 'http://localhost:3000';
// Use native fetch (Node 18+)

// 1. Setup Test User
const TEST_USER = {
    email: `levelup_test_${Date.now()}@test.com`,
    password: 'password123',
    firstName: 'LevelUp',
    lastName: 'Tester'
};

async function test() {
    console.log('🧪 Starting Level-Up Logic Test...\n');

    // --- REGISTER ---
    console.log('1. Registering User...');
    let res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });
    let data = await res.json();
    if (!data.success) {
        // If exists, login
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });
        data = await res.json();
    }
    const userId = data.user.id;
    console.log(`   User ID: ${userId}, Level: ${data.user.userStats?.level || 1}`);

    // --- CHECK INITIAL MISSIONS ---
    console.log('\n2. Checking Initial Missions (Should see Level 1 Challenge)...');
    res = await fetch(`${BASE_URL}/mission/user/${userId}`);
    data = await res.json();
    const missions = data.data;
    const challenge = missions.find(m => m.missionType === 'CHALLENGE');
    console.log(`   Visible Challenge: ${challenge ? challenge.missionName : 'NONE'}`);

    if (challenge && challenge.missionName === 'Level 1 Challenge') {
        console.log('   ✅ Correct Challenge Visible');
    } else {
        console.error('   ❌ Wrong Challenge Visible');
        return;
    }

    // --- ADD EXP (ENOUGH FOR LEVEL 2) ---
    // Level 1 -> 2 requires 1000 EXP. We add 2000 to be safe.
    console.log('\n3. Adding 2000 EXP (Should be enough for Level 3, but locked at 1)...');
    res = await fetch(`${BASE_URL}/profile/${userId}/add-exp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 2000 })
    });
    data = await res.json();
    console.log(`   New Level: ${data.data.level_id}`);

    if (data.data.level_id === 1) {
        console.log('   ✅ Level LOCKED at 1 (Correct, challenge not done)');
    } else {
        console.error(`   ❌ Level increased to ${data.data.level_id} unexpectedly!`);
        return;
    }

    // --- COMPLETE CHALLENGE 1 ---
    console.log('\n4. Completing Level 1 Challenge...');
    res = await fetch(`${BASE_URL}/mission/user/${userId}/complete/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    });
    data = await res.json();
    console.log(`   Challenge Complete: ${data.success}`);

    // --- TRIGGER LEVEL CALCULATION (Add 0 Exp or Just Check Profile) ---
    // Note: Completing the mission SHOULD trigger the level check in the callback.
    // Let's fetch profile to see current level.
    console.log('   Checking Level after completion...');
    res = await fetch(`${BASE_URL}/profile/${userId}`);
    data = await res.json();
    const newLevel = data.data.level_id;
    console.log(`   Current Level: ${newLevel}`);

    if (newLevel === 2) {
        console.log('   ✅ Level UP to 2 Success!');
    } else {
        console.error('   ❌ Failed to Level Up.');
    }

    // --- CHECK NEW CHALLENGE ---
    console.log('\n5. Checking New Missions (Should see Level 2 Challenge)...');
    res = await fetch(`${BASE_URL}/mission/user/${userId}`);
    data = await res.json();
    const newMissions = data.data;
    const newChallenge = newMissions.find(m => m.missionType === 'CHALLENGE');
    console.log(`   Visible Challenge: ${newChallenge ? newChallenge.missionName : 'NONE'}`);

    if (newChallenge && newChallenge.missionName === 'Level 2 Challenge') {
        console.log('   ✅ Correct New Challenge Visible');
    } else {
        console.error('   ❌ Wrong Challenge Visible');
    }
}

test();
