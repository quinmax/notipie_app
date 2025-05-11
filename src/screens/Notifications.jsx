import React, { useState, useEffect } from 'react';
import { getDBConnection, fetchActiveNotifications, setNotificationAsRead, getNotificationById } from '../services/Database';
import SoundQueueManager from '../services/SoundQueueManager';
import { SafeAreaView, FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import TopNav from '../components/TopNav';
import NotiCustomModel from '../components/NotiCustomModel';
import NotiRead from '../assets/images/NotiRead';
import NotiUnread from '../assets/images/NotiUnread';
import NotiKeep from '../assets/images/NotiKeep';
import NotiViewModel from '../components/NotiViewModal';

const Notifications = ({route}) => 
{
	// const { notificationId } = route.params;
	// console.log('[Notifications.jsx] Notification ID:', notificationId);

	const [notifications, setNotifications] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
  	const [modalConfig, setModalConfig] = useState({ title: '', description: '', onConfirm: () => {} });
	const [selectedNotification, setSelectedNotification] = useState(null);
	const [currentNotificationId, setCurrentNotificationId] = useState(route.params?.notificationId || null);
	const [modalViewVisible, setModalViewVisible] = useState(false);

	useEffect(() => 
	{
		const fetchNotifications = async () => {
			try {
				const db = await getDBConnection();
				const notifications = await fetchActiveNotifications(db);
				setNotifications(notifications);
				console.log('[Notifications.jsx] Active Notifications:', notifications);

				// If currentNotificationId is set, fetch its details and show the modal
				if (currentNotificationId) {
					console.log('[Notifications.jsx] Fetching notification by ID:', currentNotificationId);
					const notification = await getNotificationById(db, currentNotificationId);
					if (notification) {
						console.log('[Notifications.jsx] Fetched Notification:', notification);
						setSelectedNotification(notification);
						setModalViewVisible(true); // Show the modal with the notification details
					}
				}
			} catch (error) {
				console.error('[Notifications.jsx] Error fetching notifications:', error);
			}
		};

		fetchNotifications();
	}, [currentNotificationId]);

	const openModal = (title, description, onConfirm) => {
    setModalConfig({ title, description, onConfirm });
    setModalVisible(true);
  };

	const handleView = async (id) => 
	{
		try {
			const db = await getDBConnection();
			const notification = await getNotificationById(db, id); // Fetch notification details by ID
			if (notification) {
			setSelectedNotification(notification); // Set the selected notification
			setModalViewVisible(true); // Show the modal
			} else {
			console.error(`[Notifications.jsx] Notification with ID ${id} not found.`);
			}
		} catch (error) {
			console.error('[Notifications.jsx] Error fetching notification details:', error);
		}
	}

	const handlePlay = (notification) => {
		openModal(
		'Play Notification',
		`Do you want to play the sound for "${notification.title}"?`,
		() => {
			console.log('Playing notification:', notification);
			
			const msgSrc = notification.msg_src;
			const msgUrl = notification.msg_url;
			const soundFile = notification.soundfile;

			if (msgSrc === '0') {
				// Play internal sound
				try 
				{
					SoundQueueManager.addToQueue('0', '', soundFile);
				} 
				catch (error) 
				{
						console.error('Error playing internal sound:', error);
				}
			} else if (msgSrc !== '0' && msgUrl) 
				{
					// Play external sound
					try 
					{
						SoundQueueManager.addToQueue('1', msgUrl, '');
					} 
					catch (error) 
					{
						console.error('Error playing external sound:', error);
					}
				} else {
					console.log('Invalid msgSrc or msgUrl.');
				}

				setModalVisible(false);
			}
		);
	}

	const handleMarkAsRead = async (notification) => {
		openModal(
		'Mark as Read',
		`Do you want to mark "${notification.title}" as read?`,
		async () => {
			console.log('Marking as read:', notification);

			try {
				const db = await getDBConnection(); // Ensure the database connection is established
				const id = notification.id;

				// Update the notification in the database
				await setNotificationAsRead(db, id);

				console.log('Notification marked as read.');

				// Optionally, update the local state to reflect the change
				setNotifications((prevNotifications) =>
				prevNotifications.map((noti) =>
					noti.id === id ? { ...noti, active: 0 } : noti
				)
				);
			} catch (error) {
				console.error('Error marking notification as read:', error);
			}


			setModalVisible(false);
		}
		);
	}

	const handleKeep = async (notification) => {
		openModal(
		'Keep Notification',
		`Do you want to keep "${notification.title}"?`,
		async () => {
			console.log('Keeping notification:', notification);
			
			try {
				const db = await getDBConnection();
				const id = notification.id;

				// Update the `keep` column in the database
				await db.executeSql(
				`UPDATE NOTIFICATIONS SET active = 0, keep = 1 WHERE id = ?`,
				[id]
				);

				console.log('Notification kept.');

				// Optionally, update the local state to reflect the change
				setNotifications((prevNotifications) =>
				prevNotifications.map((noti) =>
					noti.id === id ? { ...noti, keep: 1 } : noti
				)
				);
			} catch (error) {
				console.error('Error keeping notification:', error);
			}
		
			setModalVisible(false);
		}
		);
	}
	
	const handelDelete = (notification) => {
	openModal(
		'Delete Notification',
		`Are you sure you want to delete "${notification.title}"?`,
		async () => {
		console.log('Deleting notification:', notification);

		try {
			const db = await getDBConnection(); // Ensure the database connection is established
			const id = notification.id;

			// Delete the notification from the database
			await db.executeSql(`DELETE FROM NOTIFICATIONS WHERE id = ?`, [id]);

			console.log('Notification deleted.');

			// Update the local state to remove the deleted notification
			setNotifications((prevNotifications) =>
			prevNotifications.filter((noti) => noti.id !== id)
			);
		} catch (error) {
			console.error('Error deleting notification:', error);
		}

		setModalVisible(false);
		}
	);
	};

	// Render each notification item
	const renderNotification = ({ item }) => {
		const createdDate = new Date(item.created * 1000).toLocaleString(); // Convert timestamp to readable date
		return (
			<View style={styles.notificationContainer} >
				<Pressable style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]} onPress={() => handleView(item.id)}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
						<Text style={styles.title}>{item.title}</Text>
						{item.keep === 1 ? <NotiKeep /> : item.active === 1 ? <NotiUnread /> : <NotiRead />}
						</View>
						<Text style={styles.message}>{item.message}</Text>
						<Text style={styles.date}>{createdDate}</Text>
				</Pressable>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }} >
					<Pressable style={styles.button} onPress={() => handlePlay(item)} >
						<Text style={styles.buttontext}>Play</Text>
					</Pressable>
					<Pressable style={styles.button}  onPress={() => handleMarkAsRead(item)} >
						<Text style={styles.buttontext}>Mark as Read</Text>
					</Pressable>
					<Pressable style={styles.button} onPress={() => handleKeep(item)} >
						<Text style={styles.buttontext}>Keep</Text>
					</Pressable>
					<Pressable style={styles.button} onPress={() => handelDelete(item)} >
						<Text style={styles.buttontext}>Delete</Text>	
					</Pressable>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#12191D' }}>
			<TopNav title="Notifications" />
			<FlatList
			data={notifications}
			keyExtractor={(item) => item.id.toString()} // Use a unique key for each item
			renderItem={renderNotification}
			contentContainerStyle={styles.listContainer}
		/>
		<NotiCustomModel
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
      	/>
		{selectedNotification && (
			<NotiViewModel
			visible={modalViewVisible}
			onClose={() => setModalViewVisible(false)}
			record={selectedNotification}
			title={selectedNotification.title}
			description={selectedNotification.message}
			onConfirm={() => setModalViewVisible(false)}
			/>
      	)}
		</SafeAreaView>
  	)
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  notificationContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  button: {
	borderWidth: 1,
	borderColor: '#9BA8B0',
	borderRadius: 5,
	paddingHorizontal: 10,
	paddingVertical: 5,
  },
  buttontext: {
	color: '#FFFFFF',
	fontSize: 12,
  }
});

export default Notifications;