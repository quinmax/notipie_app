import React, { useState, useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { initializeFCM } from './src/services/FCMService'; // Import FCM initializer
import { DeviceEventEmitter } from 'react-native'; // To listen for events

const App = () => 
{
	const navigationRef = useRef();

	useEffect(() => {
		const appInitialization = async () => {
		  // Initialize FCM service
		  // This will set up listeners and get the initial token.
		  // The token will be sent to your server and stored locally
		  // by FCMService if contactId is already available in its AppState.
		  // If contactId is not yet available (e.g., new user or profile not loaded),
		  // FCMService.storeTokenInProfile will wait.
		  // Main.jsx will later load the profile and update FCMService.AppState.
		  // Setup.jsx will use FCMService.getCurrentFcmToken() when creating a new profile.
		  await initializeFCM();
		  console.log('[App.js] FCM Service Initialized.');
		};
	
		appInitialization();
	
		// Listen for UI updates from FCMService (e.g., new notification stored)
		const notificationSubscription = DeviceEventEmitter.addListener('notificationsUpdated', (data) => {
		  console.log('[App.js] Event: notificationsUpdated - Data:', data);
		  // Here you could, for example, trigger a global state update for a badge count
		  // or navigate if a specific notification type requires immediate action.
		});
	
		// Cleanup subscription on component unmount
		return () => {
		  notificationSubscription.remove();
		  console.log('[App.js] Removed notificationsUpdated listener.');
		};
	  }, []);
	
	return (
		<NavigationContainer ref={navigationRef}>
			<AppNavigator />
		</NavigationContainer>
	);
};

export default App;