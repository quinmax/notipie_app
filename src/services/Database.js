import SQLite from 'react-native-sqlite-storage';

// Enable promise-based operations
SQLite.enablePromise(true);

const DATABASE_NAME = 'Notipie.db';
const DATABASE_LOCATION = 'default'; // Use 'default' for standard location

let dbInstance = null; // Renamed for clarity from 'db' to 'dbInstance' at module level
let dbInitializationPromise = null; // To hold the promise for DB initialization


/**
 * Initializes the database tables if they don't exist.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @returns {Promise<void>}
 */
const initDatabaseTables = (db) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        console.log('[Database.js] Initializing database tables...');
        tx.executeSql(getCreateChannelsTableQuery(), [], () => console.log('[Database.js] CHANNELS table created.'));
        tx.executeSql(getCreateNotificationsTableQuery(), [], () => console.log('[Database.js] NOTIFICATIONS table created.'));
        tx.executeSql(getCreateProfileTableQuery(), [], () => console.log('[Database.js] PROFILE table created.'));
      },
      (error) => {
        console.error('[Database.js] Transaction error during table initialization:', error);
        reject(error);
      },
      () => {
        console.log('[Database.js] Database tables initialized successfully.');
        resolve();
      }
    );
  });
};

/**
 * Opens a connection to the SQLite database and initializes tables.
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export const getDBConnection = async () => {
  if (dbInstance) {
    console.log('[Database.js] Returning existing DB connection.');
    if (dbInitializationPromise) await dbInitializationPromise;
    return dbInstance;
  }

  console.log('[Database.js] Opening new DB connection...');
  try {
    dbInstance = await SQLite.openDatabase({ name: DATABASE_NAME, location: DATABASE_LOCATION });
    console.log('[Database.js] Database opened successfully.');
    dbInitializationPromise = initDatabaseTables(dbInstance);
    await dbInitializationPromise;
    return dbInstance;
  } catch (error) {
    console.error('[Database.js] Failed to open database:', error);
    dbInstance = null;
    dbInitializationPromise = null;
    throw error;
  }
};

// --- Table Creation Queries ---

const getCreateChannelsTableQuery = () => `
  CREATE TABLE IF NOT EXISTS CHANNELS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT,
    channel_name TEXT,
    channel_desc TEXT,
    channel_status INTEGER
  );
`;

const getCreateNotificationsTableQuery = () => `
  CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sys_channel_id INTEGER,
    sys_noti_id INTEGER,
    title TEXT,
    message TEXT,
    msg_type TEXT,
    msg_src TEXT,
    msg_url TEXT,
    soundfile TEXT,
    active INTEGER,
    created INTEGER,
    expires INTEGER,
	keep INTEGER DEFAULT 0
  );
`;

const getCreateProfileTableQuery = () => `
  CREATE TABLE IF NOT EXISTS PROFILE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id TEXT,
    user_name TEXT,
    email_address TEXT,
    contact_token TEXT
  );
`;

// --- CHANNELS Table Functions ---
/**
 * Checks if a channel exists in the CHANNELS table by its channel_id.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @param {string} channel_id - The channel ID to check.
 * @returns {Promise<boolean>} - True if the channel exists, false otherwise.
 */
