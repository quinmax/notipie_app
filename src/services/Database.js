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

const getCreateChannelsTableQuery = () => {
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

	return query;
};

const getCreateNotificationsTableQuery = () => {
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

	return query;
};

const getCreateProfileTableQuery = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS PROFILE (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id TEXT NULL,
        user_name TEXT NULL,
        email_address TEXT NULL,
        contact_token TEXT NULL
    );`;

	return query;
};

// Initialize all tables within a single transaction
const initDatabase = async (dbInstance) => 
{
	try 
	{
		console.log('Starting database initialization transaction...');
		await dbInstance.transaction((tx) => {
		console.log('Executing: Create CHANNELS table...');
		tx.executeSql(getCreateChannelsTableQuery()); // Execute without await
		console.log('Queued: Create CHANNELS table.');

		console.log('Executing: Create NOTIFICATIONS table...');
		tx.executeSql(getCreateNotificationsTableQuery()); // Execute without await
		console.log('Queued: Create NOTIFICATIONS table.');

		console.log('Executing: Create PROFILE table...');
		tx.executeSql(getCreateProfileTableQuery()); // Execute without await
		console.log('Queued: Create PROFILE table.');
		}, (error) => {
			// Transaction error callback
			console.error('!!! Transaction execution error:', error);
			// We throw the error here to ensure the outer catch block catches it
			throw error;
		}, () => {
		// Transaction success callback
			console.log('Transaction completed successfully.');
		});
    	console.log('All tables initialized successfully.');
  	} 
	catch (error) 
	{
    // Log the specific error during initialization
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

// --- PROFILE Table Functions ---

/**
 * Checks if any profile record exists in the PROFILE table.
 * @param {SQLite.SQLiteDatabase} dbInstance - The database connection instance.
 * @returns {Promise<boolean>} - True if at least one profile exists, false otherwise.
 */
export const checkProfileExists = async (dbInstance) => {
	console.log('[checkProfileExists] Function called.'); // <-- Add log
  const query = "SELECT COUNT(*) as count FROM PROFILE LIMIT 1;";
  try {
	console.log('[checkProfileExists] Attempting to execute SQL:', query); // <-- Add log
    const [results] = await dbInstance.executeSql(query);
	console.log('[checkProfileExists] SQL execution successful.'); // <-- Add log
    if (results.rows.length > 0) {
      const count = results.rows.item(0).count;
      console.log('Profile count:', count);
      return count > 0;
    }
	console.log('[checkProfileExists] No rows found, returning false.'); // <-- Add log
    return false;
  } catch (error) {
    console.error("Error checking profile existence:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Saves or updates the user profile.
 * For simplicity, this example assumes only one profile row exists or should exist.
 * You might need more complex logic (e.g., UPDATE OR INSERT).
 * @param {SQLite.SQLiteDatabase} dbInstance - The database connection instance.
 * @param {object} profile - The profile data { user_name, email_address, contact_id, contact_token }
 * @returns {Promise<SQLite.ResultSet>}
 */
export const saveProfile = async (dbInstance, profile) => {
  // Example: Simple insert. Consider adding UPDATE logic if profile can be modified.
  const insertQuery = `INSERT INTO PROFILE (user_name, email_address, contact_id, contact_token) VALUES (?, ?, ?, ?);`;
  const params = [profile.user_name, profile.email_address, profile.contact_id, profile.contact_token];
  try {
    const [results] = await dbInstance.executeSql(insertQuery, params);
    console.log('Profile saved successfully, ID:', results.insertId);
    return results;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};