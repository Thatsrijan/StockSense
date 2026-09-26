export type UserRole = 'inventory_manager' | 'warehouse_staff';

export interface User {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  warehouseId?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
}

export type LocationType = 'internal' | 'vendor' | 'customer' | 'inventory_loss';

export interface Location {
  id: string;
  name: string;
  shortCode: string;
  warehouseId?: string;
  warehouseName?: string;
  type: LocationType;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string; // Unit of Measure (Units, kg, m, boxes, etc.)
  cost: number;
  price: number;
  minStockThreshold: number;
  reorderQty: number;
  description?: string;
}

export interface StockQuant {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
}

export type MovementType = 'receipt' | 'delivery' | 'internal' | 'adjustment';
export type MovementStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export interface MoveHistory {
  id: string;
  date: string;
  reference: string;
  productId: string;
  productName: string;
  productSku: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  uom: string;
  status: 'done';
  user: string;
  notes?: string;
  type: MovementType;
}

export interface ReceiptLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  demandQty: number;
  doneQty: number;
  uom: string;
}

export interface Receipt {
  id: string;
  reference: string;
  supplierName: string;
  destinationLocationId: string;
  scheduledDate: string;
  responsible: string;
  sourceDocument?: string;
  status: 'draft' | 'ready' | 'done' | 'canceled';
  lines: ReceiptLine[];
  createdAt: string;
  validatedAt?: string;
  notes?: string;
}

export interface DeliveryLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  demandQty: number;
  reservedQty: number;
  doneQty: number;
  uom: string;
}

export interface DeliveryOrder {
  id: string;
  reference: string;
  customerName: string;
  sourceLocationId: string;
  scheduledDate: string;
  responsible: string;
  sourceDocument?: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  lines: DeliveryLine[];
  createdAt: string;
  validatedAt?: string;
  notes?: string;
}

export interface TransferLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  uom: string;
}

export interface InternalTransfer {
  id: string;
  reference: string;
  sourceLocationId: string;
  destinationLocationId: string;
  scheduledDate: string;
  responsible: string;
  sourceDocument?: string;
  status: 'draft' | 'ready' | 'done' | 'canceled';
  lines: TransferLine[];
  createdAt: string;
  validatedAt?: string;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  productSku: string;
  locationId: string;
  locationName: string;
  recordedQty: number;
  countedQty: number;
  differenceQty: number;
  uom: string;
  reason: string;
  status: 'applied';
  date: string;
  responsible: string;
}
