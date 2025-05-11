import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const NotiViewModel = ({ visible, onClose, record, title, description, onConfirm }) => {
  return (
	<Modal
	  transparent={true}
	  animationType="fade"
	  visible={visible}
	  onRequestClose={onClose}
	>
	  <View style={styles.overlay}>
		<View style={styles.modalContainer}>
		  <Text style={styles.heading}>Title</Text>
		  <Text style={styles.description}>{record.title}</Text>
		  <Text style={styles.heading}>Message</Text>
		  <Text style={styles.description}>{record.message}</Text>
		  <Text style={styles.heading}>Sent</Text>
		  <Text style={styles.description}>{new Date(record.created * 1000).toLocaleString()}</Text>
		  <Text style={styles.heading}>Expires</Text>
		  <Text style={styles.description}>{new Date(record.expires * 1000).toLocaleString()}</Text>
		  <Text style={styles.heading}>Keep</Text>
		  <Text style={styles.description}>{record.keep == 0 ? 'No' : 'Yes'}</Text>
		  <View style={styles.buttonContainer}>
			<Pressable style={styles.button} onPress={onClose}>
			  <Text style={styles.buttonText}>Close</Text>
			</Pressable>
		  </View>
		</View>
	  </View>
	</Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
	flex: 1,
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	justifyContent: 'center',
	alignItems: 'center',
  },
  modalContainer: {
	width: '80%',
	backgroundColor: '#1E293B',
	borderRadius: 10,
	padding: 20,
	alignItems: 'flex-start',
	justifyContent: 'flex-start',
  },
  heading: {
	fontSize: 12,
	color: '#03A9F4',
	textTransform: 'uppercase',
  },
  title: {
	fontSize: 18,
	fontWeight: 'bold',
	color: '#FFFFFF',
	marginBottom: 10,
  },
  description: {
	fontSize: 14,
	color: '#D1D5DB',
	textAlign: 'center',
	marginBottom: 20,
  },
  buttonContainer: {
	flexDirection: 'row',
	justifyContent: 'space-between',
	width: '100%',
  },
  button: {
	flex: 1,
	marginHorizontal: 5,
	paddingVertical: 10,
	backgroundColor: '#03A9F4',
	borderRadius: 5,
	alignItems: 'center',
  },
  buttonText: {
	color: '#000',
	fontSize: 14,
	fontWeight: 'bold',
  },
});

export default NotiViewModel;