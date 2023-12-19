/// <reference types="node" />

import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();

export async function rankUpUser(userId: number, group: number, rank: number): Promise<void> {
  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE || '');
    await noblox.setRank(group, userId, rank);
  } catch (error) {
    console.error('Error ranking up user:', error);
    throw error;
  }
}

export async function kickUser(userId: number, group: number): Promise<void> {
  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE || '');
    await noblox.exile(group, userId);
  } catch (error) {
    console.error('Error kicking user:', error);
    throw error;
  }
}
