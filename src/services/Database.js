import SQLite from 'react-native-sqlite-storage';

// Enable promise-based operations
SQLite.enablePromise(true);

const DATABASE_NAME = 'Notipie.db';
const DATABASE_LOCATION = 'default'; // Use 'default' for standard location

let db;

export const getDBConnection = async () => {
  if (db) {
    console.log('Returning existing DB connection');
    return db;
  }
  console.log('Opening DB connection...');
  try {
    db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: DATABASE_LOCATION,
    });
    console.log('Database opened successfully');
    await initDatabase(db); // Initialize tables if they don't exist
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error; // Re-throw error to be handled by caller
  }
};

const createChannelsTable = async (tx) => {
  // Note: INTEGER PRIMARY KEY implies NOT NULL in SQLite.
  // AUTOINCREMENT is added for automatic ID generation.
  // All other columns are explicitly set to allow NULL based on your schema.
  const query = `
    CREATE TABLE IF NOT EXISTS CHANNELS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT NULL,
        channel_name TEXT NULL,
        channel_desc TEXT NULL,
        channel_status INTEGER NULL
    );`;
  await tx.executeSql(query);
  console.log('Table CHANNELS created successfully (if not exists)');
};

const createNotificationsTable = async (tx) => {
  const query = `
    CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sys_channel_id INTEGER NULL,
        sys_noti_id INTEGER NULL,
        title TEXT NULL,
        message TEXT NULL,
        msg_type TEXT NULL,
        msg_src TEXT NULL,
        msg_url TEXT NULL,
        soundfile TEXT NULL,
        active INTEGER NULL,
        created INTEGER NULL,
        expires INTEGER NULL
    );`;
  await tx.executeSql(query);
  console.log('Table NOTIFICATIONS created successfully (if not exists)');
};

const createProfileTable = async (tx) => {
  const query = `
    CREATE TABLE IF NOT EXISTS PROFILE (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id TEXT NULL,
        user_name TEXT NULL,
        email_address TEXT NULL,
        contact_token TEXT NULL
    );`;
  await tx.executeSql(query);
  console.log('Table PROFILE created successfully (if not exists)');
};

// Initialize all tables within a single transaction
const initDatabase = async (dbInstance) => {
  try {
    await dbInstance.transaction(async (tx) => {
      await createChannelsTable(tx);
      await createNotificationsTable(tx);
      await createProfileTable(tx);
    });
    console.log('All tables initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Example: Function to add a channel
export const addChannel = async (dbInstance, channel) => {
  const insertQuery = `
    INSERT INTO CHANNELS (channel_id, channel_name, channel_desc, channel_status)
    VALUES (?, ?, ?, ?);
  `;
  const params = [
    channel.channel_id,
    channel.channel_name,
    channel.channel_desc,
    channel.channel_status,
  ];
  try {
    const [results] = await dbInstance.executeSql(insertQuery, params);
    return results; // Contains insertId, rowsAffected etc.
  } catch (error) {
    console.error('Error adding channel:', error);
    throw error;
  }
};

// Add similar functions for other CRUD operations (getChannels, updateChannel, deleteChannel, etc.)
// and for the NOTIFICATIONS and PROFILE tables.