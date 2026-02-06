const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Send a push notification to a user's device
 * @param {string} pushToken - The Expo push token (e.g. ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx])
 * @param {string} title - The title of the notification
 * @param {string} body - The message body
 * @param {object} data - Optional data payload
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return { success: false, error: 'Invalid push token' };
  }

  // Create the message
  const messages = [{
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  }];

  try {
    // Send the chunks to the Expo push notification service
    let ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log('Push Notification Ticket:', ticketChunk);

    return { success: true, tickets: ticketChunk };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPushNotification };
