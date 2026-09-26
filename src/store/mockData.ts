import { 
  Warehouse, 
  Location, 
  Product, 
  StockQuant, 
  Receipt, 
  DeliveryOrder, 
  InternalTransfer, 
  StockAdjustment, 
  MoveHistory, 
  User 
} from '../types/inventory';

export const INITIAL_USER: User = {
  id: 'usr-1',
  loginId: 'admin_manager',
  email: 'manager@stocksense.io',
  name: 'Alex Rivera',
  role: 'inventory_manager',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  warehouseId: 'wh-main'
};

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-main',
    name: 'Main Distribution Center',
    shortCode: 'WH',
    address: '104 Logistics Parkway, Industrial Zone A, Central City'
  },
  {
    id: 'wh-depot',
    name: 'Harbor Secondary Depot',
    shortCode: 'DEPOT',
    address: '55 Harbor Boulevard, Dock 4, Port District'
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-wh-stock',
    name: 'WH/Stock (Main Storage)',
    shortCode: 'WH/STOCK',
    warehouseId: 'wh-main',
    warehouseName: 'Main Distribution Center',
    type: 'internal'
  },
  {
    id: 'loc-wh-prod',
    name: 'WH/Production Floor',
    shortCode: 'WH/PROD',
    warehouseId: 'wh-main',
    warehouseName: 'Main Distribution Center',
    type: 'internal'
  },
  {
    id: 'loc-wh-rack-a',
    name: 'WH/Rack A (Heavy Goods)',
    shortCode: 'WH/RACK-A',
    warehouseId: 'wh-main',
    warehouseName: 'Main Distribution Center',
    type: 'internal'
  },
  {
    id: 'loc-wh-rack-b',
    name: 'WH/Rack B (Electronics & Fasteners)',
    shortCode: 'WH/RACK-B',
    warehouseId: 'wh-main',
    warehouseName: 'Main Distribution Center',
    type: 'internal'
  },
  {
    id: 'loc-wh-pack',
    name: 'WH/Packing & Dispatch',
    shortCode: 'WH/PACK',
    warehouseId: 'wh-main',
    warehouseName: 'Main Distribution Center',
    type: 'internal'
  },
  {
    id: 'loc-depot-stock',
    name: 'DEPOT/Stock (Harbor Depot)',
    shortCode: 'DEPOT/STOCK',
    warehouseId: 'wh-depot',
    warehouseName: 'Harbor Secondary Depot',
    type: 'internal'
  },
  {
    id: 'loc-vendor',
    name: 'Partners/Vendors',
    shortCode: 'VENDOR',
    type: 'vendor'
  },
  {
    id: 'loc-customer',
    name: 'Partners/Customers',
    shortCode: 'CUSTOMER',
    type: 'customer'
  },
  {
    id: 'loc-scrap',
    name: 'Virtual/Scrap & Loss',
    shortCode: 'SCRAP',
    type: 'inventory_loss'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-steel-rods',
    name: 'Steel Rods (High-Tensile 12mm)',
    sku: 'STL-ROD-01',
    category: 'Raw Materials',
    uom: 'Units',
    cost: 45.00,
    price: 75.00,
    minStockThreshold: 30,
    reorderQty: 50,
    description: 'Hot-rolled high-tensile structural steel rods'
  },
  {
    id: 'prod-steel-raw',
    name: 'Raw Alloy Steel Ingots',
    sku: 'STL-RAW-KG',
    category: 'Raw Materials',
    uom: 'kg',
    cost: 12.50,
    price: 22.00,
    minStockThreshold: 100,
    reorderQty: 200,
    description: 'Grade A industrial casting steel alloy'
  },
  {
    id: 'prod-ergo-chair',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-01',
    category: 'Finished Goods',
    uom: 'Units',
    cost: 110.00,
    price: 199.00,
    minStockThreshold: 15,
    reorderQty: 25,
    description: 'Adjustable lumbar support ergonomic mesh chair'
  },
  {
    id: 'prod-wooden-desk',
    name: 'Solid Oak Executive Desk',
    sku: 'FUR-DSK-02',
    category: 'Finished Goods',
    uom: 'Units',
    cost: 180.00,
    price: 340.00,
    minStockThreshold: 10,
    reorderQty: 15,
    description: 'Premium natural finish hardwood office desk'
  },
  {
    id: 'prod-alum-sheet',
    name: 'Aluminum Sheets 2mm (4x8 ft)',
    sku: 'MET-ALU-02',
    category: 'Raw Materials',
    uom: 'Sheets',
    cost: 35.00,
    price: 65.00,
    minStockThreshold: 20,
    reorderQty: 40,
    description: 'Anodized 6061-T6 aluminum sheet metal'
  },
  {
    id: 'prod-screws-m6',
    name: 'Industrial M6 Hex Screws (Box 500)',
    sku: 'FST-SCR-M6',
    category: 'Hardware',
    uom: 'Boxes',
    cost: 8.50,
    price: 16.00,
    minStockThreshold: 30,
    reorderQty: 60,
    description: 'Stainless steel 316 corrosion-resistant hex cap bolts'
  },
  {
    id: 'prod-ball-bearing',
    name: 'Precision Deep Groove Ball Bearings',
    sku: 'MEC-BRG-10',
    category: 'Hardware',
    uom: 'Units',
    cost: 14.00,
    price: 28.00,
    minStockThreshold: 40,
    reorderQty: 80,
    description: 'Double-shielded high-speed ceramic-hybrid ball bearings'
  },
  {
    id: 'prod-safety-helmet',
    name: 'OSHA Certified Industrial Hard Hat',
    sku: 'SAF-HLM-PRO',
    category: 'Safety Equipment',
    uom: 'Units',
    cost: 18.00,
    price: 35.00,
    minStockThreshold: 12,
    reorderQty: 24,
    description: 'Vented ratchet suspension impact resistant safety helmet'
  }
];

export const INITIAL_STOCK_QUANTS: StockQuant[] = [
  // Steel Rods (Total: 65 units -> 50 in WH/Stock, 15 in WH/Prod)
  {
    id: 'sq-1',
    productId: 'prod-steel-rods',
    locationId: 'loc-wh-stock',
    quantity: 50,
    reservedQuantity: 0
  },
  {
    id: 'sq-2',
    productId: 'prod-steel-rods',
    locationId: 'loc-wh-prod',
    quantity: 15,
    reservedQuantity: 0
  },
  // Raw Steel (Total: 120 kg -> 80 in WH/Stock, 40 in WH/Prod)
  {
    id: 'sq-3',
    productId: 'prod-steel-raw',
    locationId: 'loc-wh-stock',
    quantity: 80,
    reservedQuantity: 0
  },
  {
    id: 'sq-4',
    productId: 'prod-steel-raw',
    locationId: 'loc-wh-prod',
    quantity: 40,
    reservedQuantity: 0
  },
  // Ergonomic Chair (Total: 25 units -> 10 reserved for pending delivery order!)
  {
    id: 'sq-5',
    productId: 'prod-ergo-chair',
    locationId: 'loc-wh-stock',
    quantity: 25,
    reservedQuantity: 10
  },
  // Wooden Desk (Total: 6 units -> Low stock alert! threshold is 10)
  {
    id: 'sq-6',
    productId: 'prod-wooden-desk',
    locationId: 'loc-wh-stock',
    quantity: 6,
    reservedQuantity: 0
  },
  // Aluminum Sheet (Total: 14 sheets -> Low stock alert! threshold is 20)
  {
    id: 'sq-7',
    productId: 'prod-alum-sheet',
    locationId: 'loc-wh-stock',
    quantity: 14,
    reservedQuantity: 0
  },
  // Screws (Total: 85 boxes in WH/Stock)
  {
    id: 'sq-8',
    productId: 'prod-screws-m6',
    locationId: 'loc-wh-stock',
    quantity: 85,
    reservedQuantity: 0
  },
  // Ball Bearings (Total: 70 units in WH/Rack-A)
  {
    id: 'sq-9',
    productId: 'prod-ball-bearing',
    locationId: 'loc-wh-rack-a',
    quantity: 70,
    reservedQuantity: 0
  },
  // Safety Helmets (Total: 28 units in WH/Stock)
  {
    id: 'sq-10',
    productId: 'prod-safety-helmet',
    locationId: 'loc-wh-stock',
    quantity: 28,
    reservedQuantity: 0
  }
];

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rcpt-1',
    reference: 'WH/IN/00001',
    supplierName: 'Apex Steel Industries Ltd',
    destinationLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-24',
    responsible: 'Alex Rivera',
    sourceDocument: 'PO-2026-0901',
    status: 'done',
    createdAt: '2026-09-23T09:30:00Z',
    validatedAt: '2026-09-24T14:15:00Z',
    notes: 'Arrived in good condition. Quality batch certificate verified.',
    lines: [
      {
        id: 'rl-1',
        productId: 'prod-steel-rods',
        productName: 'Steel Rods (High-Tensile 12mm)',
        productSku: 'STL-ROD-01',
        demandQty: 50,
        doneQty: 50,
        uom: 'Units'
      }
    ]
  },
  {
    id: 'rcpt-2',
    reference: 'WH/IN/00002',
    supplierName: 'Nordic Woodcraft Corp',
    destinationLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-27',
    responsible: 'Alex Rivera',
    sourceDocument: 'PO-2026-0914',
    status: 'ready',
    createdAt: '2026-09-25T11:00:00Z',
    notes: 'Urgent restocking for seasonal enterprise sales.',
    lines: [
      {
        id: 'rl-2',
        productId: 'prod-wooden-desk',
        productName: 'Solid Oak Executive Desk',
        productSku: 'FUR-DSK-02',
        demandQty: 15,
        doneQty: 0,
        uom: 'Units'
      },
      {
        id: 'rl-3',
        productId: 'prod-ergo-chair',
        productName: 'Ergonomic Mesh Office Chair',
        productSku: 'FUR-CHR-01',
        demandQty: 20,
        doneQty: 0,
        uom: 'Units'
      }
    ]
  },
  {
    id: 'rcpt-3',
    reference: 'WH/IN/00003',
    supplierName: 'Global Metallurgy Co',
    destinationLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-29',
    responsible: 'Sam Wilson',
    sourceDocument: 'PO-2026-0922',
    status: 'draft',
    createdAt: '2026-09-26T08:00:00Z',
    notes: 'Awaiting shipping confirmation from carrier.',
    lines: [
      {
        id: 'rl-4',
        productId: 'prod-steel-raw',
        productName: 'Raw Alloy Steel Ingots',
        productSku: 'STL-RAW-KG',
        demandQty: 200,
        doneQty: 0,
        uom: 'kg'
      }
    ]
  }
];

export const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'del-1',
    reference: 'WH/OUT/00001',
    customerName: 'Metro Technology Hub',
    sourceLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-23',
    responsible: 'Alex Rivera',
    sourceDocument: 'SO-2026-0108',
    status: 'done',
    createdAt: '2026-09-22T10:00:00Z',
    validatedAt: '2026-09-23T16:20:00Z',
    notes: 'Dispatched via Express Freight. Tracking #EX-99214.',
    lines: [
      {
        id: 'dl-1',
        productId: 'prod-ergo-chair',
        productName: 'Ergonomic Mesh Office Chair',
        productSku: 'FUR-CHR-01',
        demandQty: 10,
        reservedQty: 10,
        doneQty: 10,
        uom: 'Units'
      }
    ]
  },
  {
    id: 'del-2',
    reference: 'WH/OUT/00002',
    customerName: 'Horizon Architectural Works',
    sourceLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-26',
    responsible: 'Sam Wilson',
    sourceDocument: 'SO-2026-0115',
    status: 'ready',
    createdAt: '2026-09-25T14:30:00Z',
    notes: 'Reserved and staged at Packing Bay 2.',
    lines: [
      {
        id: 'dl-2',
        productId: 'prod-ergo-chair',
        productName: 'Ergonomic Mesh Office Chair',
        productSku: 'FUR-CHR-01',
        demandQty: 10,
        reservedQty: 10,
        doneQty: 10,
        uom: 'Units'
      }
    ]
  },
  {
    id: 'del-3',
    reference: 'WH/OUT/00003',
    customerName: 'Skyline Buildtech & Co',
    sourceLocationId: 'loc-wh-stock',
    scheduledDate: '2026-09-28',
    responsible: 'Alex Rivera',
    sourceDocument: 'SO-2026-0129',
    status: 'waiting',
    createdAt: '2026-09-26T09:10:00Z',
    notes: 'Waiting for stock: requires 20 Aluminum Sheets, currently 14 available.',
    lines: [
      {
        id: 'dl-3',
        productId: 'prod-alum-sheet',
        productName: 'Aluminum Sheets 2mm (4x8 ft)',
        productSku: 'MET-ALU-02',
        demandQty: 20,
        reservedQty: 14,
        doneQty: 0,
        uom: 'Sheets'
      }
    ]
  }
];

export const INITIAL_TRANSFERS: InternalTransfer[] = [
  {
    id: 'trf-1',
    reference: 'WH/INT/00001',
    sourceLocationId: 'loc-wh-stock',
    destinationLocationId: 'loc-wh-prod',
    scheduledDate: '2026-09-24',
    responsible: 'Sam Wilson',
    sourceDocument: 'MO-2026-0045',
    status: 'done',
    createdAt: '2026-09-24T08:00:00Z',
    validatedAt: '2026-09-24T11:45:00Z',
    notes: 'Moved for CNC machining frame production.',
    lines: [
      {
        id: 'tl-1',
        productId: 'prod-steel-rods',
        productName: 'Steel Rods (High-Tensile 12mm)',
        productSku: 'STL-ROD-01',
        quantity: 15,
        uom: 'Units'
      }
    ]
  },
  {
    id: 'trf-2',
    reference: 'WH/INT/00002',
    sourceLocationId: 'loc-wh-stock',
    destinationLocationId: 'loc-wh-rack-a',
    scheduledDate: '2026-09-27',
    responsible: 'Alex Rivera',
    sourceDocument: 'LOC-REORG-03',
    status: 'ready',
    createdAt: '2026-09-26T07:30:00Z',
    notes: 'Reorganizing heavy bearings into Rack A bin 12.',
    lines: [
      {
        id: 'tl-2',
        productId: 'prod-ball-bearing',
        productName: 'Precision Deep Groove Ball Bearings',
        productSku: 'MEC-BRG-10',
        quantity: 25,
        uom: 'Units'
      }
    ]
  }
];

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-1',
    reference: 'INV/ADJ/00001',
    productId: 'prod-steel-raw',
    productName: 'Raw Alloy Steel Ingots',
    productSku: 'STL-RAW-KG',
    locationId: 'loc-wh-stock',
    locationName: 'WH/Stock (Main Storage)',
    recordedQty: 83,
    countedQty: 80,
    differenceQty: -3,
    uom: 'kg',
    reason: '3 kg damaged during pallet loading (oxidized & discarded)',
    status: 'applied',
    date: '2026-09-25T15:30:00Z',
    responsible: 'Alex Rivera'
  }
];

export const INITIAL_MOVE_HISTORY: MoveHistory[] = [
  {
    id: 'mv-1',
    date: '2026-09-24 14:15',
    reference: 'WH/IN/00001',
    productId: 'prod-steel-rods',
    productName: 'Steel Rods (High-Tensile 12mm)',
    productSku: 'STL-ROD-01',
    fromLocationId: 'loc-vendor',
    fromLocationName: 'Vendors (Apex Steel)',
    toLocationId: 'loc-wh-stock',
    toLocationName: 'WH/Stock (Main Storage)',
    quantity: 50,
    uom: 'Units',
    status: 'done',
    user: 'Alex Rivera',
    notes: 'Received PO-2026-0901',
    type: 'receipt'
  },
  {
    id: 'mv-2',
    date: '2026-09-24 11:45',
    reference: 'WH/INT/00001',
    productId: 'prod-steel-rods',
    productName: 'Steel Rods (High-Tensile 12mm)',
    productSku: 'STL-ROD-01',
    fromLocationId: 'loc-wh-stock',
    fromLocationName: 'WH/Stock (Main Storage)',
    toLocationId: 'loc-wh-prod',
    toLocationName: 'WH/Production Floor',
    quantity: 15,
    uom: 'Units',
    status: 'done',
    user: 'Sam Wilson',
    notes: 'Moved for production run #45',
    type: 'internal'
  },
  {
    id: 'mv-3',
    date: '2026-09-23 16:20',
    reference: 'WH/OUT/00001',
    productId: 'prod-ergo-chair',
    productName: 'Ergonomic Mesh Office Chair',
    productSku: 'FUR-CHR-01',
    fromLocationId: 'loc-wh-stock',
    fromLocationName: 'WH/Stock (Main Storage)',
    toLocationId: 'loc-customer',
    toLocationName: 'Customers (Metro Tech)',
    quantity: 10,
    uom: 'Units',
    status: 'done',
    user: 'Alex Rivera',
    notes: 'Shipped order SO-2026-0108',
    type: 'delivery'
  },
  {
    id: 'mv-4',
    date: '2026-09-25 15:30',
    reference: 'INV/ADJ/00001',
    productId: 'prod-steel-raw',
    productName: 'Raw Alloy Steel Ingots',
    productSku: 'STL-RAW-KG',
    fromLocationId: 'loc-wh-stock',
    fromLocationName: 'WH/Stock (Main Storage)',
    toLocationId: 'loc-scrap',
    toLocationName: 'Virtual/Scrap & Loss',
    quantity: -3,
    uom: 'kg',
    status: 'done',
    user: 'Alex Rivera',
    notes: 'Physical count adjustment: 3 kg damaged',
    type: 'adjustment'
  }
];
