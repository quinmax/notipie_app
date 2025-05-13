import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import TopNav from '../components/TopNav';

const About = () => 
{

	return (
	<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
	<ScrollView style={{ flex: 1, backgroundColor: '#12191D' }} contentContainerStyle={{ flexGrow: 1 }}>
	<TopNav title="About" />
		<View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', padding: 20 }}>
			<Text style={{ color: '#fff', fontSize: 28, marginTop: 0 }}>How it works</Text>
			<Text style={{ color: '#fff', fontSize: 15, lineHeight: 24, marginTop: 20 }}>{'\u2022'} Your profile is linked to your email address.</Text>
			<Text style={{ color: '#fff', fontSize: 15, lineHeight: 24, marginTop: 10 }}>{'\u2022'} The first time you receive a notification from a channel, you'll be prompted to either <Text style={{ color: '#03A9F4' }} >ACCEPT</Text> or <Text style={{ color: '#03A9F4' }} >DENY</Text> it. If you tap <Text style={{ color: '#03A9F4' }} >ACCEPT</Text>, the current and future notifications from that channel will play. If you tap <Text style={{ color: '#03A9F4' }} >DENY</Text>, the current notification and all future notifications from that channel will be blocked.\n\nIf you change your mind, you can update your preferences anytime on the <Text style={{ color: '#03A9F4' }} >CHANNELS</Text> page.</Text>
			<Text style={{ color: '#fff', fontSize: 28, marginTop: 24 }}>Your Privacy</Text>
			<Text style={{ color: '#fff', fontSize: 15, lineHeight: 24, marginTop: 20 }}>{'\u2022'} Your email address is used exclusively for authentication and will never be shared or required for any other purpose.</Text>
			<Text style={{ color: '#fff', fontSize: 28, marginTop: 24 }}>Tips</Text>
			<Text style={{ color: '#fff', fontSize: 15, lineHeight: 24, marginTop: 20 }}>{'\u2022'} If you're entering a meeting or an event requiring "radio silence", activate <Text style={{ color: '#03A9F4' }} >MEETING MODE</Text> on the <Text style={{ color: '#03A9F4' }} >CHANNELS</Text> page to mute all channels. When you're ready to receive notifications again, simply tap the button to <Text style={{ color: '#03A9F4' }} >UNMUTE</Text> all your accepted channels.</Text>
		</View>
		</ScrollView>
	</SafeAreaView>
	)
}

export default About;
