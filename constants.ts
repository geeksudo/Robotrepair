
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
  { id: 'm-wheel-l', name: 'Left Front Wheel Motor', category: 'Motor', price: 320 },
  { id: 'm-wheel-r', name: 'Right Front Wheel Motor', category: 'Motor', price: 320 },
  { id: 'm-wheel-rl', name: 'Left Rear Wheel Motor', category: 'Motor', price: 320 },
  { id: 'm-wheel-rr', name: 'Right Rear Wheel Motor', category: 'Motor', price: 320 },
  { id: 'm-cut-l', name: 'Left Cutting Motor', category: 'Motor', price: 280 },
  { id: 'm-cut-r', name: 'Right Cutting Motor', category: 'Motor', price: 280 },
  { id: 'm-cut-c', name: 'Center Cutting Motor', category: 'Motor', price: 340 },
  { id: 'm-lift', name: 'Lifting Motor', category: 'Motor', price: 90 },

  // Electronics
  { id: 'e-mainboard', name: 'Mainboard', category: 'Electronics', price: 430 },
  { id: 'e-drive-board', name: 'Drive Board', category: 'Electronics', price: 490 },
  { id: 'e-keypad', name: 'Keypad Board', category: 'Electronics', price: 230 },
  { id: 'e-height-sensor', name: 'Height Sensor Board', category: 'Electronics', price: 46 },
  { id: 'e-panel-back', name: 'Back Panel', category: 'Electronics', price: 120 },
  { id: 'e-battery', name: 'Battery', category: 'Electronics', price: 600 },

  // Chassis
  { id: 'c-shell-top', name: 'Top Cover', category: 'Chassis', price: 890 },
  { id: 'c-chassis-bottom', name: 'Bottom Chasis', category: 'Chassis', price: 980 },
  { id: 'c-axle-front', name: 'Front Axle', category: 'Chassis', price: 100 },
  { id: 'c-axle-back', name: 'Back Axle', category: 'Chassis', price: 100 },
  { id: 'c-boot-l', name: 'Left Rubber Boot', category: 'Chassis', price: 20 },
  { id: 'c-boot-r', name: 'Right Rubber Boot', category: 'Chassis', price: 20 },
  { id: 'c-sleeve-l', name: 'Left Rubber Sleeve', category: 'Chassis', price: 15 },
  { id: 'c-sleeve-r', name: 'Right Rubber Sleeve', category: 'Chassis', price: 15 },
  { id: 'c-suspension-l', name: 'Left Suspension Rod', category: 'Chassis', price: 10 },
  { id: 'c-suspension-r', name: 'Right Suspension Rod', category: 'Chassis', price: 10 },
  { id: 'c-tire-fl', name: 'Left Front Wheel Tire', category: 'Chassis', price: 80 },
  { id: 'c-tire-fr', name: 'Right Front Wheel Tire', category: 'Chassis', price: 80 },
  { id: 'c-tire-rl', name: 'Left Rear Wheel Tire', category: 'Chassis', price: 132 },
  { id: 'c-tire-rr', name: 'Right Rear Wheel Tire', category: 'Chassis', price: 132 },
  { id: 'c-guard-side-l', name: 'Left Side Guard', category: 'Chassis', price: 18 },
  { id: 'c-guard-side-r', name: 'Right Side Guard', category: 'Chassis', price: 18 },

  // Cutting
  { id: 'cut-disk', name: 'Left Cutting Disk', category: 'Cutting', price: 38 },
  { id: 'cut-disk-r', name: 'Right Cutting Disk', category: 'Cutting', price: 38 },
  { id: 'cut-disk-c', name: 'Center Cutting Disk', category: 'Cutting', price: 36 },
  { id: 'cut-guard-l', name: 'Left Cutting Guard', category: 'Cutting', price: 40 },
  { id: 'cut-guard-r', name: 'Right Cutting Guard', category: 'Cutting', price: 40 },
  { id: 'cut-bracket', name: 'Cutting Disk Mounting Bracket', category: 'Cutting', price: 12 },

  // Accessories
  { id: 'a-rtk-station', name: 'RTK Reference Station', category: 'Accessories', price: 688 },
  { id: 'a-charge-station', name: 'Charging Station', category: 'Accessories', price: 650 },
  { id: 'a-power-adapte', name: 'Power Supply Unit', category: 'Accessories', price: 680 },
  { id: 'a-vision-3d', name: '3D Vision Module', category: 'Accessories', price: 639 },
  { id: 'a-bumper', name: 'Bumper', category: 'Accessories', price: 138 },
];
