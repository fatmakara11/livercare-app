import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

let devLoggedBase = false;

/** hostUri is usually "192.168.x.x:8081" in dev — we need the IP for the Node API on another port. */
function parseHostFromExpoHostUri(hostUri: string): string | null {
  const trimmed = hostUri.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']');
    if (end > 0) return trimmed.slice(1, end);
  }
  const colon = trimmed.lastIndexOf(':');
  if (colon <= 0) return trimmed;
  return trimmed.slice(0, colon) || null;
}

function inferLanHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = parseHostFromExpoHostUri(hostUri);
    if (host && !/exp\.direct|\.exp\.host$/i.test(host)) return host;
  }
  const scriptURL = (NativeModules as { SourceCode?: { scriptURL?: string } }).SourceCode?.scriptURL;
  if (scriptURL && !scriptURL.startsWith('file:')) {
    const m = scriptURL.match(/https?:\/\/([^/:?]+)/);
    const host = m?.[1];
    if (host && !/exp\.direct|expo\.dev|ngrok/i.test(host)) return host;
  }
  return null;
}

export function getApiBaseUrl() {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');

  const port = DEFAULT_API_PORT;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:${port}`;
    }
    return `http://127.0.0.1:${port}`;
  }

  const lan = inferLanHost();
  if (lan) {
    if (Platform.OS === 'android' && (lan === '127.0.0.1' || lan === 'localhost')) {
      return `http://10.0.2.2:${port}`;
    }
    return `http://${lan}:${port}`;
  }

  if (Platform.OS === 'android') return `http://10.0.2.2:${port}`;
  return `http://127.0.0.1:${port}`;
}

function logApiBaseOnce(base: string) {
  if (__DEV__ && !devLoggedBase) {
    devLoggedBase = true;
    console.log(`[API] ${base}`);
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export type ApiHealthResult = {
  base: string;
  reachable: boolean;
  db?: boolean;
  hint?: string;
};

/** Sunucu + Postgres kontrolu (JWT gerekmez). */
export async function pingApiHealth(): Promise<ApiHealthResult> {
  const base = getApiBaseUrl();
  logApiBaseOnce(base);
  try {
    const res = await fetch(`${base}/health`);
    const raw = await res.text();
    let db: boolean | undefined;
    try {
      const parsed = JSON.parse(raw) as { ok?: boolean; db?: boolean };
      if (typeof parsed.db === 'boolean') db = parsed.db;
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      return { base, reachable: false, hint: `HTTP ${res.status}` };
    }
    if (db === false) {
      return {
        base,
        reachable: true,
        db: false,
        hint: 'PostgreSQL baglantisi yok. DATABASE_URL ve sunucuyu kontrol et.',
      };
    }
    return { base, reachable: true, db: db === true ? true : undefined };
  } catch (e) {
    return {
      base,
      reachable: false,
      hint:
        e instanceof Error
          ? e.message
          : 'Ag hatasi. Windows Guvenlik Duvari 3000 girisine izin vermeyi dene.',
    };
  }
}

export async function apiJson<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = getApiBaseUrl();
  logApiBaseOnce(base);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Sunucuya ulasilamadi (${base}). ` +
        `PCde "npm run server:dev" calistigindan emin ol. ` +
        `Windows icin Guvenlik Duvari'nda TCP 3000 izni ver. ` +
        `Expo tuneli kullaniyorsan kok dizinde .env icinde EXPO_PUBLIC_API_URL tanimla (ornek: http://192.168.1.10:3000).`,
    );
  }

  const raw = await res.text();
  let parsed: unknown = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      parsed = { error: raw.length > 200 ? `${raw.slice(0, 200)}…` : raw };
    }
  }
  const data = parsed as { error?: string };
  if (!res.ok) {
    const msg =
      typeof data.error === 'string' && data.error.length > 0 ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parsed as T;
}
