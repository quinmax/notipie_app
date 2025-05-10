import React, { useEffect } from 'react';
import { SafeAreaView, Text, View, Button } from 'react-native';
import TopNav from '../components/TopNav';
import SystemSetting from 'react-native-system-setting';
import SoundQueueManager from '../services/SoundQueueManager';
import SoundPlayer from 'react-native-sound-player';

const About = () => 
{
	useEffect(() => {
		// Set the volume to maximum when the component mounts
		setMaxVolume();
	}, []);

	const setMaxVolume = async () => {
		try {
			const maxVolume = await SystemSetting.getVolume('music');
			SystemSetting.setVolume(1.0, { type: 'music', showUI: true }); // Set volume to 100% and show UI
			console.log('Volume set to maximum.');
		} catch (error) {
			console.error('Error setting volume:', error);
		}
	};

	const playInternalSound = () => {
	SoundQueueManager.addToQueue('0', '', 'sf1.mp3'); // Internal sound
	};

	const playExternalSound = () => {
	SoundQueueManager.addToQueue('1', 'http://192.168.1.28/notipie_servers/public/audio/fb4f2fa0a494496072f6e4d8aace0e6b.mp3', ''); // External sound
	};


//   const playInternalSound = () => {
//   try {
//     SoundPlayer.playSoundFile('sf1', 'mp3'); // 'sf1' is the file name without extension
//     console.log('Playing internal sound.');
//   } catch (error) {
//     console.error('Error playing internal sound:', error);
//   }
// };

//   const playExternalSound = () => {
//   try {
//     SoundPlayer.playUrl("http://192.168.1.28/notipie_servers/public/audio/1468cf985cdd1290db3bc621aec517f9.mp3"); // 'sf1' is the file name without extension
//     console.log('Playing internal sound.');
//   } catch (error) {
//     console.error('Error playing internal sound:', error);
//   }
// };

	return (
	<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
	<TopNav title="About" />
		<View>
		<Button title="Play Internal Sound" onPress={playInternalSound} />
		<Button title="Play External Sound" onPress={playExternalSound} />
		</View>
	</SafeAreaView>
	)
}

export default About;
