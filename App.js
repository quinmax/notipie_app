import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { initializeFCM } from './src/services/FCMService'; // Import FCM initializer
import eventEmitter from './src/services/EventEmitter';

const App = () => 
{
	const navigationRef = useRef();
	const isFCMInitialized = useRef(false);

	useEffect(() => {
    if (!isFCMInitialized.current) {
      const appInitialization = async () => {
        await initializeFCM();
        console.log('[App.js] FCM Service Initialized.');
      };

      appInitialization();
      isFCMInitialized.current = true; // Mark FCM as initialized
    }

    // Listen for notificationsUpdated event
    const handleNotificationUpdate = (data) => {
      console.log('[App.js] Event: notificationsUpdated - Data:', data);
      // Handle the notification data (e.g., update state, show UI, etc.)
    };

    eventEmitter.on('notificationsUpdated', handleNotificationUpdate);

    // Cleanup the listener when the component unmounts
    return () => {
      eventEmitter.off('notificationsUpdated', handleNotificationUpdate);
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