import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { getDBConnection, addChannel } from '../services/Database'; // Adjust path if needed

const Sqldemo = () => {
  const [db, setDb] = useState(null);

  // Initialize DB connection on component mount
  useEffect(() => {
    let isMounted = true;
    const initializeDb = async () => {
      try {
        const dbInstance = await getDBConnection();
        if (isMounted) {
          setDb(dbInstance);
          console.log('Database connection established in component.');
        }
      } catch (error) {
        console.error("Component failed to get DB connection:", error);
        Alert.alert("Error", "Could not initialize database.");
      }
    };

    initializeDb();

    // Cleanup function
    return () => {
      isMounted = false;
      // Optionally close the DB connection when the app closes,
      // though react-native-sqlite-storage often handles this.
      // db?.close().catch(err => console.error("Error closing DB", err));
    };
  }, []);

  const handleAddSampleChannel = async () => {
    if (!db) {
      Alert.alert("Error", "Database is not initialized yet.");
      return;
    }
    try {
      const newChannel = {
        channel_id: `chan_${Date.now()}`,
        channel_name: 'Sample Channel',
        channel_desc: 'This is a test channel',
        channel_status: 1, // Example status
      };
      const results = await addChannel(db, newChannel);
      console.log('Channel added:', results);
      Alert.alert('Success', `Channel added with ID: ${results.insertId}`);
      // You might want to refresh channel list here
    } catch (error) {
      console.error('Failed to add sample channel:', error);
      Alert.alert('Error', 'Failed to add channel.');
    }
  };

  return (
    <View>
      <Text>SQLite Demo</Text>
      <Button
        title="Add Sample Channel"
        onPress={handleAddSampleChannel}
        disabled={!db} // Disable button until DB is ready
      />
      {/* Add UI elements to display data */}
    </View>
  );
};

export default Sqldemo;
