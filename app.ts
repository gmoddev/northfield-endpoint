import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { rankUpUser, kickUser } from './roblox.ts';

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

app.post('/rank-up', async (req, res) => {
  const { userId,group,rank, permissionKey } = req.body;

  if (permissionKey !== 'Z.,>[bu9r?;@ye,z%M-`{Wp5~AC4_sgN</#*!q2VLHw') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await rankUpUser(userId,group,rank);
    res.json({ success: true, message: 'User ranked up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/kick-user', async (req, res) => {
  const { userId,group, permissionKey } = req.body;

  if (permissionKey !== 'Z.,>[bu9r?;@ye,z%M-`{Wp5~AC4_sgN</#*!q2VLHw') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await kickUser(userId,group);
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
