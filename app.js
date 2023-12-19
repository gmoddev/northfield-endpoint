const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { robloxrank, robloxkick } = require('./roblox.js');
const { banUser, unbanUser, warnUser } = require('./sql.js');

// Consts
const app = express();
const port = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(limiter);

// Frontend
app.post('/rank-up', async (req, res) => {
  const { userId, group, rank, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await robloxrank(userId, group, rank);
    res.json({ success: true, message: 'User ranked up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/kick-user', async (req, res) => {
  const { userId, group, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await robloxkick(userId, group);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SQL Actions
app.post('/ban-userlog', async (req, res) => {
  const { userId, time, reason, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await banUser(userId, time, reason);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/unban-userlog', async (req, res) => {
  const { userId, reason, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await unbanUser(userId, reason);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/warn-userlog', async (req, res) => {
  const { userId, reason, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await warnUser(userId, reason);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/kick-userlog', async (req, res) => {
  const { userId, reason, permissionKey } = req.body;

  if (permissionKey !== process.env.per_key) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await warnUser(userId, reason);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// App start
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
