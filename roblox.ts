/// <reference types="node" />

import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();

const robloxCookie = process.env.ROBLOX_COOKIE || '';
noblox.setCookie(robloxCookie);

export async function robloxrank(userId: number, group: number, rank: number): Promise<void> {
  try {
    await noblox.setRank(group, userId, rank);
  } catch (error) {
    console.error('Error ranking up user:', error);
    throw error;
  }
}

export async function robloxkick(userId: number, group: number): Promise<void> {
  try {
    await noblox.exile(group, userId);
  } catch (error) {
    console.error('Error kicking user:', error);
    throw error;
  }
}
