import { AspectRatioType } from '../types';

export type OutputFormatId =
  | 'auto'
  | 'ig_square'
  | 'ig_portrait'
  | 'ig_story'
  | 'ig_reel'
  | 'tiktok'
  | 'youtube_thumb'
  | 'youtube_shorts'
  | 'facebook_feed'
  | 'facebook_story'
  | 'x_post'
  | 'linkedin_post'
  | 'pinterest_pin'
  | 'whatsapp_status'
  | 'telegram_story'
  | 'mobile_wallpaper'
  | 'desktop_wallpaper'
  | 'website_hero'
  | 'ecommerce_product'
  | 'custom';

export interface OutputFormatItem {
  id: OutputFormatId;
  labelKey: string;
  defaultRatio: AspectRatioType;
  sub: string;
  category: 'social' | 'video' | 'display' | 'commercial';
}

export const OUTPUT_FORMATS: OutputFormatItem[] = [
  { id: 'auto', labelKey: 'auto', defaultRatio: 'auto', sub: 'Native Ratio', category: 'social' },
  { id: 'ig_portrait', labelKey: 'ig_portrait', defaultRatio: '4:5', sub: '4:5 Feed Portrait', category: 'social' },
  { id: 'ig_square', labelKey: 'ig_square', defaultRatio: '1:1', sub: '1:1 Feed Square', category: 'social' },
  { id: 'ig_story', labelKey: 'ig_story', defaultRatio: '9:16', sub: '9:16 Fullscreen', category: 'social' },
  { id: 'ig_reel', labelKey: 'ig_reel', defaultRatio: '9:16', sub: '9:16 Reels', category: 'social' },
  { id: 'tiktok', labelKey: 'tiktok', defaultRatio: '9:16', sub: '9:16 Vertical Video', category: 'social' },
  { id: 'youtube_thumb', labelKey: 'youtube_thumb', defaultRatio: '16:9', sub: '16:9 Thumbnail', category: 'video' },
  { id: 'youtube_shorts', labelKey: 'youtube_shorts', defaultRatio: '9:16', sub: '9:16 Shorts', category: 'video' },
  { id: 'facebook_feed', labelKey: 'facebook_feed', defaultRatio: '4:5', sub: '4:5 Feed', category: 'social' },
  { id: 'facebook_story', labelKey: 'facebook_story', defaultRatio: '9:16', sub: '9:16 Story', category: 'social' },
  { id: 'x_post', labelKey: 'x_post', defaultRatio: '16:9', sub: '16:9 Landscape', category: 'social' },
  { id: 'linkedin_post', labelKey: 'linkedin_post', defaultRatio: '1:1', sub: '1:1 Square Post', category: 'social' },
  { id: 'pinterest_pin', labelKey: 'pinterest_pin', defaultRatio: '2:3', sub: '2:3 Vertical Pin', category: 'social' },
  { id: 'whatsapp_status', labelKey: 'whatsapp_status', defaultRatio: '9:16', sub: '9:16 Status', category: 'social' },
  { id: 'telegram_story', labelKey: 'telegram_story', defaultRatio: '9:16', sub: '9:16 Story', category: 'social' },
  { id: 'mobile_wallpaper', labelKey: 'mobile_wallpaper', defaultRatio: '9:16', sub: '9:16 Lock Screen', category: 'display' },
  { id: 'desktop_wallpaper', labelKey: 'desktop_wallpaper', defaultRatio: '16:9', sub: '16:9 4K Monitor', category: 'display' },
  { id: 'website_hero', labelKey: 'website_hero', defaultRatio: '21:9', sub: '21:9 Ultra-Wide Banner', category: 'display' },
  { id: 'ecommerce_product', labelKey: 'ecommerce_product', defaultRatio: '1:1', sub: '1:1 Clean Catalog', category: 'commercial' },
  { id: 'custom', labelKey: 'custom', defaultRatio: 'auto', sub: 'Custom Ratio', category: 'display' }
];

export interface AspectRatioOption {
  value: AspectRatioType;
  label: string;
  sub: string;
  iconW: number;
  iconH: number;
}

export const ASPECT_RATIOS_LIST: AspectRatioOption[] = [
  { value: 'auto', label: 'Auto', sub: 'Original', iconW: 14, iconH: 14 },
  { value: '4:5', label: '4:5', sub: 'IG Portrait', iconW: 12, iconH: 15 },
  { value: '9:16', label: '9:16', sub: 'Stories / Reels', iconW: 10, iconH: 18 },
  { value: '1:1', label: '1:1', sub: 'Square', iconW: 14, iconH: 14 },
  { value: '3:4', label: '3:4', sub: 'Classic Portrait', iconW: 12, iconH: 16 },
  { value: '4:3', label: '4:3', sub: 'Classic Photo', iconW: 16, iconH: 12 },
  { value: '2:3', label: '2:3', sub: '35mm Film', iconW: 11, iconH: 16 },
  { value: '3:2', label: '3:2', sub: 'Photo Landscape', iconW: 16, iconH: 11 },
  { value: '16:9', label: '16:9', sub: 'Landscape 4K', iconW: 18, iconH: 10 },
  { value: '5:4', label: '5:4', sub: 'Large Format', iconW: 15, iconH: 12 },
  { value: '9:21', label: '9:21', sub: 'Tall Mobile', iconW: 8, iconH: 18 },
  { value: '21:9', label: '21:9', sub: 'Ultrawide Cinematic', iconW: 20, iconH: 9 },
  { value: '1:2', label: '1:2', sub: 'Tall Poster', iconW: 8, iconH: 16 },
  { value: '2:1', label: '2:1', sub: 'Wide Banner', iconW: 18, iconH: 9 },
  { value: 'a4_portrait', label: 'A4', sub: 'Portrait Print', iconW: 11, iconH: 16 },
  { value: 'a4_landscape', label: 'A4 Land', sub: 'Landscape Print', iconW: 16, iconH: 11 },
  { value: 'mobile_wallpaper', label: 'Wallpaper', sub: 'Phone Display', iconW: 9, iconH: 18 },
  { value: 'desktop_wallpaper', label: 'Desktop', sub: 'Monitor Wallpaper', iconW: 18, iconH: 10 },
  { value: 'custom', label: 'Custom', sub: 'Freestyle', iconW: 14, iconH: 14 }
];

const RECENT_RATIO_KEY = 'ep_recent_ratios';
const FAVORITE_RATIO_KEY = 'ep_favorite_ratios';

export function getRecentRatios(): AspectRatioType[] {
  try {
    const raw = localStorage.getItem(RECENT_RATIO_KEY);
    return raw ? JSON.parse(raw) : ['4:5', '9:16', '1:1', '16:9'];
  } catch {
    return ['4:5', '9:16', '1:1'];
  }
}

export function saveRecentRatio(ratio: AspectRatioType): void {
  try {
    const recents = getRecentRatios().filter(r => r !== ratio);
    recents.unshift(ratio);
    localStorage.setItem(RECENT_RATIO_KEY, JSON.stringify(recents.slice(0, 5)));
  } catch {
    // ignore
  }
}
