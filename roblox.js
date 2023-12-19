const noblox = require('noblox.js');
const dotenv = require('dotenv');

dotenv.config();

const robloxCookie = process.env.ROBLOX_COOKIE || '';
noblox.setCookie(robloxCookie);

async function robloxrank(userId, group, rank) {
  try {
    await noblox.setRank(group, userId, rank);
  } catch (error) {
    console.error('Error ranking up user:', error);
    throw error;
  }
}

async function robloxkick(userId, group) {
  try {
    await noblox.exile(group, userId);
  } catch (error) {
    console.error('Error kicking user:', error);
    throw error;
  }
}

module.exports = {
  robloxrank,
  robloxkick,
};
