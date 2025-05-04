import React, { useState, useEffect} from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import TopNav from '../components/TopNav';
import ms from '../styles/MainStyles';
import LabeledInput from '../components/LabeledInput'; // Adjust path if needed
import Label from '../components/Label';
import ButtonMain from '../components/ButtonMain'; // Adjust path if needed
import IconSave	from '../assets/images/IconSave'; // Adjust path if needed

const Setup = () => 
{
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [fcmToken, setFcmToken] = useState('');
	const [btnName, setBtnName] = useState('Save & Continue');

	const handleButtonPress = () => {
		// Handle button press logic here
		console.log('Button pressed!');
	};


	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Setup" />
			<View style={ [ms.cardBlue, ms.mb5] } >
				<Text style={[ ms.fs20, ms.cw, ms.mb5 ]} >Profile Details</Text>
				<LabeledInput
					description="Username (Optional)"
					value={name}
					onChangeText={setName} // Pass the state setter function
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
				<Text style={ [ms.cbase, ms.mt5 ]} >1-uA7hRg</Text>
			</View>
			<View style={{ paddingStart: 20, paddingEnd: 20 }}>
				<ButtonMain text={btnName} SvgIcon={IconSave} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4', justifyContent: 'center' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleButtonPress} />
			</View>

		</SafeAreaView>
  	)
}

export default Setup