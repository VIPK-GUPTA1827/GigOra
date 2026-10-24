const http = require('http');

function postJson(path, payload, cookies = '') {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Cookie': cookies
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function putJson(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: body });
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runTest() {
    const uniqueEmail = `test_pwd_reset_${Date.now()}@example.com`;
    const initialPassword = 'InitialPassword123!';
    const updatedPassword = 'NewSecretPassword456!';

    console.log('--- Step 1: Register test user ---');
    const regRes = await postJson('/api/auth/register', {
        name: 'Reset Test User',
        username: `resetuser_${Date.now()}`,
        email: uniqueEmail,
        password: initialPassword,
        role: 'freelancer'
    });
    console.log('Registration status:', regRes.status, 'Success:', regRes.data.success);
    if (!regRes.data.success) {
        throw new Error('Registration failed: ' + JSON.stringify(regRes.data));
    }

    console.log('\n--- Step 2: Request Forgot Password ---');
    const forgotRes = await postJson('/api/auth/forgot-password', {
        email: uniqueEmail
    });
    console.log('Forgot password status:', forgotRes.status, 'Message:', forgotRes.data.message);
    console.log('Ethereal preview:', forgotRes.data.etherealUrl);
    const rawToken = forgotRes.data.rawToken;
    console.log('Raw reset token:', rawToken ? 'Token received' : 'Missing token');

    if (!rawToken) {
        throw new Error('rawToken not returned in dev mode');
    }

    console.log('\n--- Step 3: Reset password with token ---');
    const resetRes = await putJson(`/api/auth/reset-password/${rawToken}`, {
        password: updatedPassword,
        confirmPassword: updatedPassword
    });
    console.log('Reset status:', resetRes.status, 'Message:', resetRes.data.message);
    if (resetRes.status !== 200 || !resetRes.data.success) {
        throw new Error('Password reset failed: ' + JSON.stringify(resetRes.data));
    }

    console.log('\n--- Step 4: Verify one-time token invalidation (Replay attack prevention) ---');
    const replayRes = await putJson(`/api/auth/reset-password/${rawToken}`, {
        password: 'AnotherPassword789!',
        confirmPassword: 'AnotherPassword789!'
    });
    console.log('Replay reset status (Expected 400):', replayRes.status, replayRes.data.message);
    if (replayRes.status !== 400) {
        throw new Error('Expected 400 for reused token, got ' + replayRes.status);
    }

    console.log('\n--- Step 5: Test login with OLD password (Must fail 401) ---');
    const oldLoginRes = await postJson('/api/auth/login', {
        email: uniqueEmail,
        password: initialPassword
    });
    console.log('Old password login status (Expected 401):', oldLoginRes.status, oldLoginRes.data.message);
    if (oldLoginRes.status !== 401) {
        throw new Error('Expected 401 with old password, got ' + oldLoginRes.status);
    }

    console.log('\n--- Step 6: Test login with NEW password (Must succeed 200) ---');
    const newLoginRes = await postJson('/api/auth/login', {
        email: uniqueEmail,
        password: updatedPassword
    });
    console.log('New password login status (Expected 200):', newLoginRes.status, newLoginRes.data.success);
    const setCookie = newLoginRes.headers['set-cookie'];
    console.log('Auth cookie received:', !!setCookie);

    if (newLoginRes.status !== 200 || !newLoginRes.data.success || !setCookie) {
        throw new Error('Login with new password failed');
    }

    console.log('\n✅ ALL BACKEND PASSWORD RESET VERIFICATION CHECKS PASSED!');
}

runTest().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
