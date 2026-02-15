const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

// The token from previous step
const somePushTokens = ['ExponentPushToken[gxz6UaBaw2una0iDSOuyRD]'];

async function sendPushNotification() {
    let messages = [];
    for (let pushToken of somePushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: 'Test Notification 🚀',
            body: 'This is a test notification from the backend!',
            data: { withSome: 'data' },
        });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    console.log('Sending notification...');

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('Tickets:', ticketChunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
        }
    }
}

sendPushNotification();
