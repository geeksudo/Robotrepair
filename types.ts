
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
  address?: string; // New field
}

export interface Part {
  id: string;
  name: string;
  category: 'Motor' | 'Electronics' | 'Chassis' | 'Cutting' | 'Accessories' | string;
  price: number;
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

export interface RepairChecklist {
  preliminaryCheck: boolean;      // 初步清洁与检查
  mapBackup: boolean;             // 备份地图
  disassemblyRepair: boolean;     // 拆机修理
  postRepairTest: boolean;        // 修后测试
  mapRestore: boolean;            // 恢复地图并解绑
  waitingForCustomer: boolean;    // 等待客户回复
  waitingForParts: boolean;       // 等待零配件
  waitingForPartsNotes?: string;  // New field: specify parts
  waitingForFullReplacementApproval: boolean; // New status flag
}

export interface IntakeInspection {
  shippingMethod: 'Drop Off' | 'Freight';
  boxType: 'Original' | 'Custom' | 'Pallet'; // Removed 'Other'
  accessories: {
    cuttingDisks: boolean;
    cuttingBlades: boolean;
    securityKey: boolean;
    camera: boolean;
    bumper: boolean;
    psu: boolean;
    chargingDock: boolean;
    chargingCable: boolean; // Label: Charging Extension Cable
    rtk: boolean;
    rtkPsu: boolean;
    other: boolean; // New checkbox for 'Other'
  };
  accessoriesOther?: string; // Custom text for 'Other' accessory
}

export interface RepairRecord {
  id: string;
  rmaNumber: string;
  ticketNumber?: string; // New field
  arrivalDate?: string;  // New field
  entryDate: string;     // Renamed in UI to "Starting Date"
  customer: Customer;
  productModel: ProductModel;
  productArea: string; // e.g. 1000, 3000, 5000
  productName?: string; // Replaces serialNumber, e.g. "Luba-A1B2"
  faultDescription?: string; // New field
  partsActions: PartAction[]; 
  technicianNotes: string;
  checklist?: RepairChecklist; // New field for technician tasks
  intake?: IntakeInspection; // New field for package contents
  status: 'Pending' | 'Quoted' | 'Quote Approved' | 'In Progress' | 'Completed' | 'Shipped';
  laborCost?: number;
  aiReport?: string;
  aiSms?: string;
  aiQuote?: string;
  technician?: string; // Derived from user email (e.g., "Sang" from sang@...)
}

export type ViewState = 'dashboard' | 'new-repair' | 'view-report' | 'manage-parts' | 'user-management';
