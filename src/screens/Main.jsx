import React from 'react'
import { SafeAreaView, ImageBackground, StyleSheet, View } from 'react-native';
import backgroundImage from '../assets/images/home_bg.png';
import { Text } from 'react-native-gesture-handler';
import ButtonMain from '../components/ButtonMain';
import MainLogo from '../assets/images/MainLogo';
import IconMenuNoti from '../assets/images/IconMenuNoti';
import IconMenuChannels from '../assets/images/IconMenuChannels';
import IconMenuSetup from '../assets/images/IconMenuSetup';
import IconMenuAbout from '../assets/images/IconMenuAbout';
import IconPrivacy from '../assets/images/IconPrivacy';

const Main = (props) => 
{
	const handleGotoNotifications = () => {
		props.navigation.navigate('Notifications')
	}

	const handleGotoChannels = () => {
		props.navigation.navigate('Channels')
	}

	const handleGotoSetup = () => {
		props.navigation.navigate('Setup')
	}

	const handleGotoAbout = () => {
		props.navigation.navigate('About')
	}


	return (
	<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
		<ImageBackground source={backgroundImage} style={MainStyles.imageBackground}>
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
				<MainLogo />
				<Text style={{ fontSize: 12, color: '#fff', marginTop: 10 }}>v 1.0.0</Text>
				<ButtonMain text="Notifications" SvgIcon={IconMenuNoti} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleGotoNotifications} />
				<ButtonMain text="Channels" SvgIcon={IconMenuChannels} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleGotoChannels} />
				<ButtonMain text="Setup" SvgIcon={IconMenuSetup} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleGotoSetup} />
				<ButtonMain text="About" SvgIcon={IconMenuAbout} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleGotoAbout} />
				<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
					<IconPrivacy />
					<Text style={{ fontSize: 12, color: '#fff', marginLeft: 5 }}>Privacy Policy</Text>
				</View>
			</View>
		</ImageBackground>
	</SafeAreaView>
  	)
}

const MainStyles = StyleSheet.create({
	imageBackground: {
		flex: 1,
		resizeMode: 'cover',
		justifyContent: 'center',
	},
});

export default Main;