export const checkChannelExists = async (db, channel_id) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM CHANNELS
    WHERE channel_id = ?;
  `;
  try {
    const [results] = await db.executeSql(query, [channel_id]);
    const count = results.rows.item(0).count;
    return count > 0;
  } catch (error) {
    console.error('[Database.js] Error checking if channel exists:', error);
    throw error;
  }
};

/**
 * Adds a new channel to the CHANNELS table.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @param {string} channel_id - The channel ID.
 * @param {string} channel_name - The channel name.
 * @param {string} channel_desc - The channel description.
 * @param {number} channel_status - The channel status.
 * @returns {Promise<number>} - The ID of the newly inserted channel.
 */
export const addChannel = async (db, channel_id, channel_name, channel_desc, channel_status) => {
  const query = `
    INSERT INTO CHANNELS (channel_id, channel_name, channel_desc, channel_status)
    VALUES (?, ?, ?, ?);
  `;
  try {
    const [results] = await db.executeSql(query, [channel_id, channel_name, channel_desc, channel_status]);
    return results.insertId;
  } catch (error) {
    console.error('[Database.js] Error adding channel:', error);
    throw error;
  }
};

/**
 * Fetches a channel by its channel_id.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @param {string} channel_id - The channel ID.
 * @returns {Promise<object|null>} - The channel record or null if not found.
 */
export const getChannel = async (db, channel_id) => {
  const query = `
    SELECT id AS app_id, channel_id, channel_name AS name, channel_desc AS description, channel_status AS status
    FROM CHANNELS
    WHERE channel_id = ?
    LIMIT 1;
  `;
  try {
    const [results] = await db.executeSql(query, [channel_id]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('[Database.js] Error fetching channel:', error);
    throw error;
  }
};

// Get all channels order by channel_name
export const getAllChannels = async (db) => {
	const query = `
		SELECT id, channel_id, channel_name, channel_desc, channel_status
		FROM CHANNELS
		ORDER BY channel_name;
	`;
	try {
		const [results] = await db.executeSql(query);
		const channels = [];
		for (let i = 0; i < results.rows.length; i++) {
			channels.push(results.rows.item(i));
		}
		return channels;
	} catch (error) {
		console.error('[Database.js] Error fetching all channels:', error);
		throw error;
	}
};
// Update channel status
export const updateChannelStatus = async (db, id, channel_status) => {
	const query = `
		UPDATE CHANNELS
		SET channel_status = ?
		WHERE id = ?;
	`;
	try {
		await db.executeSql(query, [channel_status, id]);
		console.log(`[Database.js] Channel ${id} status updated to ${channel_status}.`);
	} catch (error) {
		console.error('[Database.js] Error updating channel status:', error);
		throw error;
	}
};



// --- PROFILE Table Functions ---

/**
 * Checks if a profile exists in the PROFILE table.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @returns {Promise<boolean>} - True if a profile exists, false otherwise.
 */
export const checkProfileExists = async (db) => {
  const query = 'SELECT COUNT(*) AS count FROM PROFILE LIMIT 1;';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.item(0).count > 0;
  } catch (error) {
    console.error('[Database.js] Error checking profile existence:', error);
    throw error;
  }
};

/**
 * Saves a new profile to the PROFILE table.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @param {object} profile - The profile data.
 * @returns {Promise<number>} - The ID of the newly inserted profile.
 */
export const saveProfile = async (db, profile) => {
  const query = `
    INSERT INTO PROFILE (user_name, email_address, contact_id, contact_token)
    VALUES (?, ?, ?, ?);
  `;
  try {
    const [results] = await db.executeSql(query, [
      profile.user_name,
      profile.email_address,
      profile.contact_id,
      profile.contact_token,
    ]);
    return results.insertId;
  } catch (error) {
    console.error('[Database.js] Error saving profile:', error);
    throw error;
  }
};

export const updateProfile = async (db, profile) => {
	  const query = `
	UPDATE PROFILE
	SET user_name = ?, email_address = ?, contact_token = ?
	WHERE id = ?;
  `;
  try {
	await db.executeSql(query, [
	  profile.user_name,
	  profile.email_address,
	  profile.fcm_token,
	  profile.profile_id,
	]);
	console.log(`[Database.js] Profile ${profile.id} updated successfully.`);
  } catch (error) {
	console.error('[Database.js] Error updating profile:', error);
	throw error;
  }
};

/**
 * Fetches the first profile from the PROFILE table.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @returns {Promise<object|null>} - The profile record or null if not found.
 */
export const getProfile = async (db) => {
  const query = 'SELECT * FROM PROFILE LIMIT 1;';
  try {
    const [results] = await db.executeSql(query);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('[Database.js] Error fetching profile:', error);
    throw error;
  }
};

// --- NOTIFICATIONS Table Functions ---

/**
 * Inserts a new notification into the NOTIFICATIONS table.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @param {object} notification - The notification data.
 * @returns {Promise<number>} - The ID of the newly inserted notification.
 */
export const insertNotification = async (db, notification) => {
  const query = `
    INSERT INTO NOTIFICATIONS (sys_channel_id, sys_noti_id, title, message, msg_type, msg_src, msg_url, soundfile, active, created, expires)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  try {
    const [results] = await db.executeSql(query, [
      notification.sys_channel_id,
      notification.sys_noti_id,
      notification.title,
      notification.message,
      notification.msg_type,
      notification.msg_src,
      notification.msg_url,
      notification.soundfile,
      1, // Active by default
      notification.created,
      notification.expires,
    ]);
    return results.insertId;
  } catch (error) {
    console.error('[Database.js] Error inserting notification:', error);
    throw error;
  }
};

/**
 * Fetches all active notifications and deletes expired ones.
 * @param {SQLite.SQLiteDatabase} db - The database connection instance.
 * @returns {Promise<object[]>} - An array of active notification records.
 */
export const fetchActiveNotifications = async (db) => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  const fetchQuery = `
    SELECT * 
    FROM NOTIFICATIONS
    WHERE expires >= ? ORDER BY active DESC, created DESC;
  `;
  const deleteQuery = `
    DELETE FROM NOTIFICATIONS
    WHERE expires < ? AND keep = 0;
  `;

  try {
    // Delete expired notifications
    await db.executeSql(deleteQuery, [currentTimestamp]);
    console.log('[Database.js] Expired notifications deleted.');

    // Fetch active notifications
    const [results] = await db.executeSql(fetchQuery, [currentTimestamp]);
    const notifications = [];
    for (let i = 0; i < results.rows.length; i++) {
      notifications.push(results.rows.item(i));
    }
    console.log('[Database.js] Active notifications fetched:', notifications);
    return notifications;
  } catch (error) {
    console.error('[Database.js] Error fetching active notifications:', error);
    throw error;
  }
};

// Set a notification as read by changing acive to 0
export const setNotificationAsRead = async (db, notificationId) => {
  const query = `
	UPDATE NOTIFICATIONS
	SET active = 0
	WHERE id = ?;
  `;
  try {
	await db.executeSql(query, [notificationId]);
	console.log(`[Database.js] Notification ${notificationId} marked as read.`);
  } catch (error) {
	console.error('[Database.js] Error marking notification as read:', error);
	throw error;
  }
};

export const getNotificationById = async (db, id) => {
  const query = 'SELECT * FROM NOTIFICATIONS WHERE id = ?;';
  try {
    const [results] = await db.executeSql(query, [id]);
    if (results.rows.length > 0) {
      return results.rows.item(0); // Return the first matching notification
    }
    return null;
  } catch (error) {
    console.error('[Database.js] Error fetching notification by ID:', error);
    throw error;
  }
};

















