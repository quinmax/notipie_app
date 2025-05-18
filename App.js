import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { initializeFCM } from './src/services/FCMService'; // Import FCM initializer
import eventEmitter from './src/services/EventEmitter';
import { PermissionsAndroid, Platform } from 'react-native';

async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'This app needs notification permission to send you alerts.',
        buttonPositive: 'OK',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  }
}

const App = () => 
{
	const navigationRef = useRef();
	const isFCMInitialized = useRef(false);

	useEffect(() => {
  if (!isFCMInitialized.current) {
    const appInitialization = async () => {
      await requestNotificationPermission(); // Request permission first
      await initializeFCM();                // Then initialize FCM
      console.log('[App.js] FCM Service Initialized.');
    };

    appInitialization();
    isFCMInitialized.current = true; // Mark FCM as initialized
  }
}, []);

  useEffect(() => {
	const handleNavigateToNotifications = (data) => {
		navigationRef.current?.navigate('Notifications', { 
		notificationId: data.notificationId, 
		isPopup: data.isPopup // Pass isPopup to Notifications screen
		});
	};

	eventEmitter.on('navigateToNotifications', handleNavigateToNotifications);

	return () => {
		eventEmitter.off('navigateToNotifications', handleNavigateToNotifications);
	};
	}, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;