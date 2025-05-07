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
const processReceivedMessage = async (remoteMessage) => 
{
	if (!remoteMessage || !remoteMessage.data) {
		console.warn('[FCMService] Received message is empty or malformed:', remoteMessage);
		return;
	}

	const db = await getDBConnection();
	const tsNow = Math.floor(Date.now() / 1000);
	const { channel_desc, channel_id, channel_name, created, expires, log_id, message,  msg_src, msg_url, title, type } = remoteMessage.data;

	let soundFile = "";
	if (type === '1') {
		soundFile = "sf1";
	} else if (type === '2') {
		soundFile = "sf2";
	} else if (type === '3') {
		soundFile = "sf3";
	}

	AppState.notiPopup = 0;

	const channelInfo = await getChannel(db, channel_id);
	if (!channelInfo) {
		console.log('[FCMService] Channel not found in DB, adding new channel:', channel_id, channel_name, channel_desc);
		await addChannel(db, channel_id, channel_name, channel_desc, '0');
		// TODO: Handle channel creation logic, e.g., show a popup or notification to the user
	} else {
		console.log('[FCMService] Channel already exists in DB:', channel_id, channel_name, channel_desc);
		AppState.channelAppId = channelInfo.app_id;
		AppState.channelId = channelInfo.channel_id;
		AppState.channelName = channelInfo.channel_name;
		AppState.channelDesc = channelInfo.channel_desc;
		AppState.channelStatus = channelInfo.status;

		// Get status of the channel
		if (AppState.channelStatus === '0') {
			console.log('[FCMService] Channel is inactive, not processing notification:', channel_id, channel_name, channel_desc);
			return; // Channel is inactive, do not process the notification
		}
	}

    console.log('Remote message:', channel_desc, channel_id, channel_name, created, expires, log_id, message,  msg_src, msg_url, title, type);


	await handleNotificationSoundAndStorage(db, currentChannelAppId, originalNotiId, sysSoundFileKey, '1', sysTitle, sysMessage, "0", "0", String(tsNow), String(tsNow + 3600), rptLogIdForThisMessage, true);
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