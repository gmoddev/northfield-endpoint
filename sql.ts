import * as mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'your_database',
};

const pool = mysql.createPool(dbConfig);

async function executeQuery(query: string, values?: any[]): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(query, values);
    return rows;
  } finally {
    connection.release();
  }
}

async function createLogsTable(): Promise<void> {
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

async function createCurrentlyBannedTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS currentlybanned (
      user_id INT PRIMARY KEY,
      reason TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await executeQuery(createTableQuery);
}

export async function banUser(userId: number, time: number, reason: string): Promise<void> {
    try {
      await createLogsTable();
      await createCurrentlyBannedTable();
  
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
  
      const logQuery = 'INSERT INTO user_logs (user_id, action_type, reason) VALUES (?, ?, ?)';
      await executeQuery(logQuery, [userId, 'ban', reason]);
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

export async function unbanUser(userId: number, reason: string): Promise<void> {
  try {
    await createLogsTable();
    await createCurrentlyBannedTable();

    const logQuery = 'INSERT INTO user_logs (user_id, action_type, reason) VALUES (?, ?, ?)';
    await executeQuery(logQuery, [userId, 'unban', reason]);

    const unbanQuery = 'DELETE FROM currentlybanned WHERE user_id = ?';
    await executeQuery(unbanQuery, [userId]);
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
}

export async function warnUser(userId: number, reason: string): Promise<void> {
  try {
    await createLogsTable();
    await createCurrentlyBannedTable();
    
    const logQuery = 'INSERT INTO user_logs (user_id, action_type, reason) VALUES (?, ?, ?)';
    await executeQuery(logQuery, [userId, 'warn', reason]);
  } catch (error) {
    console.error('Error warning user:', error);
    throw error;
  }
}
export async function kickUser(userId: number, reason: string): Promise<void> {
  try {
    await createLogsTable();
  
    const logQuery = 'INSERT INTO user_logs (user_id, action_type, reason) VALUES (?, ?, ?)';
    await executeQuery(logQuery, [userId, 'kick', reason]);

  } catch (error) {
    console.error('Error kicking user:', error);
    throw error;
  }
}