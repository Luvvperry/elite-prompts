export interface CameraItem {
  id: string;
  name: string;
  category: 'iphone' | 'samsung' | 'pixel' | 'other';
  badge?: string;
  sensor?: string;
  releaseYear?: number;
}

export const CAMERA_CATEGORIES: { id: 'all' | 'iphone' | 'samsung' | 'pixel' | 'other'; labelKey: string }[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'iphone', labelKey: 'iphone' },
  { id: 'samsung', labelKey: 'samsung' },
  { id: 'pixel', labelKey: 'pixel' },
  { id: 'other', labelKey: 'other' }
];

export const CAMERA_LIBRARY: CameraItem[] = [
  // --- IPHONE CATEGORY ---
  { id: 'auto_camera', name: 'Auto / Best Match', category: 'iphone', badge: 'Smart' },
  { id: 'generic_iphone', name: 'Generic iPhone', category: 'iphone', badge: 'Popular' },

  { id: 'iphone_16_pro_max', name: 'iPhone 16 Pro Max', category: 'iphone', badge: 'Flagship', releaseYear: 2024 },
  { id: 'iphone_16_pro', name: 'iPhone 16 Pro', category: 'iphone', badge: 'Flagship', releaseYear: 2024 },
  { id: 'iphone_16_plus', name: 'iPhone 16 Plus', category: 'iphone', releaseYear: 2024 },
  { id: 'iphone_16', name: 'iPhone 16', category: 'iphone', releaseYear: 2024 },

  { id: 'iphone_15_pro_max', name: 'iPhone 15 Pro Max', category: 'iphone', badge: 'Popular', releaseYear: 2023 },
  { id: 'iphone_15_pro', name: 'iPhone 15 Pro', category: 'iphone', badge: 'Recommended', releaseYear: 2023 },
  { id: 'iphone_15_plus', name: 'iPhone 15 Plus', category: 'iphone', releaseYear: 2023 },
  { id: 'iphone_15', name: 'iPhone 15', category: 'iphone', releaseYear: 2023 },

  { id: 'iphone_14_pro_max', name: 'iPhone 14 Pro Max', category: 'iphone', releaseYear: 2022 },
  { id: 'iphone_14_pro', name: 'iPhone 14 Pro', category: 'iphone', badge: 'Sharp', releaseYear: 2022 },
  { id: 'iphone_14_plus', name: 'iPhone 14 Plus', category: 'iphone', releaseYear: 2022 },
  { id: 'iphone_14', name: 'iPhone 14', category: 'iphone', releaseYear: 2022 },

  { id: 'iphone_13_pro_max', name: 'iPhone 13 Pro Max', category: 'iphone', releaseYear: 2021 },
  { id: 'iphone_13_pro', name: 'iPhone 13 Pro', category: 'iphone', releaseYear: 2021 },
  { id: 'iphone_13', name: 'iPhone 13', category: 'iphone', badge: 'Natural', releaseYear: 2021 },
  { id: 'iphone_13_mini', name: 'iPhone 13 mini', category: 'iphone', releaseYear: 2021 },

  { id: 'iphone_12_pro_max', name: 'iPhone 12 Pro Max', category: 'iphone', releaseYear: 2020 },
  { id: 'iphone_12_pro', name: 'iPhone 12 Pro', category: 'iphone', releaseYear: 2020 },
  { id: 'iphone_12', name: 'iPhone 12', category: 'iphone', releaseYear: 2020 },
  { id: 'iphone_12_mini', name: 'iPhone 12 mini', category: 'iphone', releaseYear: 2020 },

  { id: 'iphone_11_pro_max', name: 'iPhone 11 Pro Max', category: 'iphone', releaseYear: 2019 },
  { id: 'iphone_11_pro', name: 'iPhone 11 Pro', category: 'iphone', releaseYear: 2019 },
  { id: 'iphone_11', name: 'iPhone 11', category: 'iphone', releaseYear: 2019 },

  { id: 'iphone_xs_max', name: 'iPhone XS Max', category: 'iphone', releaseYear: 2018 },
  { id: 'iphone_xs', name: 'iPhone XS', category: 'iphone', releaseYear: 2018 },
  { id: 'iphone_xr', name: 'iPhone XR', category: 'iphone', releaseYear: 2018 },
  { id: 'iphone_se', name: 'iPhone SE', category: 'iphone', badge: 'Single Lens' },

  // --- SAMSUNG CATEGORY ---
  { id: 'galaxy_s24_ultra', name: 'Galaxy S24 Ultra', category: 'samsung', badge: 'Flagship 200MP' },
  { id: 'galaxy_s24_plus', name: 'Galaxy S24+', category: 'samsung' },
  { id: 'galaxy_s24', name: 'Galaxy S24', category: 'samsung' },

  { id: 'galaxy_s23_ultra', name: 'Galaxy S23 Ultra', category: 'samsung', badge: 'Sharp 200MP' },
  { id: 'galaxy_s23_plus', name: 'Galaxy S23+', category: 'samsung' },
  { id: 'galaxy_s23', name: 'Galaxy S23', category: 'samsung' },

  { id: 'galaxy_s22_ultra', name: 'Galaxy S22 Ultra', category: 'samsung' },
  { id: 'galaxy_s22_plus', name: 'Galaxy S22+', category: 'samsung' },
  { id: 'galaxy_s22', name: 'Galaxy S22', category: 'samsung' },

  { id: 'galaxy_s21_ultra', name: 'Galaxy S21 Ultra', category: 'samsung' },

  { id: 'galaxy_z_fold', name: 'Galaxy Z Fold', category: 'samsung', badge: 'Foldable' },
  { id: 'galaxy_z_flip', name: 'Galaxy Z Flip', category: 'samsung', badge: 'Compact' },
  { id: 'generic_samsung', name: 'Generic Samsung Galaxy', category: 'samsung' },

  // --- GOOGLE PIXEL CATEGORY ---
  { id: 'pixel_9_pro', name: 'Pixel 9 Pro', category: 'pixel', badge: 'Ultra HDR' },
  { id: 'pixel_9', name: 'Pixel 9', category: 'pixel' },

  { id: 'pixel_8_pro', name: 'Pixel 8 Pro', category: 'pixel', badge: 'Computational' },
  { id: 'pixel_8', name: 'Pixel 8', category: 'pixel' },

  { id: 'pixel_7_pro', name: 'Pixel 7 Pro', category: 'pixel' },
  { id: 'pixel_7', name: 'Pixel 7', category: 'pixel' },

  { id: 'pixel_6_pro', name: 'Pixel 6 Pro', category: 'pixel' },
  { id: 'generic_pixel', name: 'Generic Google Pixel', category: 'pixel' },

  // --- OTHER SMARTPHONES CATEGORY ---
  { id: 'xiaomi_14_ultra', name: 'Xiaomi 14 Ultra', category: 'other', badge: '1-inch Leica' },
  { id: 'xiaomi_14', name: 'Xiaomi 14', category: 'other' },
  { id: 'xiaomi_13_pro', name: 'Xiaomi 13 Pro', category: 'other' },

  { id: 'oneplus_12', name: 'OnePlus 12', category: 'other', badge: 'Hasselblad' },
  { id: 'oneplus_11', name: 'OnePlus 11', category: 'other' },

  { id: 'huawei_p60_pro', name: 'Huawei P60 Pro', category: 'other', badge: 'XMAGE' },
  { id: 'honor_magic_series', name: 'Honor Magic series', category: 'other' },
  { id: 'motorola_edge_series', name: 'Motorola Edge series', category: 'other' },

  { id: 'generic_premium_android', name: 'Generic Premium Android', category: 'other' },
  { id: 'generic_midrange_android', name: 'Generic Midrange Android', category: 'other' },
  { id: 'budget_android_phone', name: 'Budget Android Phone', category: 'other', badge: 'High Noise' },
  { id: 'older_smartphone_camera', name: 'Older Smartphone Camera', category: 'other', badge: 'Vintage Grain' },
  { id: 'professional_camera', name: 'Professional Camera', category: 'other', badge: 'Full Frame' }
];

const RECENT_KEY = 'ep_recent_cameras';
const FAVORITES_KEY = 'ep_favorite_cameras';

export function getRecentCameras(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : ['iPhone 15 Pro', 'iPhone 13', 'Galaxy S24 Ultra'];
  } catch {
    return ['iPhone 15 Pro', 'iPhone 13'];
  }
}

export function saveRecentCamera(name: string): void {
  try {
    const recents = getRecentCameras().filter(c => c !== name);
    recents.unshift(name);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 5)));
  } catch {
    // ignore
  }
}

export function getFavoriteCameras(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['iPhone 15 Pro', 'iPhone 13'];
  } catch {
    return ['iPhone 15 Pro'];
  }
}

export function toggleFavoriteCamera(name: string): string[] {
  try {
    const favorites = getFavoriteCameras();
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
