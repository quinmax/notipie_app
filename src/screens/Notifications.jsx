import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import TopNav from '../components/TopNav';

const Notifications = () => 
{

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Notifications" />

		</SafeAreaView>
  	)
}

export default Notifications;