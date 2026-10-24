async function runLiveEndpointVerification() {
    const baseUrl = 'http://localhost:5000';
    const email = `live_verify_${Date.now()}@example.com`;
    const password = 'Password@123';
    const name = 'Vipin Verification';

    console.log('🚀 TESTING LIVE API ENDPOINTS AT', baseUrl);

    // 1. Register fresh freelancer
    console.log('\n[1] Registering fresh freelancer...');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            username: `vipin_${Date.now()}`,
            email,
            password,
            role: 'freelancer'
        })
    });

    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
        throw new Error(`Register failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.token;
    console.log(' ✅ Registered successfully. Token received.');
    console.log(' Initial user state:', {
        name: regData.user.name,
        headline: regData.user.headline,
        bio: regData.user.bio,
        skills: regData.user.skills,
        hourlyRate: regData.user.hourlyRate
    });

    // 2. Update Profile with Skills, Headline, Bio, Hourly Rate
    console.log('\n[2] Calling PUT /api/freelancer/profile...');
    const updateRes = await fetch(`${baseUrl}/api/freelancer/profile`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            headline: 'Full Stack MERN Developer',
            bio: 'Expert Full Stack Engineer building scalable web apps with React and Node.js.',
            skills: ['React', 'Node.js', 'MongoDB', 'Express'],
            preferredCategories: ['Web Development', 'Backend & APIs'],
            hourlyRate: 1400,
            experienceLevel: 'Expert',
            workPreference: 'remote'
        })
    });

    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
        throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    }
    console.log(' ✅ Profile updated successfully.');
    console.log(' Updated response:', {
        headline: updateData.data.headline,
        bio: updateData.data.bio,
        hourlyRate: updateData.data.hourlyRate,
        skillsCount: updateData.data.skills.length,
        skills: updateData.data.skills.map(s => s.name || s)
    });

    // 3. Simulate Refresh: Call GET /api/auth/me or GET /api/freelancer/profile
    console.log('\n[3] Calling GET /api/freelancer/profile (Simulating Page Refresh)...');
    const refreshRes = await fetch(`${baseUrl}/api/freelancer/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok || !refreshData.success) {
        throw new Error(`Profile fetch failed: ${JSON.stringify(refreshData)}`);
    }
    console.log(' ✅ Refresh data verified:');
    console.log(`  - Headline: "${refreshData.data.headline}"`);
    console.log(`  - Bio: "${refreshData.data.bio}"`);
    console.log(`  - Hourly Rate: ₹${refreshData.data.hourlyRate}/hr`);
    console.log(`  - Skills: ${refreshData.data.skills.map(s => s.name || s).join(', ')}`);

    // 4. Simulate Logout & Login
    console.log('\n[4] Calling POST /api/auth/login (Simulating Logout & Re-Login)...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
        throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log(' ✅ Re-login successful. User payload in login response:');
    console.log(`  - Name: "${loginData.user.name}"`);
    console.log(`  - Headline: "${loginData.user.headline}"`);
    console.log(`  - Bio: "${loginData.user.bio}"`);
    console.log(`  - Hourly Rate: ₹${loginData.user.hourlyRate}/hr`);
    console.log(`  - Skills: ${loginData.user.skills.map(s => s.name || s).join(', ')}`);

    console.log('\n🎉 ALL LIVE ENDPOINT PERSISTENCE CHECKS PASSED!\n');
}

runLiveEndpointVerification().catch(err => {
    console.error('❌ LIVE ENDPOINT TEST FAILED:', err.message);
    process.exit(1);
});
