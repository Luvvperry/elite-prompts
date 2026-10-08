export type TypeCategory =
  | 'all'
  | 'people'
  | 'object_pov'
  | 'vehicles'
  | 'environments'
  | 'architecture'
  | 'product'
  | 'tools';

export interface TypeItem {
  id: string;
  labelKey: string;
  category: TypeCategory;
  badge?: string;
  iconName?: string;
  modalityMap: 'person' | 'object_pov' | 'scene' | 'vehicle' | 'product' | 'interior' | 'architecture' | 'edit_prompt';
  description?: Record<string, string>;
}

export const TYPE_CATEGORIES: { id: TypeCategory; labelKey: string }[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'people', labelKey: 'people' },
  { id: 'object_pov', labelKey: 'object_pov' },
  { id: 'vehicles', labelKey: 'vehicles' },
  { id: 'environments', labelKey: 'environments' },
  { id: 'architecture', labelKey: 'architecture' },
  { id: 'product', labelKey: 'product' },
  { id: 'tools', labelKey: 'tools' }
];

export const TYPE_LIBRARY: TypeItem[] = [
  // --- PEOPLE ---
  { id: 'person', labelKey: 'person', category: 'people', badge: 'Standard', modalityMap: 'person' },
  { id: 'solo_person', labelKey: 'solo_person', category: 'people', modalityMap: 'person' },
  { id: 'duo_people', labelKey: 'duo_people', category: 'people', modalityMap: 'person' },
  { id: 'group_people', labelKey: 'group_people', category: 'people', modalityMap: 'person' },
  { id: 'couple', labelKey: 'couple', category: 'people', modalityMap: 'person' },
  { id: 'selfie', labelKey: 'selfie', category: 'people', badge: 'Front Cam', modalityMap: 'person' },
  { id: 'mirror_selfie', labelKey: 'mirror_selfie', category: 'people', badge: 'Mirror', modalityMap: 'person' },
  { id: 'full_body', labelKey: 'full_body', category: 'people', modalityMap: 'person' },
  { id: 'half_body', labelKey: 'half_body', category: 'people', modalityMap: 'person' },
  { id: 'portrait', labelKey: 'portrait', category: 'people', badge: 'Prime Lens', modalityMap: 'person' },
  { id: 'candid_person', labelKey: 'candid_person', category: 'people', badge: 'Unposed', modalityMap: 'person' },
  { id: 'person_walking', labelKey: 'person_walking', category: 'people', modalityMap: 'person' },
  { id: 'person_sitting', labelKey: 'person_sitting', category: 'people', modalityMap: 'person' },
  { id: 'person_leaning', labelKey: 'person_leaning', category: 'people', modalityMap: 'person' },
  { id: 'person_in_car', labelKey: 'person_in_car', category: 'people', modalityMap: 'person' },
  { id: 'person_with_vehicle', labelKey: 'person_with_vehicle', category: 'people', modalityMap: 'person' },
  { id: 'person_with_object', labelKey: 'person_with_object', category: 'people', modalityMap: 'person' },
  { id: 'outfit_fashion', labelKey: 'outfit_fashion', category: 'people', badge: 'Style', modalityMap: 'person' },
  { id: 'lifestyle_person', labelKey: 'lifestyle_person', category: 'people', modalityMap: 'person' },
  { id: 'sport_action', labelKey: 'sport_action', category: 'people', modalityMap: 'person' },

  // --- OBJECT / POV ---
  { id: 'object_pov', labelKey: 'object_pov', category: 'object_pov', badge: 'Popular', modalityMap: 'object_pov' },
  { id: 'object_close_up', labelKey: 'object_close_up', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'handheld_object', labelKey: 'handheld_object', category: 'object_pov', badge: 'Hands In', modalityMap: 'object_pov' },
  { id: 'object_on_table', labelKey: 'object_on_table', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'object_in_hand', labelKey: 'object_in_hand', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'desk_pov', labelKey: 'desk_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'food_pov', labelKey: 'food_pov', category: 'object_pov', badge: 'Dining', modalityMap: 'object_pov' },
  { id: 'table_food', labelKey: 'table_food', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'luxury_objects', labelKey: 'luxury_objects', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'watch_jewelry_pov', labelKey: 'watch_jewelry_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'phone_tech_pov', labelKey: 'phone_tech_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'bag_accessory_pov', labelKey: 'bag_accessory_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'sneaker_pov', labelKey: 'sneaker_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'car_hood_pov', labelKey: 'car_hood_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'car_interior_pov', labelKey: 'car_interior_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'driver_pov', labelKey: 'driver_pov', category: 'object_pov', badge: 'Steering', modalityMap: 'object_pov' },
  { id: 'passenger_pov', labelKey: 'passenger_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'garage_pov', labelKey: 'garage_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'room_pov', labelKey: 'room_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'bed_pov', labelKey: 'bed_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'balcony_pov', labelKey: 'balcony_pov', category: 'object_pov', modalityMap: 'object_pov' },
  { id: 'street_pov', labelKey: 'street_pov', category: 'object_pov', modalityMap: 'object_pov' },

  // --- VEHICLES ---
  { id: 'vehicle', labelKey: 'vehicle', category: 'vehicles', badge: 'General', modalityMap: 'vehicle' },
  { id: 'car_exterior', labelKey: 'car_exterior', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'car_interior', labelKey: 'car_interior', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'driver_seat', labelKey: 'driver_seat', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'passenger_seat', labelKey: 'passenger_seat', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'open_door', labelKey: 'open_door', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'entering_car', labelKey: 'entering_car', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'exiting_car', labelKey: 'exiting_car', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'leaning_against_car', labelKey: 'leaning_against_car', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'car_plus_person', labelKey: 'car_plus_person', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'supercar', labelKey: 'supercar', category: 'vehicles', badge: 'Exotic', modalityMap: 'vehicle' },
  { id: 'suv_4x4', labelKey: 'suv_4x4', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'sedan', labelKey: 'sedan', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'sports_car', labelKey: 'sports_car', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'classic_car', labelKey: 'classic_car', category: 'vehicles', badge: 'Vintage', modalityMap: 'vehicle' },
  { id: 'motorcycle', labelKey: 'motorcycle', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'off_road', labelKey: 'off_road', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'garage_vehicle', labelKey: 'garage_vehicle', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'driveway', labelKey: 'driveway', category: 'vehicles', modalityMap: 'vehicle' },
  { id: 'parking_lot', labelKey: 'parking_lot', category: 'vehicles', modalityMap: 'vehicle' },

  // --- ENVIRONMENTS ---
  { id: 'scene', labelKey: 'scene', category: 'environments', badge: 'General', modalityMap: 'scene' },
  { id: 'interior', labelKey: 'interior', category: 'environments', modalityMap: 'interior' },
  { id: 'exterior', labelKey: 'exterior', category: 'environments', modalityMap: 'scene' },
  { id: 'home_interior', labelKey: 'home_interior', category: 'environments', modalityMap: 'interior' },
  { id: 'living_room', labelKey: 'living_room', category: 'environments', modalityMap: 'interior' },
  { id: 'bedroom', labelKey: 'bedroom', category: 'environments', modalityMap: 'interior' },
  { id: 'kitchen', labelKey: 'kitchen', category: 'environments', modalityMap: 'interior' },
  { id: 'office', labelKey: 'office', category: 'environments', modalityMap: 'interior' },
  { id: 'garage_env', labelKey: 'garage_env', category: 'environments', modalityMap: 'interior' },
  { id: 'balcony_env', labelKey: 'balcony_env', category: 'environments', modalityMap: 'scene' },
  { id: 'rooftop', labelKey: 'rooftop', category: 'environments', modalityMap: 'scene' },
  { id: 'restaurant', labelKey: 'restaurant', category: 'environments', modalityMap: 'interior' },
  { id: 'cafe', labelKey: 'cafe', category: 'environments', modalityMap: 'interior' },
  { id: 'hotel', labelKey: 'hotel', category: 'environments', modalityMap: 'interior' },
  { id: 'airport', labelKey: 'airport', category: 'environments', modalityMap: 'interior' },
  { id: 'hangar', labelKey: 'hangar', category: 'environments', modalityMap: 'interior' },
  { id: 'street', labelKey: 'street', category: 'environments', modalityMap: 'scene' },
  { id: 'residential_street', labelKey: 'residential_street', category: 'environments', modalityMap: 'scene' },
  { id: 'city_night', labelKey: 'city_night', category: 'environments', badge: 'Night Flash', modalityMap: 'scene' },
  { id: 'rural', labelKey: 'rural', category: 'environments', modalityMap: 'scene' },
  { id: 'ranch', labelKey: 'ranch', category: 'environments', modalityMap: 'scene' },
  { id: 'beach', labelKey: 'beach', category: 'environments', modalityMap: 'scene' },
  { id: 'marina', labelKey: 'marina', category: 'environments', modalityMap: 'scene' },
  { id: 'golf_course', labelKey: 'golf_course', category: 'environments', modalityMap: 'scene' },
  { id: 'sports_location', labelKey: 'sports_location', category: 'environments', modalityMap: 'scene' },

  // --- ARCHITECTURE / REAL ESTATE ---
  { id: 'architecture', labelKey: 'architecture', category: 'architecture', badge: 'General', modalityMap: 'architecture' },
  { id: 'real_estate', labelKey: 'real_estate', category: 'architecture', modalityMap: 'architecture' },
  { id: 'house_exterior', labelKey: 'house_exterior', category: 'architecture', modalityMap: 'architecture' },
  { id: 'house_interior', labelKey: 'house_interior', category: 'architecture', modalityMap: 'architecture' },
  { id: 'apartment', labelKey: 'apartment', category: 'architecture', modalityMap: 'architecture' },
  { id: 'luxury_home', labelKey: 'luxury_home', category: 'architecture', badge: 'High End', modalityMap: 'architecture' },
  { id: 'ordinary_home', labelKey: 'ordinary_home', category: 'architecture', modalityMap: 'architecture' },
  { id: 'room_arch', labelKey: 'room_arch', category: 'architecture', modalityMap: 'architecture' },
  { id: 'lobby', labelKey: 'lobby', category: 'architecture', modalityMap: 'architecture' },
  { id: 'pool_area', labelKey: 'pool_area', category: 'architecture', modalityMap: 'architecture' },
  { id: 'garden', labelKey: 'garden', category: 'architecture', modalityMap: 'architecture' },
  { id: 'commercial_interior', labelKey: 'commercial_interior', category: 'architecture', modalityMap: 'architecture' },
  { id: 'building_exterior', labelKey: 'building_exterior', category: 'architecture', modalityMap: 'architecture' },

  // --- PRODUCT ---
  { id: 'product', labelKey: 'product', category: 'product', badge: 'General', modalityMap: 'product' },
  { id: 'product_close_up', labelKey: 'product_close_up', category: 'product', modalityMap: 'product' },
  { id: 'product_in_use', labelKey: 'product_in_use', category: 'product', modalityMap: 'product' },
  { id: 'product_on_table', labelKey: 'product_on_table', category: 'product', modalityMap: 'product' },
  { id: 'packaging', labelKey: 'packaging', category: 'product', modalityMap: 'product' },
  { id: 'watch', labelKey: 'watch', category: 'product', modalityMap: 'product' },
  { id: 'jewelry', labelKey: 'jewelry', category: 'product', modalityMap: 'product' },
  { id: 'perfume', labelKey: 'perfume', category: 'product', modalityMap: 'product' },
  { id: 'shoes', labelKey: 'shoes', category: 'product', modalityMap: 'product' },
  { id: 'clothing_item', labelKey: 'clothing_item', category: 'product', modalityMap: 'product' },
  { id: 'tech_product', labelKey: 'tech_product', category: 'product', modalityMap: 'product' },
  { id: 'food_product', labelKey: 'food_product', category: 'product', modalityMap: 'product' },
  { id: 'automotive_detail', labelKey: 'automotive_detail', category: 'product', modalityMap: 'product' },

  // --- PROMPT TOOLS ---
  { id: 'edit_existing_prompt', labelKey: 'edit_existing_prompt', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'fix_realism', labelKey: 'fix_realism', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'expand_prompt', labelKey: 'expand_prompt', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'rewrite_prompt', labelKey: 'rewrite_prompt', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'idea_to_prompt', labelKey: 'idea_to_prompt', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'reference_to_prompt', labelKey: 'reference_to_prompt', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'change_only', labelKey: 'change_only', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'diagnose_fake_result', labelKey: 'diagnose_fake_result', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' },
  { id: 'rebuild_scene', labelKey: 'rebuild_scene', category: 'tools', badge: 'Tool', modalityMap: 'edit_prompt' }
];

const RECENT_TYPE_KEY = 'ep_recent_types';
const FAVORITE_TYPE_KEY = 'ep_favorite_types';

export function getRecentTypes(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_TYPE_KEY);
    return raw ? JSON.parse(raw) : ['person', 'object_pov', 'car_exterior'];
  } catch {
    return ['person', 'object_pov'];
  }
}

export function saveRecentType(typeId: string): void {
  try {
    const recents = getRecentTypes().filter(id => id !== typeId);
    recents.unshift(typeId);
    localStorage.setItem(RECENT_TYPE_KEY, JSON.stringify(recents.slice(0, 5)));
  } catch {
    // ignore
  }
}

export function getFavoriteTypes(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITE_TYPE_KEY);
    return raw ? JSON.parse(raw) : ['person', 'object_pov', 'selfie'];
  } catch {
    return ['person'];
  }
}

export function toggleFavoriteType(typeId: string): string[] {
  try {
    const favorites = getFavoriteTypes();
    const updated = favorites.includes(typeId)
      ? favorites.filter(id => id !== typeId)
      : [...favorites, typeId];
    localStorage.setItem(FAVORITE_TYPE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
