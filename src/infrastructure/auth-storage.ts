import * as SecureStore from 'expo-secure-store';

/** Sunucu JWT yerine cihaz-ici oturum isareti. */
export const LOCAL_SESSION_TOKEN = 'local';

const TOKEN_KEY = 'vh_auth_token';
const USERNAME_KEY = 'vh_username';

export async function saveAuthSession(token: string, username: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USERNAME_KEY, username);
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  await SecureStore.deleteItemAsync(USERNAME_KEY).catch(() => undefined);
}

export async function loadAuthSession() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const username = await SecureStore.getItemAsync(USERNAME_KEY);
  return { token, username };
}
