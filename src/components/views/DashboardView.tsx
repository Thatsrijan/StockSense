import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { ActiveTab } from '../layout/Navbar';
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  ArrowRight,
  TrendingDown,
  Warehouse as WarehouseIcon,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewAdjustment: () => void;
  onOpenNewProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewReceipt,
  onOpenNewDelivery,
  onOpenNewTransfer,
  onOpenNewAdjustment,
  onOpenNewProduct,
}) => {
  const {
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    warehouses,
    locations,
    getOnHandStock,
    isLowStock,
  } = useInventoryStore();

  // Dynamic filter states
  const [filterDocType, setFilterDocType] = useState<'all' | 'receipt' | 'delivery' | 'internal' | 'adjustment'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // KPI Calculations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + getOnHandStock(p.id), 0);
  const lowStockCount = products.filter((p) => isLowStock(p.id)).length;
  const pendingReceipts = receipts.filter((r) => r.status === 'ready' || r.status === 'draft').length;
  const pendingDeliveries = deliveries.filter((d) => d.status === 'ready' || d.status === 'waiting' || d.status === 'draft').length;
  const scheduledTransfers = transfers.filter((t) => t.status === 'ready' || t.status === 'draft').length;

  // Operation Card Counts
  const receiptsToProcess = receipts.filter((r) => r.status === 'ready').length;
  const receiptsWaiting = receipts.filter((r) => r.status === 'draft').length;

  const deliveriesToProcess = deliveries.filter((d) => d.status === 'ready').length;
  const deliveriesWaiting = deliveries.filter((d) => d.status === 'waiting').length;

  const transfersToProcess = transfers.filter((t) => t.status === 'ready').length;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Unified operations list for dynamic filtered view
  const allOps = [
    ...receipts.map((r) => ({
      id: r.id,
      docType: 'receipt' as const,
      reference: r.reference,
      partner: r.supplierName,
      locationId: r.destinationLocationId,
      date: r.scheduledDate,
      status: r.status,
      itemsCount: r.lines.length,
      createdAt: r.createdAt,
    })),
    ...deliveries.map((d) => ({
      id: d.id,
      docType: 'delivery' as const,
      reference: d.reference,
      partner: d.customerName,
      locationId: d.sourceLocationId,
      date: d.scheduledDate,
      status: d.status,
      itemsCount: d.lines.length,
      createdAt: d.createdAt,
    })),
    ...transfers.map((t) => ({
      id: t.id,
      docType: 'internal' as const,
      reference: t.reference,
      partner: 'Internal Move',
      locationId: t.destinationLocationId,
      date: t.scheduledDate,
      status: t.status,
      itemsCount: t.lines.length,
      createdAt: t.createdAt,
    })),
    ...adjustments.map((a) => ({
      id: a.id,
      docType: 'adjustment' as const,
      reference: a.reference,
      partner: a.reason,
      locationId: a.locationId,
      date: a.date.substring(0, 10),
      status: 'done',
      itemsCount: 1,
      createdAt: a.date,
    })),
  ];

  // Apply dynamic filters
  const filteredOps = allOps.filter((op) => {
    if (filterDocType !== 'all' && op.docType !== filterDocType) return false;
    if (filterStatus !== 'all' && op.status !== filterStatus) return false;
    if (filterWarehouse !== 'all') {
      const loc = locations.find((l) => l.id === op.locationId);
      if (loc?.warehouseId !== filterWarehouse) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Inventory Overview
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Real-time
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized hub for receiving, picking, shipping, internal routing, and ledger audits.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="quick-new-receipt-btn"
            onClick={onOpenNewReceipt}
            className="px-3 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-odoo-700/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> New Receipt
          </button>
          <button
            id="quick-new-delivery-btn"
            onClick={onOpenNewDelivery}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> New Delivery
          </button>
          <button
            id="quick-new-transfer-btn"
            onClick={onOpenNewTransfer}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
          </button>
          <button
            id="quick-new-adjustment-btn"
            onClick={onOpenNewAdjustment}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm shadow-slate-800/20 flex items-center gap-1.5 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Count Check
          </button>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Low Stock Alert: {lowStockCount} Products Require Restocking</div>
              <div className="text-xs text-amber-700 mt-0.5">
                Certain inventory levels have fallen below reordering rules minimum thresholds.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            Review Stock Items <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5 KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Products in Stock</span>
            <Package className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalProducts}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{totalStockUnits.toLocaleString()} total units</span>
          </div>
        </div>

        {/* KPI 2: Low Stock */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low / Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{lowStockCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">Requires purchase orders</div>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div
          onClick={() => onNavigate('receipts')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Receipts</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pendingReceipts}</div>
          <div className="text-[11px] text-emerald-700 mt-1">{receiptsToProcess} ready to receive</div>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div
          onClick={() => onNavigate('deliveries')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Deliveries</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pendingDeliveries}</div>
          <div className="text-[11px] text-blue-700 mt-1">{deliveriesToProcess} ready for dispatch</div>
        </div>

        {/* KPI 5: Internal Transfers */}
        <div
          onClick={() => onNavigate('transfers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Transfers</span>
            <ArrowLeftRight className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{scheduledTransfers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Inter-rack movements</div>
        </div>
      </div>

      {/* Odoo-style Operation Type Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-odoo-700" />
            Operation Types
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click any card to manage operation backlog</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Receipts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-2xl" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-slate-900 text-base">Receipts</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <ArrowDownLeft className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Vendor incoming shipments and dock receiving</p>

              <button
                id="dash-open-receipts-btn"
                onClick={() => onNavigate('receipts')}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-between transition-colors mb-3 border border-emerald-200"
              >
                <span>{receiptsToProcess} TO PROCESS</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Draft / Scheduled:</span>
                  <span className="font-semibold">{receiptsWaiting}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Total Operations:</span>
                  <span className="font-semibold">{receipts.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={onOpenNewReceipt}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Receipt
              </button>
              <button
                onClick={() => onNavigate('receipts')}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                View all &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Delivery Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-2xl" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-slate-900 text-base">Delivery Orders</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Customer fulfillment, picking, and dispatch</p>

              <button
                id="dash-open-deliveries-btn"
                onClick={() => onNavigate('deliveries')}
                className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs flex items-center justify-between transition-colors mb-3 border border-blue-200"
              >
                <span>{deliveriesToProcess} TO PROCESS</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-0.5">
                  <span className="text-amber-600 font-medium">Waiting Availability:</span>
                  <span className="font-bold text-amber-700">{deliveriesWaiting}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Total Operations:</span>
                  <span className="font-semibold">{deliveries.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={onOpenNewDelivery}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Delivery
              </button>
              <button
                onClick={() => onNavigate('deliveries')}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                View all &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Internal Transfers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 rounded-t-2xl" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-slate-900 text-base">Internal Transfers</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <ArrowLeftRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Stock movements between racks and warehouses</p>

              <button
                id="dash-open-transfers-btn"
                onClick={() => onNavigate('transfers')}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs flex items-center justify-between transition-colors mb-3 border border-amber-200"
              >
                <span>{transfersToProcess} TO TRANSFER</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Scheduled:</span>
                  <span className="font-semibold">{scheduledTransfers}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Total Moves:</span>
                  <span className="font-semibold">{transfers.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={onOpenNewTransfer}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Move
              </button>
              <button
                onClick={() => onNavigate('transfers')}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                View all &rarr;
              </button>
            </div>
          </div>

          {/* Card 4: Inventory Adjustments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-odoo-700 rounded-t-2xl" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-slate-900 text-base">Adjustments</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-odoo-800">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Physical count variance and damage reconciliations</p>

              <button
                id="dash-open-adjustments-btn"
                onClick={() => onNavigate('adjustments')}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-odoo-800 rounded-xl font-bold text-xs flex items-center justify-between transition-colors mb-3 border border-purple-200"
              >
                <span>{adjustments.length} LOGGED AUDITS</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Recent Audit:</span>
                  <span className="font-semibold truncate">{adjustments[0]?.reference || 'None'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">Audit Active</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={onOpenNewAdjustment}
                className="text-xs font-bold text-odoo-800 hover:text-odoo-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adjust Count
              </button>
              <button
                onClick={() => onNavigate('adjustments')}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Audit history &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Dimensional Filters Bar (PDF Requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-odoo-700" />
            <h3 className="text-sm font-bold text-slate-900">Dynamic Operations Filter</h3>
          </div>
          {(filterDocType !== 'all' || filterStatus !== 'all' || filterWarehouse !== 'all') && (
            <button
              onClick={() => {
                setFilterDocType('all');
                setFilterStatus('all');
                setFilterWarehouse('all');
              }}
              className="text-xs font-semibold text-odoo-700 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* By Document Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              id="filter-doc-type"
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white"
            >
              <option value="all">All Documents</option>
              <option value="receipt">Receipts (Incoming)</option>
              <option value="delivery">Deliveries (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>

          {/* By Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting (Availability)</option>
              <option value="ready">Ready (To Process)</option>
              <option value="done">Done (Validated)</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {/* By Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Warehouse Facility
            </label>
            <select
              id="filter-warehouse"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white"
            >
              <option value="all">All Facilities</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* By Product Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Product Category
            </label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Filtered Operations Feed Table */}
        <div className="mt-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Filtered Operations ({filteredOps.length} matches)</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Partner / Destination</th>
                  <th className="py-2.5 px-4">Scheduled Date</th>
                  <th className="py-2.5 px-4">Lines</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No operations match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOps.slice(0, 8).map((op) => {
                    const loc = locations.find((l) => l.id === op.locationId);
                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-odoo-800">
                          {op.reference}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              op.docType === 'receipt'
                                ? 'bg-emerald-100 text-emerald-800'
                                : op.docType === 'delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : op.docType === 'internal'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {op.docType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {op.partner}
                          {loc && <span className="block text-[10px] text-slate-400">{loc.name}</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {op.date}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {op.itemsCount} {op.itemsCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              op.status === 'done'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : op.status === 'ready'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : op.status === 'waiting'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {op.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (op.docType === 'receipt') onNavigate('receipts');
                              else if (op.docType === 'delivery') onNavigate('deliveries');
                              else if (op.docType === 'internal') onNavigate('transfers');
                              else onNavigate('adjustments');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-odoo-800 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
