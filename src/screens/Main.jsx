import React, { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, ImageBackground, StyleSheet, View } from 'react-native';
import backgroundImage from '../assets/images/home_bg.png';
import { Text } from 'react-native-gesture-handler';
import ButtonMain from '../components/ButtonMain';
import MainLogo from '../assets/images/MainLogo';
import IconMenuNoti from '../assets/images/IconMenuNoti';
import IconMenuChannels from '../assets/images/IconMenuChannels';
import IconMenuSetup from '../assets/images/IconMenuSetup';
import IconMenuAbout from '../assets/images/IconMenuAbout';
import IconPrivacy from '../assets/images/IconPrivacy';
import { checkProfileExists,getDBConnection } from '../services/Database';

const Main = (props) => 
{
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const verifyProfile = async () => {
			try {
			  console.log('[Main.jsx] verifyProfile started. Setting loading true.');
			  setIsLoading(true); // Spinner starts here.
		  
			  console.log('[Main.jsx] Attempting to get DB connection...');
			  const db = await getDBConnection();
			  console.log('[Main.jsx] DB connection obtained:', db ? 'OK' : 'Failed');
		  
			  if (!db) {
				  throw new Error("Failed to get database connection.");
			  }
		  
			  console.log('[Main.jsx] Attempting to call checkProfileExists...');
			  const profileExists = await checkProfileExists(db); // Await the result...
			  console.log('[Main.jsx] checkProfileExists returned:', profileExists);
		  
			  if (!profileExists) {
				console.log('[Main.jsx] Profile does NOT exist. Navigating to Setup...');
				// Navigation replaces this screen, so no need to set loading false here.
				props.navigation.replace('Setup', { isRegistering: true });
			  } else {
				console.log('[Main.jsx] Profile EXISTS. Setting loading false.');
				setIsLoading(false); // Spinner stops here if profile exists
			  }
			} catch (error) {
			  console.error("[Main.jsx] Error verifying profile:", error);
			  Alert.alert("Database Error", "Failed to check user profile.");
			  console.log('[Main.jsx] Error occurred. Setting loading false.');
			  setIsLoading(false); // Spinner stops here on error.
			}
		  };

		verifyProfile();
	}, [props.navigation]);


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

	// Show loading indicator while checking profile
	if (isLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D', justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" color="#03A9F4" />
			</SafeAreaView>
		);
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
