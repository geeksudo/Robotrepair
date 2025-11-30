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
  { id: 'm-wheel-l', name: 'Wheel Motor (Left)', category: 'Motor', price: 180 },
  { id: 'm-wheel-r', name: 'Wheel Motor (Right)', category: 'Motor', price: 180 },
  { id: 'm-blade', name: 'Blade Motor', category: 'Motor', price: 120 },
  { id: 'm-axle', name: 'Front Axle Assembly', category: 'Motor', price: 250 },
  
  // Electronics
  { id: 'e-mainboard', name: 'Mainboard PCB', category: 'Electronics', price: 350 },
  { id: 'e-vision', name: '3D Vision Module', category: 'Electronics', price: 200 },
  { id: 'e-rtk-mod', name: 'RTK Module (Internal)', category: 'Electronics', price: 150 },
  { id: 'e-battery', name: 'Battery Pack', category: 'Electronics', price: 220 },
  { id: 'e-im', name: 'IMU Sensor', category: 'Electronics', price: 80 },

  // Chassis / Body
  { id: 'c-bumper', name: 'Front Bumper', category: 'Chassis', price: 60 },
  { id: 'c-shell-top', name: 'Top Shell', category: 'Chassis', price: 110 },
  { id: 'c-waterproof', name: 'Waterproof Seal Kit', category: 'Chassis', price: 30 },
  { id: 'c-wheel-tire', name: 'Omni-Wheel Tire', category: 'Chassis', price: 45 },

  // Cutting System
  { id: 'cut-disk', name: 'Cutting Disk', category: 'Cutting', price: 40 },
  { id: 'cut-guard', name: 'Blade Guard', category: 'Cutting', price: 25 },
  
  // Accessories / External
  { id: 'a-rtk-station', name: 'RTK Reference Station', category: 'Accessories', price: 299 },
  { id: 'a-charge-station', name: 'Charging Station', category: 'Accessories', price: 199 },
  { id: 'a-power-adapter', name: 'Power Adapter', category: 'Accessories', price: 89 },
];