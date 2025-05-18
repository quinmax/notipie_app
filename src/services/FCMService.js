import { getMessaging, onMessage, onBackgroundMessage, getToken, AuthorizationStatus } from '@react-native-firebase/messaging';
import appStateManager from './AppStateManager';
import { getDBConnection, checkChannelExists, getChannel, addChannel, insertNotification, getProfile } from './Database';
import eventEmitter from './EventEmitter';
import SystemSetting from 'react-native-system-setting';
import SoundQueueManager from './SoundQueueManager';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config'; // Adjust the import path as needed

export const initializeFCM = async () => 
{
  console.log('[FCMService] Initializing FCM...');

  	try 
	{
		const messaging = getMessaging();
		console.log('[FCMService] Messaging instance obtained.');

		// Set mutemode to off
		if (appStateManager.get('muteMode') === undefined) {
			appStateManager.set('muteMode', false);
			console.log('[FCMService] muteMode was not set. Defaulting to false.');
		}
		console.log('[FCMService] Mutemode set to 0.');

		// Request permissions for iOS
		if (Platform.OS === 'ios') 
		{
			console.log('[FCMService] Requesting iOS permissions...');
			const authStatus = await messaging.requestPermission();
			const enabled =
				authStatus === AuthorizationStatus.AUTHORIZED ||
				authStatus === AuthorizationStatus.PROVISIONAL;
			if (enabled) 
			{
				console.log('[FCMService] iOS Authorization status:', authStatus);
			} 
			else 
			{
				console.log('[FCMService] iOS permission not granted. Status:', authStatus);
			}
		}

		// Request permissions for Android 13+ (API 33+)
		if (Platform.OS === 'android' && Platform.Version >= 33) 
		{
			const authStatus = await messaging.requestPermission();
			const enabled =
			authStatus === AuthorizationStatus.AUTHORIZED ||
			authStatus === AuthorizationStatus.PROVISIONAL;

			if (enabled) 
			{
				console.log('[FCMService] Android notification permission granted:', authStatus);
			} 
			else 
			{
				console.log('[FCMService] Android notification permission not granted. Status:', authStatus);
			}
		}

		messaging.onTokenRefresh(token => 
		{
			console.log('[FCMService] FCM Token refreshed:', token);
			appStateManager.set('fcmToken', token);
			// Optionally, send the new token to your backend server here
			sendFcmTokenToServer(token);
		});

		console.log('[FCMService] Setting up onMessage handler...');
		onMessage(messaging, async (remoteMessage) => 
		{
			console.log('[FCMService] Foreground Message Received:', remoteMessage);
			await processReceivedMessage(remoteMessage);
		});
    	console.log('[FCMService] onMessage handler set up.');

		console.log('[FCMService] Attempting to get FCM token...');
		const token = await getToken(messaging);
		console.log('[FCMService] FCM Token:', token); // This is the line you're interested in
		appStateManager.set('fcmToken', token);
		sendFcmTokenToServer(token);

		console.log('[FCMService] FCM token stored in AppStateManager.');
	} catch (error) {
		console.error('[FCMService] Error during FCM initialization:', error);
	}
};

const sendFcmTokenToServer = async (token) => {
  try {
    console.log('[FCMService] Sending FCM token to server:', token);

    const profile = await fetchProfile();
    const user_id = profile ? profile.contact_id : null;

    if (!user_id || !token) {
      console.warn('[FCMService] Missing user_id or token, not sending to server.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,      // <-- match PHP expects user_id
        fcm_token: token,      // <-- match PHP expects fcm_token
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FCMService] Failed to update FCM token on server:', errorText);
      return;
    }

    const result = await response.json();
    console.log('[FCMService] FCM token update response:', result);
  } catch (error) {
    console.error('[FCMService] Error sending FCM token to server:', error);
  }
};

async function fetchProfile() 
{
	const db = await getDBConnection();

	const profile = await getProfile(db);
	if (profile) 
	{
		return profile;
	} 
	else 
	{
		console.warn('[FCMService] No profile data found.');
		return null;
	}
}

