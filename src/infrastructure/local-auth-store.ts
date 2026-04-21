import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';

import type { AppState } from '@/src/domain/types';

const ACCOUNTS_KEY = 'vh_local_accounts_v2';

type AccountRow = { passwordHash: string; salt: string };

function userKey(username: string) {
  return username.trim().toLowerCase();
}

async function loadAccounts(): Promise<Record<string, AccountRow>> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, AccountRow>;
  } catch {
    return {};
  }
}

async function saveAccounts(accounts: Record<string, AccountRow>) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function digest(password: string, salt: string) {
  return sha256(`${salt}:${password}`);
}

function makeSalt() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}-${Math.random().toString(36).slice(2, 14)}`;
}

export async function registerLocalAccount(username: string, password: string) {
  const key = userKey(username);
  if (key.length < 2) throw new Error('Kullanici adi cok kisa');
  if (password.length < 4) throw new Error('Sifre en az 4 karakter olmali');
  const accounts = await loadAccounts();
  if (accounts[key]) throw new Error('Bu kullanici adi zaten kayitli');
  const salt = makeSalt();
  const passwordHash = digest(password, salt);
  accounts[key] = { passwordHash, salt };
  await saveAccounts(accounts);
}

export async function verifyLocalLogin(username: string, password: string): Promise<boolean> {
  const key = userKey(username);
  const accounts = await loadAccounts();
  const row = accounts[key];
  if (!row) return false;
  const h = digest(password, row.salt);
  return h === row.passwordHash;
}

function profileStorageKey(username: string) {
  return `vh_local_profile_v2_${userKey(username)}`;
}

export type LocalProfile = {
  surgeryDate: string | null;
  taskPlan: AppState['taskPlan'];
};

export async function loadLocalProfile(username: string): Promise<LocalProfile> {
  const raw = await AsyncStorage.getItem(profileStorageKey(username));
  if (!raw) return { surgeryDate: null, taskPlan: {} };
  try {
    const p = JSON.parse(raw) as LocalProfile;
    return {
      surgeryDate: typeof p.surgeryDate === 'string' ? p.surgeryDate : null,
      taskPlan: p.taskPlan && typeof p.taskPlan === 'object' ? p.taskPlan : {},
    };
  } catch {
    return { surgeryDate: null, taskPlan: {} };
  }
}

export async function saveLocalProfile(username: string, profile: LocalProfile) {
  await AsyncStorage.setItem(profileStorageKey(username), JSON.stringify(profile));
}
