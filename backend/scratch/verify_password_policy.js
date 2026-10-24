const { validatePassword } = require('../utils/passwordValidator');

async function testPolicy() {
    console.log('--- Testing validatePassword unit logic ---');
    
    // Test 1: Short password
    const shortCheck = validatePassword('short123');
    console.assert(!shortCheck.valid, 'Test 1 Failed: Short password should be invalid');
    console.log('✓ Short password rejected:', shortCheck.message);

    // Test 2: Common password
    const commonCheck = validatePassword('password1234');
    console.assert(!commonCheck.valid, 'Test 2 Failed: Common password should be invalid');
    console.log('✓ Common password rejected:', commonCheck.message);

    // Test 3: 12-char but Weak (all lowercase: 'aaaaaaaaaaaa')
    const weakCheck = validatePassword('aaaaaaaaaaaa');
    console.assert(!weakCheck.valid, 'Test 3 Failed: All-lowercase 12-char weak password should be invalid');
    console.log('✓ Weak 12-char password rejected:', weakCheck.message);

    // Test 4: Valid 12+ characters with character mix ('GigOra2026Dev!')
    const validCheck = validatePassword('GigOra2026Dev!');
    console.assert(validCheck.valid, 'Test 4 Failed: Fair/Good/Strong password should be valid');
    console.log('✓ Strong 12+ password accepted:', validCheck.valid, '(Score: ' + validCheck.score + ')');

    console.log('\n--- Testing API Route Validations ---');
    // Test 5: Register with short password
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test',
            email: 'policytest@example.com',
            password: 'short'
        })
    });
    const regData = await regRes.json();
    console.log('Register short password response (HTTP ' + regRes.status + '):', regData.message);
    console.assert(regRes.status === 400 && regData.message.includes('12 characters'), 'Test 5 Failed: Register should require 12 chars');

    // Test 6: Register with 12-char Weak password ('mumbaicitypass')
    const regWeakRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test',
            email: 'policytest@example.com',
            password: 'mumbaicitypass'
        })
    });
    const regWeakData = await regWeakRes.json();
    console.log('Register weak password response (HTTP ' + regWeakRes.status + '):', regWeakData.message);
    console.assert(regWeakRes.status === 400 && regWeakData.message.includes('weak'), 'Test 6 Failed: Register should reject weak password');

    // Test 7: Reset password with 12-char Weak password
    const resetWeakRes = await fetch('http://localhost:5000/api/auth/reset-password/fake_token_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            password: 'mumbaicitypass'
        })
    });
    const resetWeakData = await resetWeakRes.json();
    console.log('Reset weak password response (HTTP ' + resetWeakRes.status + '):', resetWeakData.message);
    console.assert(resetWeakRes.status === 400 && resetWeakData.message.includes('weak'), 'Test 7 Failed: Reset should reject weak password');

    // Test 8: Reset password with common password
    const commonResetRes = await fetch('http://localhost:5000/api/auth/reset-password/fake_token_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            password: 'password1234'
        })
    });
    const commonResetData = await commonResetRes.json();
    console.log('Reset common password response (HTTP ' + commonResetRes.status + '):', commonResetData.message);
    console.assert(commonResetRes.status === 400 && commonResetData.message.includes('common'), 'Test 8 Failed: Common password should be rejected');

    console.log('\n🎉 ALL 8 PASSWORD POLICY & WEAK REJECTION TESTS PASSED SUCCESSFULLY!');
}

testPolicy().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
