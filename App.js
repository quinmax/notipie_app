import React, { useState, useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';

const App = () => 
{
	const navigationRef = useRef();
	
	return (
		<NavigationContainer ref={navigationRef}>
			<AppNavigator />
		</NavigationContainer>
	);
};

export default App;