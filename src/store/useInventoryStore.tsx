import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  Location,
  StockQuant,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  StockAdjustment,
  MoveHistory,
  User,
  UserRole,
} from '../types/inventory';
import {
  INITIAL_USER,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_QUANTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVE_HISTORY,
} from './mockData';

interface RegisteredAccount {
  loginId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}

interface InventoryStoreContextType {
  // Auth
  currentUser: User | null;
  login: (loginIdOrEmail: string, password: string) => { success: boolean; error?: string };
  signup: (loginId: string, email: string, password: string, name?: string, role?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  resetPassword: (identifier: string, newPassword: string) => { success: boolean; error?: string };

  // Data
  warehouses: Warehouse[];
  locations: Location[];
  products: Product[];
  stockQuants: StockQuant[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: StockAdjustment[];
  moveHistory: MoveHistory[];

  // Computed Helpers
  getOnHandStock: (productId: string, locationId?: string) => number;
  getReservedStock: (productId: string, locationId?: string) => number;
  getFreeStock: (productId: string, locationId?: string) => number;
  getLocationStockBreakdown: (productId: string) => { location: Location; quantity: number; reserved: number }[];
  isLowStock: (productId: string) => boolean;

  // Actions
  addProduct: (product: Omit<Product, 'id'>, initialStock?: { locationId: string; qty: number }) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  quickStockUpdate: (productId: string, locationId: string, newQty: number, reason?: string) => void;

  // Operations
  createReceipt: (receipt: Omit<Receipt, 'id' | 'reference' | 'createdAt' | 'status'>) => void;
  validateReceipt: (receiptId: string) => void;
  cancelReceipt: (receiptId: string) => void;

  createDelivery: (delivery: Omit<DeliveryOrder, 'id' | 'reference' | 'createdAt' | 'status'>) => void;
  checkDeliveryAvailability: (deliveryId: string) => void;
  validateDelivery: (deliveryId: string) => void;
  cancelDelivery: (deliveryId: string) => void;

  createTransfer: (transfer: Omit<InternalTransfer, 'id' | 'reference' | 'createdAt' | 'status'>) => void;
  validateTransfer: (transferId: string) => void;
  cancelTransfer: (transferId: string) => void;

  createAdjustment: (productId: string, locationId: string, countedQty: number, reason: string) => void;

  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  addLocation: (location: Omit<Location, 'id'>) => void;

  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  USER: 'stocksense_current_user',
  ACCOUNTS: 'stocksense_registered_accounts',
  WAREHOUSES: 'stocksense_warehouses',
  LOCATIONS: 'stocksense_locations',
  PRODUCTS: 'stocksense_products',
  QUANTS: 'stocksense_quants',
  RECEIPTS: 'stocksense_receipts',
  DELIVERIES: 'stocksense_deliveries',
  TRANSFERS: 'stocksense_transfers',
  ADJUSTMENTS: 'stocksense_adjustments',
  MOVE_HISTORY: 'stocksense_move_history',
};

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    loginId: 'admin_manager',
    email: 'manager@stocksense.io',
    passwordHash: 'Admin@123',
    name: 'Alex Rivera (Manager)',
    role: 'inventory_manager',
  },
  {
    loginId: 'warehouse_staff',
    email: 'staff@stocksense.io',
    passwordHash: 'Staff@123',
    name: 'Sam Wilson (Staff)',
    role: 'warehouse_staff',
  },
];

