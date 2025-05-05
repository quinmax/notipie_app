import React, { useState, useEffect} from 'react';
import { getDBConnection, saveProfile, getProfile } from '../services/Database';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import TopNav from '../components/TopNav';
import ms from '../styles/MainStyles';
import LabeledInput from '../components/LabeledInput'; // Adjust path if needed
import Label from '../components/Label';
import ButtonMain from '../components/ButtonMain'; // Adjust path if needed
import IconSave	from '../assets/images/IconSave'; // Adjust path if needed

const Setup = (props) => 
{
	const isRegistering = props.route?.params?.isRegistering ?? false;
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	// TODO: Fetch the actual FCM token asynchronously, e.g., using Firebase Cloud Messaging library
	// For now, initializing as empty or a placeholder. The current initialization logic is likely incorrect.
	// const [fcmToken, setFcmToken] = useState(''); // Or fetch it in useEffect
	// const [btnName, setBtnName] = useState(isRegistering ? 'Register' : 'Save & Continue');
	const [fcmToken, setFcmToken] = useState('');
	const [btnName, setBtnName] = useState(isRegistering ? 'Register' : 'Save Changes');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const getFcmToken = async () => {
			// Replace this with your actual FCM token retrieval logic
			// import messaging from '@react-native-firebase/messaging';
			// const token = await messaging().getToken();
			const token = 'fetching...'; 
			setFcmToken(token);
			console.log('FCM Token:', token);
			// In a real app, you'd fetch the live token here:
			// try {
			//   const liveToken = await messaging().getToken();
			//   setFcmToken(liveToken);
			//   console.log('Live FCM Token:', liveToken);
			// } catch (error) {
			//   console.error("Failed to get FCM token", error);
			//   setFcmToken('error-fetching-token'); // Indicate error
			// }
		};
		
		const loadProfileData = async () => {
			if (!isRegistering) {
				try {
					const db = await getDBConnection();
					const profile = await getProfile(db);
					if (profile) {
						setUserName(profile.user_name || '');
						setEmail(profile.email_address || '');
						setFcmToken(profile.contact_token || ''); // Load token from DB if available
					} else {
						// If not registering but no profile found, maybe treat as registration?
						// Or show an error/alert. For now, just log.
						console.warn("Setup opened in edit mode, but no profile found in DB.");
						// Optionally fetch live FCM token if not found in DB
						getFcmToken();
					}
				} catch (error) {
					Alert.alert("Error", "Failed to load profile data.");
					console.error("Error loading profile data:", error);
					// Fetch live FCM token as a fallback
					getFcmToken();
				}
			} else {
				// If registering, always fetch the live FCM token
				getFcmToken();
			}
		};

		loadProfileData();
	}, [isRegistering]);

	const handleButtonPress = async () => {
		if (!email) {
			Alert.alert('Validation Error', 'Email address is required.');
			return;
		}
		if (!fcmToken) {
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
			const response = await fetch('http://192.168.1.28/notipie/api/register', {
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

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Setup" />
			<View style={ [ms.cardBlue, ms.mb5] } >
				<Text style={[ ms.fs20, ms.cw, ms.mb5 ]} >Profile Details</Text>
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
				<Text style={ [ms.cbase, ms.mt5 ]}>{fcmToken}</Text>
			</View>
			<View style={{ paddingStart: 20, paddingEnd: 20 }}>
				{/* <ButtonMain text={btnName} SvgIcon={IconSave} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4', justifyContent: 'center' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleButtonPress} /> */}
				<ButtonMain
					text={isSubmitting ? 'Registering...' : btnName}
					SvgIcon={IconSave}
					svgWidth={24} svgHeight={24}
					style={{ marginTop: 20, backgroundColor: '#03A9F4', justifyContent: 'center' }}
					textStyle={{ color: '#000', fontSize: 15 }}
					onPress={handleButtonPress}
					disabled={isSubmitting} // Disable button while submitting
				/>
			</View>

		</SafeAreaView>
  	)
}

export default Setup