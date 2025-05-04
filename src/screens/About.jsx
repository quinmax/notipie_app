import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import TopNav from '../components/TopNav';

const About = () => 
{
	return (
	<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
	<TopNav title="About" />

	</SafeAreaView>
	)
}

export default About;
