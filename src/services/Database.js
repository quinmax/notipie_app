import SQLite from 'react-native-sqlite-storage';

// Enable promise-based operations
SQLite.enablePromise(true);

const DATABASE_NAME = 'Notipie.db';
const DATABASE_LOCATION = 'default'; // Use 'default' for standard location

let db;
let dbInstance = null; // Renamed for clarity from 'db' to 'dbInstance' at module level
let dbInitializationPromise = null; // To hold the promise for DB initialization

// This function initializes the database tables if they don't exist.
// It's wrapped in a Promise to allow `getDBConnection` to await its completion.
const initDatabaseTables = (db) => { // Renamed from initDatabase to be more specific
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            console.log('[Database.js] Starting database table initialization transaction...');
            // CHANNELS Table
            tx.executeSql(
                getCreateChannelsTableQuery(),
                [],
                () => console.log('[Database.js] Queued: Create CHANNELS table.'),
                (txError) => { // Changed error variable name for clarity
                    console.error("Error creating CHANNELS table transactionally", txError);
                    reject(txError); // Important to reject the promise on error
                    return true; // Stop the transaction
                }
            );
            // NOTIFICATIONS Table
            tx.executeSql(
                getCreateNotificationsTableQuery(),
                [],
                () => console.log('[Database.js] Queued: Create NOTIFICATIONS table.'),
                (txError) => {
                    console.error("Error creating NOTIFICATIONS table transactionally", txError);
                    reject(txError);
                    return true;
                }
            );
            // PROFILE Table
            tx.executeSql(
                getCreateProfileTableQuery(),
                [],
                () => console.log('[Database.js] Queued: Create PROFILE table.'),
                (txError) => {
                    console.error("Error creating PROFILE table transactionally", txError);
                    reject(txError);
                    return true;
                }
            );
        }, (transactionError) => { // Transaction error callback
            console.error("[Database.js] Transaction error during DB table initialization:", transactionError);
            reject(transactionError);
        }, () => { // Transaction success callback
            console.log("[Database.js] Database table initialization transaction completed successfully.");
            resolve(); // Resolve the promise after successful transaction
        });
    });
};
















export const getDBConnection = async () => {
	if (dbInstance) {
        console.log('[Database.js] Returning existing DB connection.');
        // If we already have an instance, ensure initialization is complete
        if (dbInitializationPromise) {
            await dbInitializationPromise;
        }
        return dbInstance;
    }

    console.log('[Database.js] Opening new DB connection...');
    try {
        const newDbInstance = await SQLite.openDatabase({ // Use a local var first
            name: DATABASE_NAME,
            location: DATABASE_LOCATION,
        });
        console.log('[Database.js] Database opened successfully via SQLite.openDatabase.');
        dbInstance = newDbInstance; // Assign to module-level variable
        // Start initialization and store the promise
        dbInitializationPromise = initDatabaseTables(dbInstance);
        await dbInitializationPromise; // Wait for initDatabaseTables to complete
        console.log('[Database.js] DB Table Initialization complete. Returning connection.');
        return dbInstance;
    } catch (error) {
        console.error("[Database.js] Failed to get DB connection or initialize tables:", error);
        dbInstance = null; // Reset on error
        dbInitializationPromise = null;
        throw error; // Re-throw to allow caller to handle
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
  const params = [profile.user_name, profile.email_address, profile.contact_id, profile.fcm_token];
  try {
    const [results] = await dbInstance.executeSql(insertQuery, params);
    console.log('Profile saved successfully, ID:', results.insertId);
    return results;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const getProfile = async (dbInstance) => {
  const query = "SELECT * FROM PROFILE LIMIT 1;"; // Adjust as needed
  try {
	const [results] = await dbInstance.executeSql(query);
	if (results.rows.length > 0) {
	  return results.rows.item(0); // Return the first profile found
	}
	return null; // No profile found
  } catch (error) {
	console.error('Error fetching profile:', error);
	throw error;
  }
}

/**
 * Updates the FCM token (contact_token) for a given profile.
 * @param {SQLite.SQLiteDatabase} dbInstance - The database connection instance.
 * @param {string} contactId - The contact_id of the profile to update.
 * @param {string} fcmToken - The new FCM token.
 * @returns {Promise<SQLite.ResultSet>}
 */
export const updateProfileFcmToken = async (dbInstance, contactId, fcmToken) => {
  const updateQuery = `UPDATE PROFILE SET contact_token = ? WHERE contact_id = ?;`;
  try {
    if (!contactId) {
      console.warn('[Database] updateProfileFcmToken: contactId is null or undefined. Skipping update.');
      return null; // Or throw an error if contactId is strictly required
    }
    const [results] = await dbInstance.executeSql(updateQuery, [fcmToken, contactId]);
    console.log(`[Database] FCM token updated for contact_id ${contactId}. Rows affected: ${results.rowsAffected}`);
    return results;
  } catch (error) {
    console.error(`[Database] Error updating FCM token for contact_id ${contactId}:`, error);
    throw error;
  }
};

