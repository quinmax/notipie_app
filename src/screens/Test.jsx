import React, { useState } from 'react';
import base64 from 'base-64';
import RNFS from 'react-native-fs';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Sound from 'react-native-sound';

const Test = () => 
{
	const [textToSpeak, setTextToSpeak] = useState('Hello world');
  	const [soundObject, setSoundObject] = useState(null);

	  const handleSpeak = async () => {
		console.log('Text to speak:', textToSpeak); // Debugging line
    if (!textToSpeak.trim()) {
      Alert.alert('Error', 'Please enter text to speak.');
      return;
    }

	try {
      const response = await fetch('http://192.168.1.28:3001/synthesize', { // Replace with your server's URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSpeak }),
      });
	console.log('Response:', response); // Debugging line

	if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch audio.');
      }

	} catch (error) {
		console.error('Error fetching or playing audio:', error);
      Alert.alert('Error', error.message);
	  console.log('Error:', error.message); // Debugging line
	}
  };

	const handleStop = () => {
	if (soundObject) {
		soundObject.stop(() => {
		soundObject.release();
		setSoundObject(null);
		});
	}
	};

	return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter text to speak"
        value={textToSpeak}
        onChangeText={setTextToSpeak}
      />
      <Button title="Speak" onPress={handleSpeak} />
      {soundObject && <Button title="Stop" onPress={handleStop} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default Test;