const InventoryStoreContext = createContext<InventoryStoreContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fallbacks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stockQuants, setStockQuants] = useState<StockQuant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUANTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_QUANTS;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVE_HISTORY);
    return saved ? JSON.parse(saved) : INITIAL_MOVE_HISTORY;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUANTS, JSON.stringify(stockQuants));
  }, [stockQuants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
  }, [adjustments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVE_HISTORY, JSON.stringify(moveHistory));
  }, [moveHistory]);

  // Auth Methods
  const login = (loginIdOrEmail: string, password: string) => {
    const normalizedInput = loginIdOrEmail.trim().toLowerCase();
    const found = accounts.find(
      (a) =>
        (a.loginId.toLowerCase() === normalizedInput || a.email.toLowerCase() === normalizedInput) &&
        a.passwordHash === password
    );

    if (!found) {
      return { success: false, error: 'Invalid Login Id or Password' };
    }

    const loggedUser: User = {
      id: `usr-${Date.now()}`,
      loginId: found.loginId,
      email: found.email,
      name: found.name,
      role: found.role,
      avatar: found.role === 'inventory_manager'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      warehouseId: 'wh-main'
    };

    setCurrentUser(loggedUser);
    return { success: true };
  };

  const signup = (
    loginId: string,
    email: string,
    password: string,
    name?: string,
    role: UserRole = 'inventory_manager'
  ) => {
    const trimmedLogin = loginId.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Login ID 6-12 chars
    if (trimmedLogin.length < 6 || trimmedLogin.length > 12) {
      return { success: false, error: 'Login ID must be between 6 and 12 characters.' };
    }

    // 2. Check unique login ID
    if (accounts.some((a) => a.loginId.toLowerCase() === trimmedLogin.toLowerCase())) {
      return { success: false, error: 'Login ID is already taken. Please choose another.' };
    }

    // 3. Unique email
    if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'Email is already registered in the system.' };
    }

    // 4. Password validation: > 8 chars, uppercase, lowercase, special character
    if (password.length < 8) {
      return { success: false, error: 'Password length must be at least 8 characters.' };
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpper || !hasLower || !hasSpecial) {
      return {
        success: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one special character.',
      };
    }

    const newAccount: RegisteredAccount = {
      loginId: trimmedLogin,
      email: trimmedEmail,
      passwordHash: password,
      name: name?.trim() || trimmedLogin,
      role,
    };

    setAccounts((prev) => [...prev, newAccount]);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      loginId: trimmedLogin,
      email: trimmedEmail,
      name: newAccount.name,
      role: newAccount.role,
      warehouseId: 'wh-main'
    };

    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      role: newRole,
      name: newRole === 'inventory_manager' ? 'Alex Rivera (Manager)' : 'Sam Wilson (Staff)'
    });
  };

  const resetPassword = (identifier: string, newPassword: string) => {
    const trimmed = identifier.trim().toLowerCase();
    const accountIndex = accounts.findIndex(
      (a) => a.loginId.toLowerCase() === trimmed || a.email.toLowerCase() === trimmed
    );

    if (accountIndex === -1) {
      return { success: false, error: 'No account found with this Login ID or Email.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasSpecial) {
      return {
        success: false,
        error: 'Password must contain uppercase, lowercase, and a special character.',
      };
    }

    setAccounts((prev) => {
      const copy = [...prev];
      copy[accountIndex].passwordHash = newPassword;
      return copy;
    });

    return { success: true };
  };

  // Stock helpers
  const internalLocationIds = new Set(
    locations.filter((l) => l.type === 'internal').map((l) => l.id)
  );

  const getOnHandStock = (productId: string, locationId?: string): number => {
    return stockQuants
      .filter((q) => {
        if (q.productId !== productId) return false;
        if (locationId) return q.locationId === locationId;
        return internalLocationIds.has(q.locationId);
      })
      .reduce((sum, q) => sum + (q.quantity || 0), 0);
  };

  const getReservedStock = (productId: string, locationId?: string): number => {
    return stockQuants
      .filter((q) => {
        if (q.productId !== productId) return false;
        if (locationId) return q.locationId === locationId;
        return internalLocationIds.has(q.locationId);
      })
      .reduce((sum, q) => sum + (q.reservedQuantity || 0), 0);
  };

  const getFreeStock = (productId: string, locationId?: string): number => {
    const onHand = getOnHandStock(productId, locationId);
    const reserved = getReservedStock(productId, locationId);
    return Math.max(0, onHand - reserved);
  };

  const getLocationStockBreakdown = (productId: string) => {
    return locations
      .filter((loc) => loc.type === 'internal')
      .map((loc) => {
        const quant = stockQuants.find((q) => q.productId === productId && q.locationId === loc.id);
        return {
          location: loc,
          quantity: quant ? quant.quantity : 0,
          reserved: quant ? quant.reservedQuantity : 0,
        };
      })
      .filter((item) => item.quantity > 0 || item.reserved > 0);
  };

  const isLowStock = (productId: string): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;
    const onHand = getOnHandStock(productId);
    return onHand <= prod.minStockThreshold;
  };

  // Helper to mutate stock quant safely
  const mutateQuant = (productId: string, locationId: string, deltaQty: number, deltaReserved = 0) => {
    setStockQuants((prev) => {
      const idx = prev.findIndex((q) => q.productId === productId && q.locationId === locationId);
      if (idx >= 0) {
        const copy = [...prev];
        const current = copy[idx];
        const newQty = Math.max(0, current.quantity + deltaQty);
        const newRes = Math.max(0, current.reservedQuantity + deltaReserved);
        copy[idx] = { ...current, quantity: newQty, reservedQuantity: newRes };
        return copy;
      } else {
        const newQuant: StockQuant = {
          id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          locationId,
          quantity: Math.max(0, deltaQty),
          reservedQuantity: Math.max(0, deltaReserved),
        };
        return [...prev, newQuant];
      }
    });
  };

  // Direct quick stock update from Stock table
  const quickStockUpdate = (productId: string, locationId: string, newQty: number, reason?: string) => {
    const product = products.find((p) => p.id === productId);
    const loc = locations.find((l) => l.id === locationId);
    if (!product || !loc) return;

    const currentQty = getOnHandStock(productId, locationId);
    const diff = newQty - currentQty;
    if (diff === 0) return;

    setStockQuants((prev) => {
      const idx = prev.findIndex((q) => q.productId === productId && q.locationId === locationId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: newQty };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `sq-${Date.now()}`,
            productId,
            locationId,
            quantity: newQty,
            reservedQuantity: 0,
          },
        ];
      }
    });

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const adjRef = `INV/ADJ/${String(adjustments.length + 1).padStart(5, '0')}`;

    // Add Move History entry
    const newMove: MoveHistory = {
      id: `mv-${Date.now()}`,
      date: nowStr,
      reference: adjRef,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      fromLocationId: diff < 0 ? locationId : 'loc-scrap',
      fromLocationName: diff < 0 ? loc.name : 'Virtual/Adjustment',
      toLocationId: diff > 0 ? locationId : 'loc-scrap',
      toLocationName: diff > 0 ? loc.name : 'Virtual/Scrap & Loss',
      quantity: diff,
      uom: product.uom,
      status: 'done',
      user: currentUser?.name || 'Administrator',
      notes: reason || 'Direct stock count update from Stock table',
      type: 'adjustment',
    };
    setMoveHistory((prev) => [newMove, ...prev]);

    // Add Adjustment record
    const newAdjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      reference: adjRef,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      locationId: loc.id,
      locationName: loc.name,
      recordedQty: currentQty,
      countedQty: newQty,
      differenceQty: diff,
      uom: product.uom,
      reason: reason || 'Direct stock table inline update',
      status: 'applied',
      date: new Date().toISOString(),
      responsible: currentUser?.name || 'Administrator',
    };
    setAdjustments((prev) => [newAdjustment, ...prev]);
  };

  // Product management
  const addProduct = (
    productData: Omit<Product, 'id'>,
    initialStock?: { locationId: string; qty: number }
  ) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (initialStock && initialStock.qty > 0) {
      mutateQuant(newId, initialStock.locationId, initialStock.qty);
      const loc = locations.find((l) => l.id === initialStock.locationId);
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newMove: MoveHistory = {
        id: `mv-${Date.now()}`,
        date: nowStr,
        reference: 'INIT/STOCK',
        productId: newId,
        productName: newProduct.name,
        productSku: newProduct.sku,
        fromLocationId: 'loc-vendor',
        fromLocationName: 'Opening Balance',
        toLocationId: initialStock.locationId,
        toLocationName: loc?.name || 'Stock',
        quantity: initialStock.qty,
        uom: newProduct.uom,
        status: 'done',
        user: currentUser?.name || 'System',
        notes: 'Initial opening stock on product creation',
        type: 'receipt',
      };
      setMoveHistory((prev) => [newMove, ...prev]);
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setStockQuants((prev) => prev.filter((q) => q.productId !== productId));
  };

  // RECEIPTS
  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'reference' | 'createdAt' | 'status'>) => {
    const newRef = `WH/IN/${String(receipts.length + 1).padStart(5, '0')}`;
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rcpt-${Date.now()}`,
      reference: newRef,
      createdAt: new Date().toISOString(),
      status: 'ready', // Default to Ready for immediate processing or staff action
    };
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const validateReceipt = (receiptId: string) => {
    const rcpt = receipts.find((r) => r.id === receiptId);
    if (!rcpt || rcpt.status === 'done') return;

    const destLoc = locations.find((l) => l.id === rcpt.destinationLocationId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMoves: MoveHistory[] = [];

    // Increase stock for each line
    rcpt.lines.forEach((line) => {
      const qtyToAdd = line.doneQty > 0 ? line.doneQty : line.demandQty;
      mutateQuant(line.productId, rcpt.destinationLocationId, qtyToAdd);

      newMoves.push({
        id: `mv-${Date.now()}-${line.id}`,
        date: nowStr,
        reference: rcpt.reference,
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        fromLocationId: 'loc-vendor',
        fromLocationName: `Vendor (${rcpt.supplierName})`,
        toLocationId: rcpt.destinationLocationId,
        toLocationName: destLoc?.name || 'Destination Location',
        quantity: qtyToAdd,
        uom: line.uom,
        status: 'done',
        user: currentUser?.name || rcpt.responsible,
        notes: `Validated Receipt ${rcpt.reference}`,
        type: 'receipt',
      });
    });

    setMoveHistory((prev) => [...newMoves, ...prev]);

    // Mark receipt Done and lines doneQty to demandQty if 0
    setReceipts((prev) =>
      prev.map((r) => {
        if (r.id !== receiptId) return r;
        return {
          ...r,
          status: 'done',
          validatedAt: new Date().toISOString(),
          lines: r.lines.map((l) => ({
            ...l,
            doneQty: l.doneQty > 0 ? l.doneQty : l.demandQty,
          })),
        };
      })
    );
  };

  const cancelReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'canceled' } : r))
    );
  };

  // DELIVERIES
  const createDelivery = (deliveryData: Omit<DeliveryOrder, 'id' | 'reference' | 'createdAt' | 'status'>) => {
    const newRef = `WH/OUT/${String(deliveries.length + 1).padStart(5, '0')}`;
    const newDelivery: DeliveryOrder = {
      ...deliveryData,
      id: `del-${Date.now()}`,
      reference: newRef,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
  };

  const checkDeliveryAvailability = (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del || del.status === 'done' || del.status === 'canceled') return;

    let allAvailable = true;
    const updatedLines = del.lines.map((line) => {
      const available = getFreeStock(line.productId, del.sourceLocationId);
      const needed = line.demandQty;
      const reserveAmount = Math.min(available, needed);
      if (reserveAmount < needed) {
        allAvailable = false;
      }
      return {
        ...line,
        reservedQty: reserveAmount,
        doneQty: reserveAmount, // Auto-populate doneQty with reserved for warehouse convenience
      };
    });

    // Update reserved stock quants
    del.lines.forEach((line, i) => {
      const prevReserved = line.reservedQty || 0;
      const newReserved = updatedLines[i].reservedQty;
      const diff = newReserved - prevReserved;
      if (diff !== 0) {
        mutateQuant(line.productId, del.sourceLocationId, 0, diff);
      }
    });

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: allAvailable ? 'ready' : 'waiting',
              lines: updatedLines,
            }
          : d
      )
    );
  };

  const validateDelivery = (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del || del.status === 'done') return;

    const srcLoc = locations.find((l) => l.id === del.sourceLocationId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMoves: MoveHistory[] = [];

    // Deduct stock and release reservations
    del.lines.forEach((line) => {
      const qtyToDeduct = line.doneQty > 0 ? line.doneQty : line.demandQty;
      mutateQuant(line.productId, del.sourceLocationId, -qtyToDeduct, -(line.reservedQty || 0));

      newMoves.push({
        id: `mv-${Date.now()}-${line.id}`,
        date: nowStr,
        reference: del.reference,
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        fromLocationId: del.sourceLocationId,
        fromLocationName: srcLoc?.name || 'Source Location',
        toLocationId: 'loc-customer',
        toLocationName: `Customer (${del.customerName})`,
        quantity: -qtyToDeduct,
        uom: line.uom,
        status: 'done',
        user: currentUser?.name || del.responsible,
        notes: `Shipped delivery order ${del.reference}`,
        type: 'delivery',
      });
    });

    setMoveHistory((prev) => [...newMoves, ...prev]);

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'done',
              validatedAt: new Date().toISOString(),
              lines: d.lines.map((l) => ({
                ...l,
                doneQty: l.doneQty > 0 ? l.doneQty : l.demandQty,
                reservedQty: 0,
              })),
            }
          : d
      )
    );
  };

  const cancelDelivery = (deliveryId: string) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (del) {
      // Release any reservations
      del.lines.forEach((line) => {
        if (line.reservedQty > 0) {
          mutateQuant(line.productId, del.sourceLocationId, 0, -line.reservedQty);
        }
      });
    }
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'canceled',
              lines: d.lines.map((l) => ({ ...l, reservedQty: 0 })),
            }
          : d
      )
    );
  };

  // INTERNAL TRANSFERS
  const createTransfer = (transferData: Omit<InternalTransfer, 'id' | 'reference' | 'createdAt' | 'status'>) => {
    const newRef = `WH/INT/${String(transfers.length + 1).padStart(5, '0')}`;
    const newTransfer: InternalTransfer = {
      ...transferData,
      id: `trf-${Date.now()}`,
      reference: newRef,
      createdAt: new Date().toISOString(),
      status: 'ready',
    };
    setTransfers((prev) => [newTransfer, ...prev]);
  };

  const validateTransfer = (transferId: string) => {
    const trf = transfers.find((t) => t.id === transferId);
    if (!trf || trf.status === 'done') return;

    const srcLoc = locations.find((l) => l.id === trf.sourceLocationId);
    const destLoc = locations.find((l) => l.id === trf.destinationLocationId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMoves: MoveHistory[] = [];

    trf.lines.forEach((line) => {
      // Move stock between locations
      mutateQuant(line.productId, trf.sourceLocationId, -line.quantity);
      mutateQuant(line.productId, trf.destinationLocationId, line.quantity);

      newMoves.push({
        id: `mv-${Date.now()}-${line.id}`,
        date: nowStr,
        reference: trf.reference,
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        fromLocationId: trf.sourceLocationId,
        fromLocationName: srcLoc?.name || 'Source Location',
        toLocationId: trf.destinationLocationId,
        toLocationName: destLoc?.name || 'Destination Location',
        quantity: line.quantity,
        uom: line.uom,
        status: 'done',
        user: currentUser?.name || trf.responsible,
        notes: `Internal transfer ${trf.reference}`,
        type: 'internal',
      });
    });

    setMoveHistory((prev) => [...newMoves, ...prev]);

    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'done',
              validatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const cancelTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'canceled' } : t))
    );
  };

  // INVENTORY ADJUSTMENTS
  const createAdjustment = (
    productId: string,
    locationId: string,
    countedQty: number,
    reason: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    const loc = locations.find((l) => l.id === locationId);
    if (!prod || !loc) return;

    quickStockUpdate(productId, locationId, countedQty, reason);
  };

  // SETTINGS
  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`,
    };
    setWarehouses((prev) => [...prev, newWh]);

    // Also auto-create default Stock location for this warehouse
    const newLoc: Location = {
      id: `loc-${newWh.shortCode.toLowerCase()}-stock-${Date.now()}`,
      name: `${newWh.shortCode}/Stock`,
      shortCode: `${newWh.shortCode}/STOCK`,
      warehouseId: newWh.id,
      warehouseName: newWh.name,
      type: 'internal',
    };
    setLocations((prev) => [...prev, newLoc]);
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
  };

  const resetDemoData = () => {
    setCurrentUser(INITIAL_USER);
    setAccounts(DEFAULT_ACCOUNTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setLocations(INITIAL_LOCATIONS);
    setProducts(INITIAL_PRODUCTS);
    setStockQuants(INITIAL_STOCK_QUANTS);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMoveHistory(INITIAL_MOVE_HISTORY);
  };

  return (
    <InventoryStoreContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        switchRole,
        resetPassword,
        warehouses,
        locations,
        products,
        stockQuants,
        receipts,
        deliveries,
        transfers,
        adjustments,
        moveHistory,
        getOnHandStock,
        getReservedStock,
        getFreeStock,
        getLocationStockBreakdown,
        isLowStock,
        addProduct,
        updateProduct,
        deleteProduct,
        quickStockUpdate,
        createReceipt,
        validateReceipt,
        cancelReceipt,
        createDelivery,
        checkDeliveryAvailability,
        validateDelivery,
        cancelDelivery,
        createTransfer,
        validateTransfer,
        cancelTransfer,
        createAdjustment,
        addWarehouse,
        addLocation,
        resetDemoData,
      }}
    >
      {children}
    </InventoryStoreContext.Provider>
  );
};

export const useInventoryStore = () => {
  const context = useContext(InventoryStoreContext);
  if (!context) {
    throw new Error('useInventoryStore must be used within an InventoryProvider');
  }
  return context;
};
