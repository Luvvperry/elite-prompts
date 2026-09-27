export const MAX_GENERATIONS = 5;

// These are activation keys, not API credentials. They should be rotated before a public launch.
const ACTIVATION_CODES = new Set([
  'XAVI-7K9M-4Q2P',
  'NOVA-8R3L-6T5V',
  'LUME-2H7C-9W4N',
  'ORBIT-5F8J-3M6Q',
  'VAULT-4P1X-8D7K'
]);

const STORAGE_KEY = 'ep_usage_v1';
const COOKIE_KEY = 'ep_usage_v1';

export interface UsageState {
  count: number;
  unlocked: boolean;
  deviceId: string;
}

const safeRead = (key: string): Partial<UsageState> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const readCookie = (): Partial<UsageState> => {
  try {
    const item = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE_KEY}=`));
    return item ? JSON.parse(decodeURIComponent(item.split('=').slice(1).join('='))) : {};
  } catch {
    return {};
  }
};

const hash = (input: string): string => {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
};

export const getDeviceId = (): string => {
  try {
    const seed = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      String(navigator.hardwareConcurrency || ''),
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      String(window.devicePixelRatio || '')
    ].join('|');
    return `ep_${hash(seed)}`;
  } catch {
    return 'ep_fallback_device';
  }
};

const persist = (state: UsageState): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage may be blocked */ }
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(state))}; Max-Age=31536000; Path=/; SameSite=Lax`;
  } catch { /* cookie may be blocked */ }
};

export const getUsageState = (): UsageState => {
  const deviceId = getDeviceId();
  const local = safeRead(STORAGE_KEY);
  const cookie = readCookie();
  const count = Math.max(Number(local.count) || 0, Number(cookie.count) || 0);
  const unlocked = Boolean(local.unlocked || cookie.unlocked);
  const state = { count: Math.min(count, MAX_GENERATIONS), unlocked, deviceId };
  if (local.deviceId !== deviceId || cookie.deviceId !== deviceId || local.count !== count) persist(state);
  return state;
};

export const canGenerate = (): boolean => {
  const state = getUsageState();
  return state.unlocked || state.count < MAX_GENERATIONS;
};

export const registerGeneration = (): UsageState => {
  const current = getUsageState();
  const next = {
    ...current,
    count: current.unlocked ? current.count : Math.min(MAX_GENERATIONS, current.count + 1)
  };
  persist(next);
  return next;
};

export const redeemActivationCode = (value: string): { ok: boolean; state: UsageState } => {
  const code = value.trim().toUpperCase().replace(/\s+/g, '');
  const current = getUsageState();
  if (!ACTIVATION_CODES.has(code)) return { ok: false, state: current };
  const next = { ...current, unlocked: true };
  persist(next);
  return { ok: true, state: next };
};

export const getRemainingGenerations = (): number => {
  const state = getUsageState();
  return state.unlocked ? Infinity : Math.max(0, MAX_GENERATIONS - state.count);
};
