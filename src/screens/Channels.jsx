import React, { useState, useEffect } from 'react';
import appStateManager from '../services/AppStateManager';
import { getDBConnection, getAllChannels } from '../services/Database';
import { SafeAreaView, FlatList, StyleSheet, View, Text, Switch } from 'react-native';
import TopNav from '../components/TopNav';
import ButtonMain from '../components/ButtonMain';
import MeetingModeOn from '../assets/images/MeetingModeOn';
import MeetingModeOff from '../assets/images/MeetingModeOff';

const Channels = () => 
{
	const [muteMode, setMuteMode] = useState(appStateManager.get('muteMode'));
	const [channels, setChannels] = useState([]);

	useEffect(() => 
	{
		const handleStateChange = ({ key, value }) => 
		{
			if (key === 'muteMode') {
				setMuteMode(value); // Update local state when muteMode changes
			}
		};

    	appStateManager.on('stateChange', handleStateChange);

		return () => {
		appStateManager.off('stateChange', handleStateChange); // Cleanup listener
		};
  	}, []);

	useEffect(() => 
	{
		const fetchChannels = async () => 
		{
			try {
				const db = await getDBConnection();
				const fetchedChannels = await getAllChannels(db);
				setChannels(fetchedChannels);
				console.log('[Channels.jsx] Fetched Channels:', fetchedChannels);
			} catch (error) {
				console.error('[Channels.jsx] Error fetching channels:', error);
			}
		};

		fetchChannels();
	}, []);

	const handleMeetingModeOn = () =>	
	{
		appStateManager.set('muteMode', true);
		setMuteMode(true);
	}

	const handleMeetingModeOff = () =>	
	{
		appStateManager.set('muteMode', false);
		setMuteMode(false);
	}

	const handleToggleChannel = async (channelId, isEnabled) => 
	{
		try {
			console.log(`Toggling channel ${channelId} to ${isEnabled ? 'enabled' : 'disabled'}`);

			// Update the database
			const db = await getDBConnection();
			await db.executeSql(`UPDATE CHANNELS SET channel_status = ? WHERE id = ?`, [isEnabled ? 1 : 0, channelId]);

			// Update the local state
			setChannels((prevChannels) =>
			prevChannels.map((channel) =>
				channel.id === channelId ? { ...channel, channel_status: isEnabled } : channel
			)
			);
		} catch (error) {
			console.error('[Channels.jsx] Error toggling channel:', error);
		}
	};

	const renderChannel = ({ item }) => 
	(
		<View style={[styles.channelContainer, { opacity: item.channel_status == 0 ? 0.3 : 1 }]}>
			<Text style={styles.channelName}>{item.channel_name}</Text>
			<Text style={styles.channelDescription}>{item.channel_desc}</Text>
			<View style={[ styles.button, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }]} >
				<Text style={{ fontSize: 14, color: '#fff' }}>Allow messags from this channel</Text>
				<Switch
					value={item.channel_status == 0 ? false : true} // Assuming `enabled` is a boolean field in your channel data
					onValueChange={(newValue) => handleToggleChannel(item.id, newValue)} // Handle toggle
					thumbColor={item.channel_status == 1 ? '#03A9F4' : '#9BA8B0'}
					trackColor={{ true: '#767577', false: '#81b0ff' }}
				/>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Channels" />
			<View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
			{muteMode ? (
				<Text style={{ fontSize: 14, color: '#fff', marginTop: 10, textAlign: 'center' }}>Meeting Mode is ON. No voicedrops will be played. Channel on and off settings will not be effected.</Text>
			) : (
				<Text style={{ fontSize: 14, color: '#fff', marginTop: 10, textAlign: 'center' }}>Meeting Mode is OFF. All voicedrops will play for enabled channels.</Text>
			)}
			{muteMode ? (
				<View style={{ paddingStart: 10, paddingEnd: 10}}>
					<ButtonMain text="Meeting Mode: ON" SvgIcon={MeetingModeOn} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleMeetingModeOff} />
				</View>
				) : (
				<ButtonMain text="Meeting Mode: OFF" SvgIcon={MeetingModeOff} svgWidth={24} svgHeight={24} style={{ marginTop: 20, backgroundColor: '#03A9F4' }} textStyle={{ color: '#000', fontSize: 15 }} onPress={handleMeetingModeOn} />
				)}
			</View>
			<View style={{ width: '100%', height: 1, backgroundColor: '#9BA8B0', marginTop: 15 }} />
			<FlatList
			data={channels}
			keyExtractor={(item) => item.id.toString()} // Ensure each item has a unique keyc
			renderItem={renderChannel}
			contentContainerStyle={styles.listContainer}
			/>
			
		</SafeAreaView>
  	)
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  channelContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  channelDescription: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  button: {
	borderWidth: 1,
	borderColor: '#9BA8B0',
	borderRadius: 5,
	paddingHorizontal: 10,
	paddingVertical: 5,
  },
});

export default Channels;