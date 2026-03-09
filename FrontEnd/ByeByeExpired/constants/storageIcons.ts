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
  | 'pantry'
  | 'pantry'
  | 'freezer1'
  | 'freezer2'
  | 'shelf'
  | 'fridge1'
  | 'can';

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
    color: '#56bfec',
  },
  cabinet: {
    id: 'cabinet',
    label: 'Cabinet',
    image: require('../assets/images/can.png'),
    ionicon: 'file-tray-outline',
    color: '#56bfec',
  },
  fridge: {
    id: 'fridge',
    label: 'Fridge',
    image: require('../assets/images/fridge.png'),
    ionicon: 'thermometer-outline',
    color: '#56bfec',
  },
  cooler: {
    id: 'cooler',
    label: 'Cooler',
    image: require('../assets/images/ICEEE1.png'),
    ionicon: 'ice-cream-outline',
    color: '#56bfec',
  },
  pantry: {
    id: 'pantry',
    label: 'Pantry',
    image: require('../assets/images/shelf.png'),
    ionicon: 'fast-food-outline',
    color: '#56bfec',
  },
  freezer1: {
    id: 'freezer1',
    label: 'Freezer1',
    image: require('../assets/images/snow1.png'),
    ionicon: 'snow-outline',
    color: '#56bfec',
  },
  freezer2: {
    id: 'freezer2',
    label: 'Freezer2',
    image: require('../assets/images/snow2.webp'),
    ionicon: 'snow-outline',
    color: '#56bfec',
  },
  shelf: {
    id: 'shelf',
    label: 'Shelf',
    image: require('../assets/images/shel2.png'),
    ionicon: 'file-tray-outline',
    color: '#56bfec',
  },
  fridge1: {
    id: 'fridge1',
    label: 'Fridge1',
    image: require('../assets/images/fridge1.png'),
    ionicon: 'thermometer-outline',
    color: '#56bfec',
  },
  can: {
    id: 'can',
    label: 'Can',
    image: require('../assets/images/can1.png'),
    ionicon: 'fast-food-outline',
    color: '#56bfec',
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