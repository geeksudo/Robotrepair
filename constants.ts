import { Part, ProductModel } from './types';

export const PRODUCT_MODELS: ProductModel[] = [
  ProductModel.Luba1,
  ProductModel.Luba2,
  ProductModel.Luba2X,
  ProductModel.Yuka,
  ProductModel.LubaMini,
  ProductModel.YukaMini
];

export const PRODUCT_AREAS: string[] = [
  '1000',
  '3000',
  '5000',
  '10000',
  'Standard',
  'Pro'
];

export const DEFAULT_SPARE_PARTS: Part[] = [
  // Motors
  { id: 'm-wheel-l', name: 'Wheel Motor (Left)', category: 'Motor' },
  { id: 'm-wheel-r', name: 'Wheel Motor (Right)', category: 'Motor' },
  { id: 'm-blade', name: 'Blade Motor', category: 'Motor' },
  { id: 'm-axle', name: 'Front Axle Assembly', category: 'Motor' },
  
  // Electronics
  { id: 'e-mainboard', name: 'Mainboard PCB', category: 'Electronics' },
  { id: 'e-vision', name: '3D Vision Module', category: 'Electronics' },
  { id: 'e-rtk-mod', name: 'RTK Module (Internal)', category: 'Electronics' },
  { id: 'e-battery', name: 'Battery Pack', category: 'Electronics' },
  { id: 'e-im', name: 'IMU Sensor', category: 'Electronics' },

  // Chassis / Body
  { id: 'c-bumper', name: 'Front Bumper', category: 'Chassis' },
  { id: 'c-shell-top', name: 'Top Shell', category: 'Chassis' },
  { id: 'c-waterproof', name: 'Waterproof Seal Kit', category: 'Chassis' },
  { id: 'c-wheel-tire', name: 'Omni-Wheel Tire', category: 'Chassis' },

  // Cutting System
  { id: 'cut-disk', name: 'Cutting Disk', category: 'Cutting' },
  { id: 'cut-guard', name: 'Blade Guard', category: 'Cutting' },
  
  // Accessories / External
  { id: 'a-rtk-station', name: 'RTK Reference Station', category: 'Accessories' },
  { id: 'a-charge-station', name: 'Charging Station', category: 'Accessories' },
  { id: 'a-power-adapter', name: 'Power Adapter', category: 'Accessories' },
];