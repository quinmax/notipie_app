import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import Main from '../screens/Main';
import Notifications from '../screens/Notifications';
import Channels from '../screens/Channels';
import Setup from '../screens/Setup';
import About from '../screens/About';
import Sqldemo from '../screens/Sqldemo'; // Assuming this is the correct path for your Sqldemo component
import Test from '../screens/Test';

const Stack = createStackNavigator();

function AppNavigator() 
{
	return (
		<Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false, animationEnabled: false }}>
			<Stack.Screen name="Notifications" component={Notifications} />
			<Stack.Screen name="Main" component={Main} />
			<Stack.Screen name="Channels" component={Channels} />
			<Stack.Screen name="Setup" component={Setup} />
			<Stack.Screen name="About" component={About} />
			<Stack.Screen name="Sqldemo" component={Sqldemo} />
			<Stack.Screen name="Test" component={Test} />
		</Stack.Navigator>
	);
}

export default AppNavigator;