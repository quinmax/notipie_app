import React, { useEffect, useState } from 'react'
import appStateManager from '../services/AppStateManager';
import { updateFCMAppState } from '../services/FCMService';
import { ActivityIndicator, SafeAreaView, ImageBackground, StyleSheet, Pressable, View, Alert } from 'react-native';
import backgroundImage from '../assets/images/home_bg.png';
import { Text } from 'react-native-gesture-handler';
import ButtonMain from '../components/ButtonMain';
import MainLogo from '../assets/images/MainLogo';
import IconMenuNoti from '../assets/images/IconMenuNoti';
import IconMenuChannels from '../assets/images/IconMenuChannels';
import IconMenuSetup from '../assets/images/IconMenuSetup';
import IconMenuAbout from '../assets/images/IconMenuAbout';
import IconPrivacy from '../assets/images/IconPrivacy';
import { getDBConnection, checkProfileExists, getProfile } from '../services/Database';

const Main = (props) => 
{
	const [isLoading, setIsLoading] = useState(true);
	const [muteMode, setMuteMode] = useState(appStateManager.get('muteMode'));

	useEffect(() => {
		const verifyProfile = async () => {
			try {
				console.log('[Main.jsx] verifyProfile started.');
				// setIsLoading(true); // isLoading is true by default on mount.
				// If this effect could re-run and isLoading might be false, uncommenting this is safer.

			  console.log('[Main.jsx] Attempting to get DB connection...');
			  const db = await getDBConnection();
			  console.log('[Main.jsx] DB connection obtained:', db ? 'OK' : 'Failed');
		  
			  if (!db) {
				console.error('[Main.jsx] DB connection is null or undefined. Throwing error.');
				  throw new Error("Failed to get database connection.");
			  }
		  
			  console.log('[Main.jsx] Attempting to call checkProfileExists...');
			  const profileExists = await checkProfileExists(db); // Await the result...
			  console.log('[Main.jsx] checkProfileExists completed. Profile exists:', profileExists);
		  
			  if (!profileExists) {
				console.log('[Main.jsx] Profile does NOT exist. Navigating to Setup...');
				// Navigation replaces this screen, so no need to set loading false here.
				// This component should unmount.
				props.navigation.replace('Setup', { isRegistering: true });
				// If execution somehow continues past replace() before unmount,
				// and the component isn't immediately unmounted, ensure loading is false.
				// However, this is usually not necessary with `replace`.
				// setIsLoading(false); zzz
			  } else {
				console.log('[Main.jsx] Profile EXISTS. Attempting to fetch profile data...');
				const profileData = await getProfile(db);
				console.log('[Main.jsx] getProfile completed. Profile data received:', profileData ? 'Data received' : 'No data');
				if (profileData && profileData.email_address) {
					console.log('[Main.jsx] Profile data is valid. Updating FCM AppState.');
					appStateManager.set('emailAddress', profileData.email_address);
					// updateFCMAppState('emailAddress', profileData.email_address);
					console.log('[Main.jsx] FCMService AppState updated with email address.');
					if (profileData.contact_id) {
						console.log('[Main.jsx] contact_id found. Updating FCM AppState.');
						// updateFCMAppState('contactId', profileData.contact_id);
						appStateManager.set('contactId', profileData.contact_id);
						console.log('[Main.jsx] FCMService AppState updated with contact_id.');
					}
				} else {
					console.warn('[Main.jsx] Profile exists but fetched data is incomplete (e.g., missing email). ProfileData:', profileData);
					// Optionally, you could navigate to Setup if profile data is incomplete
				}
				console.log('[Main.jsx] Profile exists branch finished. Setting loading to false.');
				setIsLoading(false); // Spinner stops here if profile exists
			  }/**/
			} catch (error) {
			  console.error("[Main.jsx] Error verifying profile:", error);
			  Alert.alert("Database Error", "Failed to check user profile.");
			  console.log('[Main.jsx] Error occurred in verifyProfile. Setting loading to false.');
			  setIsLoading(false); // Spinner stops here on error..
			}
		  };

		verifyProfile();
	}, [props.navigation]);

	useEffect(() => {
    const handleStateChange = ({ key, value }) => {
      if (key === 'muteMode') {
        setMuteMode(value); // Update local state when muteMode changes
      }
    };

    appStateManager.on('stateChange', handleStateChange);

    return () => {
      appStateManager.off('stateChange', handleStateChange); // Cleanup listener
    };
  }, []);

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
				<Pressable onPress={() => props.navigation.navigate('Channels')} style={{ marginTop: 5 }}>
					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 45 }}>
						<Text style={{ color: '#fff' }}>Meeting Mode:</Text>
						<Text style={{ color: muteMode ? '#03A9F4' : '#03A9F4' }}>{muteMode ? 'ON' : 'OFF'}</Text>
					</View>
				</Pressable>
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
