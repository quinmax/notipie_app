import { getMessaging, onMessage, onBackgroundMessage, getToken } from '@react-native-firebase/messaging';
import appStateManager from './AppStateManager';
import { getDBConnection, checkChannelExists, getChannel, addChannel } from './Database';
import eventEmitter from './EventEmitter';

export const initializeFCM = async () => {
  console.log('[FCMService] Initializing FCM...');

  const messaging = getMessaging();

  // Request permissions for iOS
  if (Platform.OS === 'ios') {
    const authStatus = await messaging.requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) console.log('[FCMService] iOS Authorization status:', authStatus);
  }

  // Handle foreground messages
  onMessage(messaging, async (remoteMessage) => {
    console.log('[FCMService] Foreground Message Received:', remoteMessage);
    await processReceivedMessage(remoteMessage);
  });

  // Handle background messages
  onBackgroundMessage(messaging, async (remoteMessage) => {
    console.log('[FCMService] Background Message Received:', remoteMessage);
    await processReceivedMessage(remoteMessage);
  });

  // Get the FCM token
  const token = await getToken(messaging);
  console.log('[FCMService] FCM Token:', token);
};

const processReceivedMessage = async (remoteMessage) => {
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
	const msSrc = remoteMessage.data.ms_src || '0';
	const msgUrl = remoteMessage.data.msg_url || '';
	const title = remoteMessage.data.title || 'No title';
	const type = remoteMessage.data.type || '0';

	// Add logid to datapool
	appStateManager.set('rptLogId', channelId);

	// Check what internal sound file to use and assign to {soundfile}
	let soundFile = require('../assets/sounds/sf1.mp3');
	if (type === '2') {
	  soundFile = require('../assets/sounds/sf2.mp3');
	} else if (type === '3') {
	  soundFile = require('../assets/sounds/sf3.mp3');
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
			console.log(`[FCMService] Channel "${channelId}" does not exist. Adding to database.`);
			await addChannel(db, channelId, channelName, channelDesc, 0);
			console.log(`[FCMService] Channel "${channelId}" added successfully.`);
		}
	} 
	catch (error) 
	{
		console.error('[FCMService] Error processing received message:', error);
	}


	console.log('Data:', channelDesc, channelId, channelName, created, expires, logId, message, msSrc, msgUrl, title, type);
  } 
  else 
  {
	console.log('[FCMService] No data in message');
	return;
  }


};