/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { getMessaging } from '@react-native-firebase/messaging';
import { processReceivedMessage } from './src/services/FCMService';

// Get the messaging instance using the modular API
getMessaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[index.js] Message handled in the background by setBackgroundMessageHandler:', remoteMessage);
  await processReceivedMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