export const processReceivedMessage = async (remoteMessage) => 
{
	// Your logic for processing the message
  	console.log('[FCMService] Processing message:', remoteMessage);

  	// TODO: Need to see if data is empty or not. Only process data notifications.
  	if (remoteMessage.data) 
	{
		console.log('[FCMService] Message data:', remoteMessage.data);

		// Emit the event with the notification data
		eventEmitter.emit('notificationsUpdated', remoteMessage.data);

		const channelDesc = remoteMessage.data.channel_desc || 'Default Channel';
		const channelId = remoteMessage.data.channel_id || '0';
		const channelName = remoteMessage.data.channel_name || 'Default Channel Name';
		const created = remoteMessage.data.created || '0';
		const expires = remoteMessage.data.expires || '0';
		const logId = remoteMessage.data.log_id || '0';
		const message = remoteMessage.data.message || 'No message';
		const msgSrc = remoteMessage.data.msg_src || '0';
		const msgUrl = remoteMessage.data.msg_url || '';
		const title = remoteMessage.data.title || 'No title';
		const type = remoteMessage.data.type || '0';

		// Add logid to datapool
		appStateManager.set('rptLogId', channelId);

		// Check what internal sound file to use and assign to {soundfile}
		let soundFileName = 'sf1.mp3';
		if (type === '2') {
		soundFileName = 'sf2.mp3';
		} else if (type === '3') {
		soundFileName = 'sf3.mp3';
		}

		appStateManager.set('notiPopup', "0");

		// Check if the channel exists : channelId
		try 
		{
			// Get the database connection
			const db = await getDBConnection();
			console.log('[FCMService] Database connection:', db);

			// Check if the channel already exists
			const channelExists = await checkChannelExists(db, channelId);

			if (channelExists) 
			{
				// Get the channel info from database
				const channelInfo = await getChannel(db, channelId);
				
				if (channelInfo) 
				{
					const { status, description, name, channel_id, app_id } = channelInfo;

					console.log('[FCMService] Channel Info:');
					console.log('Status:', status);
					console.log('Description:', description);
					console.log('Name:', name);
					console.log('Channel ID:', channel_id);
					console.log('App ID:', app_id);

					// Add channel info to AppStateManager or process it further
					appStateManager.set('channelAppId', app_id);
					appStateManager.set('channelId', channel_id);
					appStateManager.set('channelName', name);
					appStateManager.set('channelDescription', description);
					appStateManager.set('channelStatus', status);

					// const getChannelStatus = appStateManager.get('channelStatus');

					if (status === '0' || appStateManager.get('muteMode') === true)
					{
						console.log('[FCMService] Channel is disabled. Not showing notification.');
						return;
					}

					appStateManager.set('title', title);
					appStateManager.set('message', message);

					console.log('Data:', channelDesc, channelId, channelName, created, expires, logId, message, msgSrc, msgUrl, title, type);

					const noti = {
						sysChannelId: "0",
						sysNotiId: "0",
						soundFile: soundFileName,
						msgType: "0",
						title: title,
						message: message,
						msgSrc: msgSrc,
						msgUrl: msgUrl,
						created: created,
						expires: expires,
						isPopup: false,
					};

					handleNotification(noti);

				} 
				else 
				{
					console.log(`[FCMService] No channel info found for channelId: ${channelId}`);
				}
			} 
			else 
			{
				// TODO: Ask user to accept/decline and add etc
				// Process if channel does not exist:
				// - Add channel to db and get channel id - sysChannelid
				// - Add incoming noti to db and get notiid - sysNotiId
				// - Create a dummy new channel detected noti and send that yo handleNotification
				// - Noti should play by talking to the emmiter and showing the noti
				// - Where in Main.js we detect the noti in order to show it we check if the popup is primed
				// -  Do a if to show on or the other
				// - If user selects decline then set status to 0
				// - If user selects accept the set channel_status to 1 and use the sysNotiId to fetch the origonal incoming message - load and play the sound
				console.log(`[FCMService] Channel "${channelId}" does not exist. Adding to database.`);

				// Get db connection
				const db = await getDBConnection();

				const sysChannelId = await addChannel(db, channelId, channelName, channelDesc, 0);
				console.log(`[FCMService] Channel "${channelId}" added to database with ID: ${sysChannelId}`);

				appStateManager.set('channelAppId', sysChannelId);
				appStateManager.set('channelId', channelId);
				appStateManager.set('channelName', channelName);
				appStateManager.set('channelDescription', channelDesc);
				appStateManager.set('channelStatus', 0);

				// Add a notification for real incoming message
				// Convert created and expires to integers
				const createdInt = parseInt(created, 10);
				const expiresInt = parseInt(expires, 10);

				const newNotification = {
					sys_channel_id: 0,
					sys_noti_id: 0,
					title: title,
					message: message,
					msg_type: type,
					msg_src: msgSrc,
					msg_url: msgUrl,
					soundfile: soundFileName,
					created: createdInt,
					expires: expiresInt,
				};

				const sysNotiId = await insertNotification(db, newNotification);	
				console.log('[FCMService] New notification added to database:', newNotification);

				// Build fake notification
				const sysSoundFile = "sf1.mp3";
				const sysType = "1";
				const sysTitle = "New Channel Detected";
				const sysMessage = channelName + " would like to send you notifications.\n\nPlease select ACCEPT if you wish to receive notifications from this channel or DECLINE if you do not wish to receive notifications from this channel.\n\nYou can change this setting on the CHANNELS page.";
				const sysMsgSrc = "0";
				const sysMsgUrl = "";
				const sysCreated = createdInt;
				const sysExpires = expiresInt;

				// Do handleNotification with fake noti


				// Set notiPopup to show
				appStateManager.set('notiPopup', "1");
				appStateManager.set('popupChannelId', sysChannelId);
				appStateManager.set('popupNotiId', sysNotiId);
				appStateManager.set('popupChannelName', channelName);

				const noti = {
						sysChannelId: sysChannelId,
						sysNotiId: sysNotiId,
						soundFile: sysSoundFile,
						msgType: sysType,
						title: sysTitle,
						message: sysMessage,
						msgSrc: sysMsgSrc,
						msgUrl: sysMsgUrl,
						created: sysCreated,
						expires: sysExpires,
						isPopup: true,
					};

				handleNotification(noti);


				console.log(`[FCMService] Channel "${channelId}" added successfully.`);
			}
		} 
		catch (error) 
		{
			console.error('[FCMService] Error processing received message:', error);
		}
	} 
	else 
	{
		console.log('[FCMService] No data in message');
		return;
	}
};

