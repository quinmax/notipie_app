import messaging from '@react-native-firebase/messaging';
import Sound from 'react-native-sound';
import { Alert, Platform, DeviceEventEmitter } from 'react-native';
import { getDBConnection, addChannel, getChannel, insertNotification, updateProfileFcmToken } from './Database'; // Adjust path if needed
// import { navigate } from './NavigationService'; // Optional: if you have a navigation service for direct navigation

// --- Sound Asset Imports ---
// Place your sound files (e.g., sf1.mp3, sf2.mp3) in a directory like 'src/assets/sounds/'
// and adjust the require paths accordingly.
const soundAssets = {
    'sf1': require('../assets/sounds/sf1.mp3'),
    'sf2': require('../assets/sounds/sf2.mp3'),
    'sf3': require('../assets/sounds/sf3.mp3')
    // Add other sound files here
};

// --- AppState (Datapool Equivalent) ---
// This object holds state similar to your Java Datapool.
// For more complex apps or UI reactivity, consider React Context or a state library.
const AppState = {
    rptLogId: '0',
	contactId: null, // Added to store the user's contact_id
	currentFcmToken: null, // To store the latest FCM token
    msgTitle: '',
    msgBody: '',
    notiPopup: 0,
    popupChannelId: 0,
    popupNotiId: 0,
    popupChannelName: '',
    channelAppId: 0,
    channelId: '',
    channelName: '',
    channelDesc: '',
    channelStatus: '0', // '0' for inactive, '1' for active
    gotMail: 0,
    emailAddress: '', // This needs to be set (e.g., from user profile after login)
};

let soundQueue = [];
let isPlayingSound = false;
let currentMediaPlayer = null;

/**
 * Initializes FCM listeners and requests permissions.
 * Call this from your App.js or main application entry point.
 */
export const initializeFCM = async () => {
    if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) console.log('[FCMService] iOS Authorization status:', authStatus);
    }

    messaging().onMessage(async remoteMessage => {
        console.log('[FCMService] Foreground Message Received:', JSON.stringify(remoteMessage));
		// Ensure AppState has user details if available before processing
        // This might be redundant if initializeFCM is called after profile load, but good for safety
        await processReceivedMessage(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('[FCMService] Background/Quit Message Received:', JSON.stringify(remoteMessage));
		// Background messages might not have AppState fully populated if app was quit.
        // Token sending logic here should be mindful of this.
        await processReceivedMessage(remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('[FCMService] Notification caused app to open from background:', remoteMessage);
        // TODO: Handle navigation or action based on remoteMessage.data
        // Example: if (remoteMessage.data.screen) navigate(remoteMessage.data.screen);
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('[FCMService] Notification caused app to open from quit state:', remoteMessage);
            // Handle navigation or action
			// TODO: Handle navigation or action
        }
    });

    messaging().getToken().then(token => {
        console.log('[FCMService] FCM Token:', token);
        // Send this token to your server
		AppState.currentFcmToken = token;
        handleAndSendToken(token);
    });

    messaging().onTokenRefresh(token => {
        console.log('[FCMService] FCM Token Refresh:', token);

        AppState.currentFcmToken = token;
        handleAndSendToken(token);
    });
};

/**
 * Handles the FCM token by sending it to the server and storing it locally.
 * @param {string} token - The FCM token.
 */
const handleAndSendToken = async (token) => {
    if (!token) return;

    // Send to your backend server
    await sendTokenToServer(token);

    // Store locally in SQLite
    await storeTokenInProfile(token);
};

/**
 * Sends the FCM token to your backend server.
 * @param {string} token - The FCM token.
 */
const sendTokenToServer = async (token) => {
	if (!AppState.contactId) {
        console.log('[FCMService] contactId not available in AppState, cannot send FCM token to server yet.');
        // The token is in AppState.currentFcmToken.
        // It will be sent when contactId is updated via updateFCMAppState.
        return;
    }

    // IMPORTANT: Replace with your actual server URL for token registration
    const TOKEN_REGISTRATION_URL = 'http://192.168.1.28/notipie/api/refresh_token'; // <--- IMPORTANT: Replace with your actual server URL
    if (TOKEN_REGISTRATION_URL === 'YOUR_FCM_TOKEN_REGISTRATION_URL') {
        console.warn('[FCMService] Placeholder URL detected for token registration. Please update.');
        return;
    }

    const payload = {
        fcm_token: token,
        user_id: AppState.contactId, // Server expects a valid positive user_id
        // email_address: AppState.emailAddress, // Or email, depending on your backend
    };

    console.log('[FCMService] Sending FCM token to server:', payload);
    try {
        const response = await fetch(TOKEN_REGISTRATION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' /* Add Auth headers if needed */ },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            console.log('[FCMService] FCM token sent to server successfully.');
        } else {
            console.error('[FCMService] Failed to send FCM token to server:', response.status, await response.text());
        }
    } catch (error) {
        console.error('[FCMService] Error sending FCM token to server:', error);
    }
};

