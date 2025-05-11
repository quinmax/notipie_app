import { getMessaging, onMessage, onBackgroundMessage, getToken } from '@react-native-firebase/messaging';
import appStateManager from './AppStateManager';
import { getDBConnection, checkChannelExists, getChannel, addChannel, insertNotification } from './Database';
import eventEmitter from './EventEmitter';
import SystemSetting from 'react-native-system-setting';
import SoundQueueManager from './SoundQueueManager';
import { Platform } from 'react-native';

export const initializeFCM = async () => {
  console.log('[FCMService] Initializing FCM...');

  try {
    const messaging = getMessaging();
    console.log('[FCMService] Messaging instance obtained.');

    // Set mutemode to off
	if (appStateManager.get('muteMode') === undefined) {
		appStateManager.set('muteMode', false);
		console.log('[FCMService] muteMode was not set. Defaulting to false.');
	}
	console.log('[FCMService] Mutemode set to 0.');

 // Request permissions for iOS
    if (Platform.OS === 'ios') {
      console.log('[FCMService] Requesting iOS permissions...');
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('[FCMService] iOS Authorization status:', authStatus);
      } else {
        console.log('[FCMService] iOS permission not granted. Status:', authStatus);
      }
    }

  // Handle foreground messages
//   onMessage(messaging, async (remoteMessage) => {
//     console.log('[FCMService] Foreground Message Received:', remoteMessage);
//     await processReceivedMessage(remoteMessage);
//   });
	console.log('[FCMService] Setting up onMessage handler...');
    onMessage(messaging, async (remoteMessage) => {
      console.log('[FCMService] Foreground Message Received:', remoteMessage);
      await processReceivedMessage(remoteMessage);
    });
    console.log('[FCMService] onMessage handler set up.');

  // Handle background messages
//   onBackgroundMessage(messaging, async (remoteMessage) => {
//     console.log('[FCMService] Background Message Received:', remoteMessage);
//     await processReceivedMessage(remoteMessage);
//   });
	// console.log('[FCMService] Setting up onBackgroundMessage handler...');
    // onBackgroundMessage(messaging, async (remoteMessage) => {
    //   console.log('[FCMService] Background Message Received:', remoteMessage);
    //   await processReceivedMessage(remoteMessage);
    // });
    // console.log('[FCMService] onBackgroundMessage handler set up.');

  // Get the FCM token
//   const token = await getToken(messaging);
//   console.log('[FCMService] FCM Token:', token);
//   appStateManager.set('fcmToken', token);
console.log('[FCMService] Attempting to get FCM token...');
    const token = await getToken(messaging);
    console.log('[FCMService] FCM Token:', token); // This is the line you're interested in
    appStateManager.set('fcmToken', token);
    console.log('[FCMService] FCM token stored in AppStateManager.');
  } catch (error) {
    console.error('[FCMService] Error during FCM initialization:', error);
  }


};

export const processReceivedMessage = async (remoteMessage) => {
  // Your logic for processing the message
  console.log('[FCMService] Processing message:', remoteMessage);

  // TODO: Need to see if data is empty or not. Only process data notifications.
  if (remoteMessage.data) {
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
	const msSrc = remoteMessage.data.msg_src || '0';
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
			
			if (channelInfo) {
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
			} 
			else 
			{
				console.log(`[FCMService] No channel info found for channelId: ${channelId}`);
			}
		} 
		else 
		{
			// TODO: Ask user to accept/decline and add etc
			console.log(`[FCMService] Channel "${channelId}" does not exist. Adding to database.`);
			await addChannel(db, channelId, channelName, channelDesc, 0);
			console.log(`[FCMService] Channel "${channelId}" added successfully.`);
		}

		const getChannelStatus = appStateManager.get('channelStatus');

		if (getChannelStatus === '0' || appStateManager.get('muteMode') === true)
		{
			console.log('[FCMService] Channel is disabled. Not showing notification.');
			return;
		} 
		
		appStateManager.set('title', title);
		appStateManager.set('message', message);

		console.log('Data:', channelDesc, channelId, channelName, created, expires, logId, message, msSrc, msgUrl, title, type);

		const noti = {
			sysChannelId: "0",
			sysNotiId: "0",
			soundFile: soundFileName,
			msgType: type,
			title: title,
			message: message,
			msSrc: msSrc,
			msgUrl: msgUrl,
			created: created,
			expires: expires,
		};

		handleNotification(noti);
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
	const { sysChannelId, sysNotiId, soundFile, msgType, title, message, msSrc, msgUrl, created, expires } = noti;

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
		msg_src: msSrc,
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
		});


		// Set the device volume to 100%
		// QQQ Testing const maxVolume = await SystemSetting.getVolume('music');
		// QQQ Testing SystemSetting.setVolume(1.0, { type: 'music', showUI: true }); // Set volume to 100% and show UI
		console.log('Volume set to maximum.');

		console.log('[FCMService] Playing internal sound:', msgUrl);
		try {
		SoundQueueManager.addToQueue('1', msgUrl, ''); // External sound
		} catch (error) {
			console.error('Error playing external sound:', error);
		}

	}
	
};
