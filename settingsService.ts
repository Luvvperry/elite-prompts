import { UserStudioSettings, DEFAULT_USER_SETTINGS } from './types';

export const TRX_SETTINGS_STORAGE_KEY = 'project_trx_user_settings_v2';
export const TRX_SETTINGS_CHANGED_EVENT = 'project_trx_settings_changed';

/**
 * Retrieves the saved user settings from localStorage, or returns default fallback settings.
 */
export const getStoredSettings = (): UserStudioSettings => {
  try {
    const raw = localStorage.getItem(TRX_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_USER_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.error('Error reading Project TRX settings from storage:', err);
    return { ...DEFAULT_USER_SETTINGS };
  }
};

/**
 * Checks if the user has previously saved custom settings.
 */
export const hasCustomSettings = (): boolean => {
  try {
    return localStorage.getItem(TRX_SETTINGS_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

/**
 * Saves or updates settings in localStorage and dispatches an update event for reactive components.
 */
export const saveStoredSettings = (
  newSettings: Partial<UserStudioSettings>
): UserStudioSettings => {
  try {
    const current = getStoredSettings();
    const updated: UserStudioSettings = {
      ...current,
      ...newSettings,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(TRX_SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TRX_SETTINGS_CHANGED_EVENT, { detail: updated })
      );
    }
    return updated;
  } catch (err) {
    console.error('Error saving Project TRX settings:', err);
    return { ...DEFAULT_USER_SETTINGS, ...newSettings };
  }
};

/**
 * Resets settings back to factory defaults in storage.
 */
export const clearStoredSettings = (): UserStudioSettings => {
  try {
    localStorage.removeItem(TRX_SETTINGS_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(TRX_SETTINGS_CHANGED_EVENT, {
          detail: DEFAULT_USER_SETTINGS,
        })
      );
    }
  } catch (err) {
    console.error('Error clearing settings:', err);
  }
  return { ...DEFAULT_USER_SETTINGS };
};

/**
 * Subscribes a callback to settings updates across components.
 */
export const subscribeToSettings = (
  callback: (settings: UserStudioSettings) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvt = event as CustomEvent<UserStudioSettings>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };

  window.addEventListener(TRX_SETTINGS_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener(TRX_SETTINGS_CHANGED_EVENT, handler);
  };
};