/**
 * Stores the FCM token in the local profile table.
 * @param {string} token - The FCM token.
 */
const storeTokenInProfile = async (token) => {
    if (!AppState.contactId) {
        console.log('[FCMService] contactId not available in AppState, cannot store FCM token in profile yet.');
        // The token is in AppState.currentFcmToken, Setup.jsx can use it when creating the profile.
        return;
    }
    try {
        const db = await getDBConnection();
        if (db) {
            await updateProfileFcmToken(db, AppState.contactId, token);
            console.log('[FCMService] FCM token updated in local profile for contactId:', AppState.contactId);
        }
    } catch (error) {
        console.error('[FCMService] Error storing FCM token in local profile:', error);
    }
};





/**
 * Main logic for processing a received FCM message.
 */
const processReceivedMessage = async (remoteMessage) => {
    const data = remoteMessage.data;
    if (!data) {
        console.log('[FCMService] Message data is empty.');
        return;
    }

    console.log('[FCMService] Processing message data:', data);
    const rptLogIdForThisMessage = data.log_id || '0';
    AppState.rptLogId = rptLogIdForThisMessage; // Set global for potential other uses

    const title = data.title || 'Notification';
    const message = data.message || 'You have a new message.';
    const type = data.type || '1';
    const soundFileKey = data.type ? `sf${data.type}` : 'noti_tone'; // Maps type "1" to "sf1"
    const msgSrc = data.msg_src || '0';
    const msgUrl = data.msg_url || '0';
    const created = data.created || String(Math.floor(Date.now() / 1000));
    const expires = data.expires || String(Math.floor(Date.now() / 1000) + 3600); // Default 1 hour
    const channelId = data.channel_id || '0'; // '0' for general/no specific channel
    const channelName = data.channel_name || '';
    const channelDesc = data.channel_desc || '';

    AppState.notiPopup = 0;

    const db = await getDBConnection();
    if (!db) {
        console.error("[FCMService] Failed to get database connection.");
        return;
    }

    let channelInfo = (channelId !== '0') ? await getChannel(db, channelId) : null;
    let currentChannelAppId = 0; // This is the internal DB ID for the channel
    let effectiveChannelStatus = '1'; // Default to active, especially for channel_id '0'

    if (channelInfo && channelInfo.id) { // Channel exists
        currentChannelAppId = channelInfo.app_id; // Ensure your getChannel returns app_id
        AppState.channelAppId = channelInfo.app_id;
        AppState.channelId = channelInfo.id;
        AppState.channelName = channelInfo.name;
        AppState.channelDesc = channelInfo.description;
        AppState.channelStatus = channelInfo.status; // '0' or '1'
        effectiveChannelStatus = channelInfo.status;
        console.log(`[FCMService] Channel ${channelId} exists. Status: ${effectiveChannelStatus}`);
    } else if (channelId !== '0') { // Channel does not exist, and it's a specific new channel
        console.log(`[FCMService] Channel ${channelId} does not exist. Adding...`);
        const newChannelDbId = await addChannel(db, channelId, channelName, channelDesc, '0'); // Add as inactive

        if (newChannelDbId !== -1) {
            currentChannelAppId = newChannelDbId;
            AppState.channelAppId = newChannelDbId;
            AppState.channelId = channelId;
            AppState.channelName = channelName;
            AppState.channelDesc = channelDesc;
            AppState.channelStatus = '0'; // New channels are inactive
            effectiveChannelStatus = '0';
            console.log(`[FCMService] New channel inserted with app_id: ${newChannelDbId}. Status: ${effectiveChannelStatus}`);

            // Logic for "New Channel Detected" system message (as per Java code)
            const tsNow = Math.floor(Date.now() / 1000);
            const sysSoundFileKey = 'sf1'; // System sound for new channel
            const sysTitle = 'New Channel Detected';
            const sysMessage = `${channelName} would like to send you notifications. Please visit the Channels page to manage your preferences.`;

            // Insert the original notification first, linked to the new channel
            const originalNotiId = await insertNotification(db, currentChannelAppId, 0, title, message, type, msgSrc, msgUrl, soundFileKey, parseInt(created), parseInt(expires));
            console.log(`[FCMService] Original notification for new channel inserted with ID: ${originalNotiId}`);

            // Handle the "system notification" for the new channel (plays sound, adds to DB)
            // This system message is linked to the original notification that triggered its creation.
            await handleNotificationSoundAndStorage(db, currentChannelAppId, originalNotiId, sysSoundFileKey, '1', sysTitle, sysMessage, "0", "0", String(tsNow), String(tsNow + 3600), rptLogIdForThisMessage, true);

            // The UI should guide the user to activate the channel.
            // For now, the channel is added but remains inactive for subsequent messages until user changes it.
        } else {
            console.error("[FCMService] Failed to insert new channel. Original notification not processed further.");
            return; // Stop if channel can't be added
        }
    }
    // If channelId is '0', effectiveChannelStatus remains '1' (default active)

    console.log(`[FCMService] Effective status for channel ${channelId}: ${effectiveChannelStatus}`);

    // If channel is inactive (and not the special channel '0'), store notification silently and return
    if (effectiveChannelStatus === '0' && channelId !== '0') {
        console.log(`[FCMService] Channel ${channelName} (${channelId}) is inactive. Storing notification silently.`);
        // Ensure notification is stored even if channel is inactive (if not already stored during new channel creation)
        // The new channel logic above already stores the original notification.
        // If it's an existing inactive channel, we might want to store it here.
        if (!channelInfo) { // If it wasn't a new channel scenario, store it now.
             await insertNotification(db, currentChannelAppId, 0, title, message, type, msgSrc, msgUrl, soundFileKey, parseInt(created), parseInt(expires));
        }
        DeviceEventEmitter.emit('notificationsUpdated'); // Notify UI to refresh list
        return;
    }

    // If channel is active (or channelId '0', or it was a system message for a new channel)
    AppState.msgTitle = title;
    AppState.msgBody = message;

    // The system message for a new channel already had its sound played by the call above.
    // So, only play sound for the original message if it wasn't part of new channel creation's system message.
    // The `isSystemMessage` flag in `handleNotificationSoundAndStorage` helps distinguish.
    // If it's not a new channel, or if it is but this is the primary notification processing.
    if (!(channelId !== '0' && !channelInfo)) { // Not a new channel being added right now (that case handled above)
        await handleNotificationSoundAndStorage(db, currentChannelAppId, 0, soundFileKey, type, title, message, msgSrc, msgUrl, created, expires, rptLogIdForThisMessage, false);
    }

    if (remoteMessage.notification) {
        console.log('[FCMService] Message also contained a notification payload:', remoteMessage.notification);
        // This is usually handled by the system if app is in background/quit.
        // If in foreground, you might choose to display it as a local notification.
    }
};

