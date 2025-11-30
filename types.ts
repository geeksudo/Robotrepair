export enum ProductModel {
  Luba1 = 'Luba 1',
  Luba2 = 'Luba 2',
  Luba2X = 'Luba 2X',
  Yuka = 'Yuka',
  LubaMini = 'Luba Mini',
  YukaMini = 'Yuka Mini'
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Part {
  id: string;
  name: string;
  category: 'Motor' | 'Electronics' | 'Chassis' | 'Cutting' | 'Accessories' | string;
}

export type RepairActionType = 'replaced' | 'repaired';

export interface PartAction {
  partId: string;
  action: RepairActionType;
}

export interface User {
  email: string;
  password: string; // In a real app, this would be hashed
  isAdmin: boolean;
}

export interface RepairRecord {
  id: string;
  rmaNumber: string;
  entryDate: string;
  customer: Customer;
  productModel: ProductModel;
  productArea: string; // e.g. 1000, 3000, 5000
  productName?: string; // Replaces serialNumber, e.g. "Luba-A1B2"
  partsActions: PartAction[]; 
  technicianNotes: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Shipped';
  aiReport?: string;
  aiSms?: string;
  technician?: string; // Derived from user email (e.g., "Sang" from sang@...)
}

export type ViewState = 'dashboard' | 'new-repair' | 'view-report' | 'manage-parts' | 'user-management';