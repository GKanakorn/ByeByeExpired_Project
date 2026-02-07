import { ImageSourcePropType } from 'react-native';

/**
 * 🔑 icon key ที่อนุญาตให้ใช้ในระบบ
 * DB ควรเก็บค่าเหล่านี้เท่านั้น
 */
export type StorageIconKey =
  | 'freezer'
  | 'cabinet'
  | 'fridge'
  | 'cooler'
  | 'pantry';

/**
 * ข้อมูล icon เต็มรูปแบบ
 */
export interface StorageIconConfig {
  id: StorageIconKey;
  label: string;
  image: ImageSourcePropType;
  ionicon: string;
  color: string;
}

/**
 * 🧠 MASTER CONFIG
 */
export const STORAGE_ICON_CONFIG: Record<StorageIconKey, StorageIconConfig> = {
  freezer: {
    id: 'freezer',
    label: 'Freezer',
    image: require('../assets/images/Freezer.png'),
    ionicon: 'snow-outline',
    color: '#38BDF8',
  },
  cabinet: {
    id: 'cabinet',
    label: 'Cabinet',
    image: require('../assets/images/can.png'),
    ionicon: 'file-tray-outline',
    color: '#F59E0B',
  },
  fridge: {
    id: 'fridge',
    label: 'Fridge',
    image: require('../assets/images/fridge.png'),
    ionicon: 'thermometer-outline',
    color: '#3B82F6',
  },
  cooler: {
    id: 'cooler',
    label: 'Cooler',
    image: require('../assets/images/ICEEE1.png'),
    ionicon: 'ice-cream-outline',
    color: '#06B6D4',
  },
  pantry: {
    id: 'pantry',
    label: 'Pantry',
    image: require('../assets/images/shelf.png'),
    ionicon: 'fast-food-outline',
    color: '#22C55E',
  },
};

/**
 * ❌ fallback (กันข้อมูลพัง)
 */
export const DEFAULT_STORAGE_ICON = {
  image: require('../assets/images/default.png'),
  ionicon: 'archive-outline',
  color: '#9CA3AF',
};