/**
 * Handles storing notification in DB, playing sound, and adding to queue.
 * @param {boolean} isSystemMessage - True if this is the "New Channel Detected" system message.
 */
const handleNotificationSoundAndStorage = async (db, CId, NId, soundKey, msgType, title, message, msgSrc, msgUrl, created, expires, rptLogId, isSystemMessage) => {
    AppState.msgTitle = title;
    AppState.msgBody = message;

    const createdInt = parseInt(created);
    const expiresInt = parseInt(expires);

    // Store the notification
    const notificationId = await insertNotification(db, CId, NId, title, message, msgType, msgSrc, msgUrl, soundKey, createdInt, expiresInt);
    console.log(`[FCMService] Notification (ID: ${notificationId}, System: ${isSystemMessage}) stored. Title: ${title}`);
    AppState.gotMail = 1;

    DeviceEventEmitter.emit('notificationsUpdated', { newNotificationId: notificationId });

    // Add to sound queue
    const soundDetails = { msgSrc, msgUrl, soundKey, rptLogId, title, message };
    soundQueue.push(soundDetails);

    if (!isPlayingSound) {
        playNextSound();
    }
};

/**
 * Plays the next sound in the queue.
 */
const playNextSound = async () => {
    if (currentMediaPlayer) {
        currentMediaPlayer.release();
        currentMediaPlayer = null;
    }

    if (soundQueue.length === 0) {
        isPlayingSound = false;
        return;
    }

    isPlayingSound = true;
    const { msgSrc, msgUrl, soundKey, rptLogId, title } = soundQueue.shift();

    let soundResource;
    let isRemote = false;

    if (msgSrc === '0' || msgSrc === 0) { // Internal sound
        console.log(`[FCMService] Preparing to play internal sound: ${soundKey} for "${title}"`);
        soundResource = soundAssets[soundKey];
        if (!soundResource) {
            console.error(`[FCMService] Sound asset for key '${soundKey}' not found.`);
            sendReport(0, rptLogId, AppState.emailAddress);
            isPlayingSound = false;
            playNextSound(); // Try next
            return;
        }
    } else { // Remote sound
        console.log(`[FCMService] Preparing to play remote sound: ${msgUrl} for "${title}"`);
        soundResource = msgUrl;
        isRemote = true;
    }

    Sound.setCategory('Playback'); // Ensures sound plays correctly (especially on iOS)

    currentMediaPlayer = new Sound(soundResource, isRemote ? '' : null, (error) => {
        if (error) {
            console.error('[FCMService] Failed to load sound:', soundKey || msgUrl, error);
            sendReport(0, rptLogId, AppState.emailAddress); // Report failure
            isPlayingSound = false;
            currentMediaPlayer = null;
            playNextSound(); // Attempt next sound
            return;
        }

        console.log(`[FCMService] Sound loaded: ${soundKey || msgUrl}. Playing...`);
        currentMediaPlayer.play(success => {
            if (success) {
                console.log('[FCMService] Sound played successfully:', soundKey || msgUrl);
                sendReport(1, rptLogId, AppState.emailAddress); // Report success
            } else {
                console.error('[FCMService] Sound playback failed:', soundKey || msgUrl);
                sendReport(0, rptLogId, AppState.emailAddress); // Report failure
            }
            if (currentMediaPlayer) { // Check if it hasn't been cleared by a rapid next call
                currentMediaPlayer.release();
            }
            currentMediaPlayer = null;
            isPlayingSound = false;
            playNextSound(); // Play next in queue
        });
    });
};

