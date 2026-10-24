const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/admin/new project/gigora/backend/.env' });

function postJson(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'POST',
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
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    const User = require('../models/User');

    console.log('=== TEST 1: Unknown Email Privacy & Enumeration Protection ===');
    const unknownEmail = `totally_random_fake_email_${Date.now()}@example.com`;
    const unknownRes = await postJson('/api/auth/forgot-password', { email: unknownEmail });
    console.log('Status code for unknown email (Expected 200):', unknownRes.status);
    console.log('Response message:', unknownRes.data.message);

    if (unknownRes.status !== 200 || !unknownRes.data.success) {
        throw new Error(`Unknown email returned status ${unknownRes.status} instead of 200`);
    }

    console.log('\n=== TEST 2: Existing User Reset Request ===');
    const validEmail = `secure_user_${Date.now()}@example.com`;
    const initialPassword = 'InitialPassword123!';
    const newPassword = 'NewSecurePassword456!';

    await postJson('/api/auth/register', {
        name: 'Secure Test User',
        username: `secuser_${Date.now()}`,
        email: validEmail,
        password: initialPassword,
        role: 'client'
    });

    const knownRes = await postJson('/api/auth/forgot-password', { email: validEmail });
    console.log('Status code for known email (Expected 200):', knownRes.status);
    console.log('Response message:', knownRes.data.message);

    // Verify messages are 100% identical
    if (knownRes.data.message !== unknownRes.data.message) {
        throw new Error('Privacy vulnerability: response messages differ between existing and non-existing users!');
    }

    // Verify raw token is NOT leaked in JSON
    if (knownRes.data.rawToken) {
        throw new Error('Security vulnerability: rawToken is leaked in JSON response!');
    }
    console.log('✅ Generic response verified & zero token leakage in JSON');

    console.log('\n=== TEST 3: Token Expiry & Password Reset Execution ===');
    // Find the user directly in MongoDB to verify resetPasswordToken hash and expiry
    const dbUser = await User.findOne({ email: validEmail });
    console.log('User has hashed reset token in DB:', !!dbUser.resetPasswordToken);
    console.log('Reset expiry time (Date):', dbUser.resetPasswordExpire);
    const expiryMinutes = Math.round((dbUser.resetPasswordExpire.getTime() - Date.now()) / (60 * 1000));
    console.log(`Reset token lifespan: ~${expiryMinutes} minutes (Expected ~30 min)`);

    if (expiryMinutes < 28 || expiryMinutes > 31) {
        throw new Error(`Token expiry is not ~30 minutes: got ${expiryMinutes} minutes`);
    }

    // Test token reset with an intentionally mock token generated and stored
    const crypto = require('crypto');
    const testRawToken = 'testrawsecrettoken999111222333444555';
    const testHashedToken = crypto.createHash('sha256').update(testRawToken).digest('hex');
    dbUser.resetPasswordToken = testHashedToken;
    dbUser.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await dbUser.save();

    const resetRes = await putJson(`/api/auth/reset-password/${testRawToken}`, {
        password: newPassword,
        confirmPassword: newPassword
    });
    console.log('Reset response status:', resetRes.status, resetRes.data.message);
    if (resetRes.status !== 200 || !resetRes.data.success) {
        throw new Error('Password reset failed: ' + JSON.stringify(resetRes.data));
    }

    console.log('\n=== TEST 4: One-time Token Invalidation (Replay Prevention) ===');
    const replayRes = await putJson(`/api/auth/reset-password/${testRawToken}`, {
        password: 'AnotherPassword999!',
        confirmPassword: 'AnotherPassword999!'
    });
    console.log('Replay reset status (Expected 400):', replayRes.status, replayRes.data.message);
    if (replayRes.status !== 400) {
        throw new Error('Token was not invalidated after first use!');
    }

    console.log('\n=== TEST 5: Verify Old Password Fails and New Password Works ===');
    const oldLogin = await postJson('/api/auth/login', { email: validEmail, password: initialPassword });
    console.log('Old password login (Expected 401):', oldLogin.status, oldLogin.data.message);
    if (oldLogin.status !== 401) {
        throw new Error('Old password was still accepted!');
    }

    const newLogin = await postJson('/api/auth/login', { email: validEmail, password: newPassword });
    console.log('New password login (Expected 200):', newLogin.status, newLogin.data.success);
    if (newLogin.status !== 200 || !newLogin.data.success) {
        throw new Error('New password failed to log in!');
    }

    console.log('\n🎉 ALL 3 ISSUES VERIFIED & RESOLVED SUCCESSFULLY!');
    await mongoose.disconnect();
}

runTest().catch(async (err) => {
    console.error('❌ Test failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
});
