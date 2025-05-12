import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const NotiPopupModal = ({ visible, onClose, channelName, onAccept, onDecline }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Channel Notification</Text>
          <Text style={styles.message}>{channelName}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.declineButton]} onPress={onDecline}>
              <Text style={styles.buttonText}>Decline</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  message: {
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
    borderRadius: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#03A9F4',
  },
  declineButton: {
	borderWidth: 1,
    borderColor: '#03A9F4',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotiPopupModal;