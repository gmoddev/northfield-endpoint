const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'your_database',
};

const pool = mysql.createPool(dbConfig);

async function executeQuery(query, values) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(query, values);
    return rows;
  } finally {
    connection.release();
  }
}

async function fetchDiscordIdFromRover(userId) {
  const roverApiUrl = `https://registry.rover.link/api/guilds/1185312408546332682/roblox-to-discord/${userId}`; // Replace :guildId with your actual guild ID
  const roverApiResponse = await axios.get(roverApiUrl, {
    headers: {
      Authorization: `Bearer rvr2g090726j8d0gei67zoy9y5rim6qm13m7ktz3l3u8asw339d8q8fz0thv1fuh0pb7`, // Replace with your actual Rover API key
    },
  });

  const discordUsers = roverApiResponse.data.discordUsers;
  if (!discordUsers || discordUsers.length === 0) {
    console.error(`Discord user not found for Roblox ID: ${userId}`);
    return null;
  }

  // Assuming you want the first user in the array (you may modify this based on your use case)
  const discordUser = discordUsers[0];
  return discordUser.user.id;
}

async function createLogsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      discord_id VARCHAR(255),
      action_type VARCHAR(50) NOT NULL,
      reason TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await executeQuery(createTableQuery);
}

async function createCurrentlyBannedTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS currentlybanned (
      user_id INT PRIMARY KEY,
      reason TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await executeQuery(createTableQuery);
}

async function banUser(userId, time, reason) {
  try {
    await createLogsTable();
    await createCurrentlyBannedTable();

    const discordId = await fetchDiscordIdFromRover(userId);
    const actualDiscordId = discordId || 0; // If Discord ID doesn't exist, use 0

    const existingBanQuery = 'SELECT * FROM currentlybanned WHERE user_id = ?';
    const existingBanResult = await executeQuery(existingBanQuery, [userId]);

    if (existingBanResult.length > 0) {
      const existingBan = existingBanResult[0];

      if (existingBan.time > time) {
        time = existingBan.time;
      }

      const updateQuery = 'UPDATE currentlybanned SET time = ?, reason = ? WHERE user_id = ?';
      await executeQuery(updateQuery, [time, reason, userId]);
    } else {
      const insertQuery = 'INSERT INTO currentlybanned (user_id, time, reason) VALUES (?, ?, ?)';
      await executeQuery(insertQuery, [userId, time, reason]);
    }

    const logQuery = 'INSERT INTO user_logs (user_id, discord_id, action_type, reason) VALUES (?, ?, ?, ?)';
    await executeQuery(logQuery, [userId, actualDiscordId, 'ban', reason]);
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
}

async function unbanUser(userId, reason) {
  try {
    await createLogsTable();
    await createCurrentlyBannedTable();

    const discordId = await fetchDiscordIdFromRover(userId);
    const actualDiscordId = discordId || 0; // If Discord ID doesn't exist, use 0

    const logQuery = 'INSERT INTO user_logs (user_id, discord_id, action_type, reason) VALUES (?, ?, ?, ?)';
    await executeQuery(logQuery, [userId, actualDiscordId, 'unban', reason]);

    const unbanQuery = 'DELETE FROM currentlybanned WHERE user_id = ?';
    await executeQuery(unbanQuery, [userId]);
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
}

async function warnUser(userId, reason) {
  try {
    await createLogsTable();
    await createCurrentlyBannedTable();

    const discordId = await fetchDiscordIdFromRover(userId);
    const actualDiscordId = discordId || 0; // If Discord ID doesn't exist, use 0

    const logQuery = 'INSERT INTO user_logs (user_id, discord_id, action_type, reason) VALUES (?, ?, ?, ?)';
    await executeQuery(logQuery, [userId, actualDiscordId, 'warn', reason]);
  } catch (error) {
    console.error('Error warning user:', error);
    throw error;
  }
}

async function kickUser(userId, reason) {
  try {
    await createLogsTable();

    const discordId = await fetchDiscordIdFromRover(userId);
    const actualDiscordId = discordId || 0; // If Discord ID doesn't exist, use 0

    const logQuery = 'INSERT INTO user_logs (user_id, discord_id, action_type, reason) VALUES (?, ?, ?, ?)';
    await executeQuery(logQuery, [userId, actualDiscordId, 'kick', reason]);
  } catch (error) {
    console.error('Error kicking user:', error);
    throw error;
  }
}

module.exports = {
  banUser,
  unbanUser,
  warnUser,
  kickUser,
};
