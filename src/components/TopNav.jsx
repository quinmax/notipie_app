import React from 'react';
import appStateManager from '../services/AppStateManager';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import hook
import PageIconNoti from '../assets/images/PageIconNoti';
import PageIconChannels from '../assets/images/PageIconChannels';
import PageIconSetup from '../assets/images/PageIconSetup';
import PageIconAbout from '../assets/images/PageIconAbout';
import IconBack from '../assets/images/IconBack';
import Mutemode from '../assets/images/MuteMode';

const TopNav = ({ title }) => 
{
	const navigation = useNavigation();

	const muteMode = appStateManager.get('muteMode') || false;
	// const [muteMode, setMuteMode] = React.useState(appStateManager.get('muteMode'));
	console.log('[TopNav.jsx] muteMode:', muteMode);

	const renderLeftIcon = () => {
		switch (title) {
			case 'Notifications':
				return <PageIconNoti />;
			case 'Channels':
				return <PageIconChannels />;
			case 'Setup': // Example: Add another case for a different title
				return <PageIconSetup />;
			case 'About':
				return <PageIconAbout />;
			// Add more cases as needed for other titles and icons
			default:
				return null; // Or return a default icon, or <View style={styles.placeholder} />
		}
	};

	const handleBackPress = () => 
	{
    	navigation.navigate('Main');
	};

  	return (
		<View>
			<View style={[styles.container]}>

				{/* Left Image */}
				{renderLeftIcon()}

				{/* Center Title */}
				<Text style={[styles.title]} numberOfLines={1} ellipsizeMode="tail">
					{title}
				</Text>

				<View style={{ marginEnd: 10 }} > 
				{muteMode && <Mutemode/>}
				</View>

				{/* Right Image (Button) */}
				<TouchableOpacity onPress={handleBackPress} activeOpacity={0.7}>
					<IconBack />
				</TouchableOpacity>

			</View>

			<View style={{ width: '100%', height: 1, backgroundColor: '#9BA8B0' }} />

		</View>
  	);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 10, // Adjust padding for Android status bar
    paddingBottom: 10,
    height: 55 + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0), // Adjust height based on platform
  },
  image: { width: 30, height: 30 }, // Default image size
  leftImage: { marginRight: 10 }, // Add some space if needed
  rightImage: { marginLeft: 10 }, // Add some space if needed
  title: { flex: 1, textAlign: 'left', fontSize: 30, color: '#fff', marginLeft: 10 },
  placeholder: { width: 30, height: 30 }, // Same size as default image for balance
});

export default TopNav;