const handleNotification = async (noti) => 
{
	// Destruct the notification object
	const { sysChannelId, sysNotiId, soundFile, msgType, title, message, msgSrc, msgUrl, created, expires, isPopup } = noti;

	// Convert created and expires to integers
	const createdInt = parseInt(created, 10);
	const expiresInt = parseInt(expires, 10);

	// Insert notification into the database
	const newNotification = {
		sys_channel_id: sysChannelId,
		sys_noti_id: sysNotiId,
		title: title,
		message: message,
		msg_type: msgType,
		msg_src: msgSrc,
		msg_url: msgUrl,
		soundfile: soundFile,
		created: createdInt,
		expires: expiresInt,
	};

	// Get db connection
	const db = await getDBConnection();

	// Insert the notification into the database
	console.log('[FCMService] ZZZZ Inserting notification into database:', newNotification);

	if (title != 'No title' && createdInt != '0' && expiresInt != '0') 
	{
		const notificationId = await insertNotification(db, newNotification);
		console.log(`[FCMService] Notification "${notificationId}" added successfully.`);
		// Set appmanager gotMail to 1 and add noti id
		appStateManager.set('gotMail', '1');
		appStateManager.set('newNotiId', notificationId);

		// At this point we probably need to use the emmiter to show the noti in the foreground
		// eventEmitter.emit('notificationsUpdated', {
		// 	title: title,
		// 	message: message,
		// 	soundFile: soundFile,
		// });
		eventEmitter.emit('navigateToNotifications', {
		notificationId: notificationId,
		isPopup: isPopup,
		});


		// Set the device volume to 100%
		// TODO : Put the volume back to full
		const maxVolume = await SystemSetting.getVolume('music');
		SystemSetting.setVolume(1.0, { type: 'music', showUI: true }); // Set volume to 100% and show UI
		console.log('Volume set to maximum.');

		console.log('[FCMService] MsgSrc:', msgSrc);
		if (msgSrc == '0') 
		{
			// Play internal sound
			console.log('[FCMService] Playing internal sound:', soundFile);
			try {
				SoundQueueManager.addToQueue('0', '', soundFile);
			} catch (error) {
				console.error('Error playing internal sound:', error);
			}
		}
		else 
		{
			// Play external sound
			console.log('[FCMService] Playing external sound:', msgUrl);
			try {
				SoundQueueManager.addToQueue('1', msgUrl, '');
			} catch (error) {
				console.error('Error playing external sound:', error);
			}
		}
	}
	
};
