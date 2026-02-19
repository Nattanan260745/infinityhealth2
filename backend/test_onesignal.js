
const ONESIGNAL_APP_ID = '62a8a981-4a2b-4a4f-8b7b-e67c65ff0017';
// ใส่ Key ที่คุณต้องการเทสตรงนี้ (หรือเอาจากข้างบน)
const ONESIGNAL_API_KEY = 'os_v2_app_mkuktakkfnfe7c334z6gl7yac5wcwvgrphhu3rurwr2yqacdgazud4bhikkudqerp56qnq6fmrsj37yu2gkwkhtgunaitni7h4wludi';

// Use standard HTTPS request (no library) to test Raw API Key
const https = require('https');

const data = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    contents: { en: "Test Notification from Script" },
    included_segments: ["Total Subscriptions"] // Send to everyone for test (or specific player_id if you have one)
});

const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + ONESIGNAL_API_KEY // Try Basic Auth first (Standard)
    }
};

console.log('Testing OneSignal API Key...');
console.log('App ID:', ONESIGNAL_APP_ID);
console.log('API Key (Length):', ONESIGNAL_API_KEY.length);

const req = https.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', d => {
        responseBody += d;
    });

    res.on('end', () => {
        try {
            console.log('Response:', JSON.parse(responseBody));
        } catch (e) {
            console.log('Response (Raw):', responseBody);
        }

        if (res.statusCode === 200) {
            console.log('✅ SUCCESS! Key is Valid.');
        } else {
            console.log('❌ FAILED. Key is Invalid or Permissions denied.');
        }
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
