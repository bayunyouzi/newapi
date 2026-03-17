import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface UserData {
  id: string;
  balance: number; // In RMB
  usageHistory: UsageRecord[];
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export async function getDb(): Promise<{ users: Record<string, UserData> }> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default structure
    return { users: {} };
  }
}

export async function saveDb(data: { users: Record<string, UserData> }) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getUser(id: string = 'default_user'): Promise<UserData> {
  const db = await getDb();
  if (!db.users[id]) {
    // Initialize user with 100 RMB balance
    db.users[id] = {
      id,
      balance: 100,
      usageHistory: []
    };
    await saveDb(db);
  }
  return db.users[id];
}

export async function deductBalanceAndRecord(
  userId: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): Promise<UserData> {
  const db = await getDb();
  const user = db.users[userId];
  
  if (!user) {
    throw new Error('User not found');
  }

  const totalTokens = promptTokens + completionTokens;
  // Cost: 0.01 RMB per 1000 tokens
  const cost = (totalTokens / 1000) * 0.01;

  if (user.balance < cost) {
    throw new Error('Insufficient balance');
  }

  user.balance -= cost;

  const record: UsageRecord = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    cost
  };

  user.usageHistory.unshift(record); // Add to beginning
  await saveDb(db);

  return user;
}
