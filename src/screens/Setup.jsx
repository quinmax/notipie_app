import React, { useState, useEffect} from 'react';
import { API_BASE_URL } from '../config';
import appStateManager from '../services/AppStateManager';
import { getDBConnection, saveProfile, getProfile, updateProfile } from '../services/Database';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import TopNav from '../components/TopNav';
import ms from '../styles/MainStyles';
import LabeledInput from '../components/LabeledInput';
import Label from '../components/Label';
import ButtonMain from '../components/ButtonMain';
import ButtonOutline from '../components/ButtonOutline';
import IconSave	from '../assets/images/IconSave';

const Setup = (props) => 
{
	const isRegistering = props.route?.params?.isRegistering ?? false;
	const[profileId, setProfileId] = useState(null);
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	// TODO: Fetch the actual FCM token asynchronously, e.g., using Firebase Cloud Messaging library
	const [fcmToken, setFcmToken] = useState('');
	const [btnName, setBtnName] = useState(isRegistering ? 'Register' : 'Update');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const retrieveFcmToken = () => {
			const tokenFromManager = appStateManager.get('fcmToken');
			setFcmToken(tokenFromManager || 'fetching...');
			console.log('[Setup.jsx] FCM Token from AppStateManager:', tokenFromManager);
			return tokenFromManager;
		};

		const loadProfileData = async () => {
			let token;
			if (!isRegistering) {
			try {
				const db = await getDBConnection();
				const profile = await getProfile(db);
				if (profile) {
				setProfileId(profile.id);
				setUserName(profile.user_name || '');
				setEmail(profile.email_address || '');
				token = appStateManager.get('fcmToken') || profile.contact_token || 'fetching...';
				setFcmToken(token);
				} else {
				console.warn("Setup opened in edit mode, but no profile found in DB.");
				token = retrieveFcmToken();
				}
			} catch (error) {
				Alert.alert("Error", "Failed to load profile data.");
				console.error("Error loading profile data:", error);
				token = retrieveFcmToken();
			}
			} else {
			token = retrieveFcmToken();
			}
			setLoading(false); // Only set loading to false after token/profile is ready
		};

		loadProfileData();
	}, [isRegistering]);

	const handleButtonPress = async () => {
		if (!email) {
			Alert.alert('Validation Error', 'Email address is required.');
			return;
		}
		if (!fcmToken || fcmToken === 'fetching...') {
 			Alert.alert('Error', 'FCM Token is not available yet. Please wait or restart the app.');
 			return;
 		}

		setIsSubmitting(true);
		const formData = new FormData();
		formData.append('email_address', email);
		formData.append('fcm_token', fcmToken);
		formData.append('user_name', userName); // Send empty string if not provided
		formData.append('device_os', 0); // Default value

		try {
			const response = await fetch(`${API_BASE_URL}/register`, {
				method: 'POST',
				body: formData,
				// Headers might not be strictly necessary for FormData with fetch,
				// but uncomment if your server requires it.
				headers: {
				  'Content-Type': 'multipart/form-data',
				},
			});

			const result = await response.json(); // Assuming the server responds with JSON
			// const responseText = await response.text();
			console.log('Raw API Response:', result);

			if (result.status == "success") {
				Alert.alert('Success', result.message || 'Registration successful!');
				// Optionally navigate away or update UI state
				// e.g., props.navigation.navigate('Main');
				try {
					const db = await getDBConnection();
					if (!db) {
						throw new Error("Failed to get database connection for saving profile.");
					}
					const profileData = {
						contact_id: result.user_id, // Assuming API returns user_id as contact_id
						user_name: userName,
						email_address: email,
						fcm_token: fcmToken // As sent to the API
					};
					await saveProfile(db, profileData);
					console.log('Profile saved successfully to SQLite.');
					Alert.alert('Success', result.message || 'Registration successful!');
					props.navigation.replace('Main'); // Navigate to Main screen after successful registration & save
				} catch (dbError) {
					console.error('SQLite saving error:', dbError);
					Alert.alert('Database Error', 'Failed to save profile locally. Please try again.');
				}

			} else {
				Alert.alert('Registration Failed', result.message || 'An error occurred on the server.');
			}
		} catch (error) {
			console.error('Registration API error:', error);
			Alert.alert('Network Error', 'Failed to connect to the server. Please check your connection and the IP address.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => 
	{
		if (!email) {
			Alert.alert('Validation Error', 'Email address is required.');
			return;
		}
		if (!fcmToken || fcmToken === 'fetching...') {
 			Alert.alert('Error', 'FCM Token is not available yet. Please wait or restart the app.');
 			return;
 		}

		setIsSubmitting(true);
		const formData = new FormData();
		formData.append('email_address', email);
		formData.append('fcm_token', fcmToken);
		formData.append('user_name', userName); // Send empty string if not provided
		formData.append('device_os', 0); // Default value

		try {
			console.log("Reg API: ", `${API_BASE_URL}/register`);
			const response = await fetch(`${API_BASE_URL}/register`, {
				method: 'POST',
				body: formData,
				// Headers might not be strictly necessary for FormData with fetch,
				// but uncomment if your server requires it.
				headers: {
				  'Content-Type': 'multipart/form-data',
				},
			});

			const result = await response.json(); // Assuming the server responds with JSON
			// const responseText = await response.text();
			console.log('Raw API Response:', result);

			if (result.status == "success") {
				Alert.alert('Success', 'Update successful!');
				// Optionally navigate away or update UI state
				// e.g., props.navigation.navigate('Main');
				try {
					const db = await getDBConnection();
					if (!db) {
						throw new Error("Failed to get database connection for saving profile.");
					}
					const profileData = {
						profile_id: profileId, // Assuming API returns user_id as contact_id
						user_name: userName,
						email_address: email,
						fcm_token: fcmToken // As sent to the API
					};
					await updateProfile(db, profileData);
					console.log('Profile saved updated to SQLite.');
					// Alert.alert('Success', result.message || 'Update successful!');
				} catch (dbError) {
					console.error('SQLite saving error:', dbError);
					Alert.alert('Database Error', 'Failed to save profile locally. Please try again.');
				}

			} else {
				Alert.alert('Registration Failed', result.message || 'An error occurred on the server.');
			}
		} catch (error) {
			console.error('Registration API error:', error);
			Alert.alert('Network Error', 'Failed to connect to the server. Please check your connection and the IP address.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		props.navigation.goBack();
	}

	if (loading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D', justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ color: '#FFF' }}>Loading...</Text>
			</SafeAreaView>
		);
		}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Setup" />
			<View style={ [ms.cardBlue, ms.mb5] } >
				<Text style={[ ms.fs20, ms.cw, ms.mb5 ]} >Profile Details aaa</Text>
				<LabeledInput
					description="Username (Optional)"
					value={userName}
					onChangeText={setUserName} // Pass the state setter function
					placeholder="Enter your name"
					keyboardType="default"
					secureTextEntry={false}
				/>
				<LabeledInput
					description="Email Address (Required)"
					value={email}
					onChangeText={setEmail} // Pass the state setter function
					placeholder="Enter your email address"
					keyboardType="default"
					secureTextEntry={false}
				/>
				<Label description='Support Reference' />
				<Text style={ [ms.cbase, ms.mt5 ]}>{fcmToken ? '...' + fcmToken.slice(-20) : ''}</Text>
			</View>
			<View style={{ paddingStart: 20, paddingEnd: 20 }}>
			{isRegistering ? (
				<ButtonMain
					text={isSubmitting ? 'Registering...' : btnName}
					SvgIcon={IconSave}
					svgWidth={24} svgHeight={24}
					style={{ marginTop: 20, backgroundColor: '#03A9F4', justifyContent: 'center' }}
					textStyle={{ color: '#000', fontSize: 15 }}
					onPress={handleButtonPress}
					disabled={isSubmitting} // Disable button while submitting
				/>
			) : (
				<ButtonMain
					text={isSubmitting ? 'Registering...' : btnName}
					SvgIcon={IconSave}
					svgWidth={24} svgHeight={24}
					style={{ marginTop: 20, backgroundColor: '#03A9F4', justifyContent: 'center' }}
					textStyle={{ color: '#000', fontSize: 15 }}
					onPress={handleUpdate}
					disabled={isSubmitting} // Disable button while submitting
				/>
			)}
			<ButtonOutline
				text="Close"
				svgWidth={24} svgHeight={24}
				style={{ marginTop: 20, backgroundColor: '#12191D', justifyContent: 'center' }}
				textStyle={{ color: '#FFF', fontSize: 15 }}
				onPress={handleClose}
				/>
			</View>
			
		</SafeAreaView>
  	)
}

export default Setup