/**
 * Sends a report to the server (equivalent to VolleyReport).
 */
const sendReport = async (appResult, rptLogId, emailAddress) => {
    if (rptLogId === '0' || !rptLogId) {
        console.log("[FCMService] rptLogId is '0' or missing, skipping report.");
        return;
    }
    if (!emailAddress) {
        console.warn("[FCMService] Email address not available for sending report. Report may be incomplete or skipped.");
        // Potentially try to fetch email from AsyncStorage or global config if critical
        // const storedEmail = await AsyncStorage.getItem('userEmail'); // Example
        // if (!storedEmail) return;
        // emailAddress = storedEmail;
        return; // Skip if no email
    }

    const reportUrl = 'YOUR_REPORT_SERVER_URL'; // <--- IMPORTANT: Replace with your actual server URL
    const payload = {
        request_id: rptLogId,
        email_address: emailAddress,
        app_result: appResult, // 1 for success, 0 for failure
    };

    console.log('[FCMService] Sending report:', payload);

    try {
        const response = await fetch(reportUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        if (response.ok) {
            console.log('[FCMService] Report sent successfully:', responseText);
        } else {
            console.error('[FCMService] Failed to send report:', response.status, responseText);
        }
    } catch (error) {
        console.error('[FCMService] Error sending report:', error);
    }
};

/**
* Public method to update parts of the AppState, e.g., emailAddress after login.
* @param {string} key - The key in AppState to update.
* @param {*} value - The new value.
*/
export const updateFCMAppState = (key, value) => {
    if (AppState.hasOwnProperty(key)) {
        AppState[key] = value;
        console.log(`[FCMService] AppState updated: ${key} =`, value);

		// If contactId is being set and we have a pending FCM token, try to store it now.
        if (key === 'contactId' && value && AppState.currentFcmToken) {
            console.log('[FCMService] contactId updated, attempting to store current FCM token in profile.');
            storeTokenInProfile(AppState.currentFcmToken);
			console.log('[FCMService] contactId updated, attempting to send current FCM token to server.');
            sendTokenToServer(AppState.currentFcmToken); // Also attempt to send to server now
        }
    } else {
        console.warn(`[FCMService] Attempted to set unknown AppState key: ${key}`);
    }
};

export const getCurrentFcmToken = () => {
    return AppState.currentFcmToken;
};