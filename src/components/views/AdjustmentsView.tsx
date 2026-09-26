import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { StockAdjustment } from '../../types/inventory';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  MapPin,
  Calendar,
  Layers,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface AdjustmentsViewProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const AdjustmentsView: React.FC<AdjustmentsViewProps> = ({
  isCreateOpen: controlledCreateOpen,
  setIsCreateOpen: setControlledCreateOpen,
}) => {
  const {
    adjustments,
    products,
    locations,
    getOnHandStock,
    createAdjustment,
  } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : localCreateOpen;
  const setCreateModalOpen = setControlledCreateOpen || setLocalCreateOpen;

  const internalLocations = locations.filter((l) => l.type === 'internal');

  // New Adjustment Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedLocationId, setSelectedLocationId] = useState(internalLocations[0]?.id || '');
  const [countedQty, setCountedQty] = useState<number>(() => {
    return products[0] && internalLocations[0]
      ? getOnHandStock(products[0].id, internalLocations[0].id)
      : 0;
  });
  const [reason, setReason] = useState('Routine physical inventory cycle count');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const recordedQty = selectedProduct && selectedLocationId
    ? getOnHandStock(selectedProduct.id, selectedLocationId)
    : 0;
  const difference = countedQty - recordedQty;

  const filteredAdjustments = adjustments.filter((a) => {
    const matches =
      a.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matches;
  });

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const current = getOnHandStock(prodId, selectedLocationId);
    setCountedQty(current);
  };

  const handleLocationSelect = (locId: string) => {
    setSelectedLocationId(locId);
    const current = getOnHandStock(selectedProductId, locId);
    setCountedQty(current);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLocationId) return;

    createAdjustment(selectedProductId, selectedLocationId, Number(countedQty), reason.trim());
    setCreateModalOpen(false);
    setReason('Routine physical inventory cycle count');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-odoo-700" />
            Inventory Adjustments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile physical stock counts with digital system balances. Every adjustment is immutably logged to the Stock Ledger.
          </p>
        </div>

        <button
          id="create-adjustment-btn"
          onClick={() => {
            const current = getOnHandStock(selectedProductId, selectedLocationId);
            setCountedQty(current);
            setCreateModalOpen(true);
          }}
          className="px-4 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-odoo-700/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> New Physical Count
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference (INV/ADJ/...), product, SKU, or audit reason..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Audit Reference</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Recorded Qty</th>
                <th className="py-3 px-4 text-right">Counted Qty</th>
                <th className="py-3 px-4 text-center">Variance (Diff)</th>
                <th className="py-3 px-4">Audit Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No physical count adjustments recorded.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-odoo-800">
                      {adj.reference}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {adj.date.substring(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{adj.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{adj.productSku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {adj.locationName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {adj.recordedQty} {adj.uom}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {adj.countedQty} {adj.uom}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          adj.differenceQty > 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : adj.differenceQty < 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {adj.differenceQty > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3" /> +{adj.differenceQty}
                          </>
                        ) : adj.differenceQty < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3" /> {adj.differenceQty}
                          </>
                        ) : (
                          '0'
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={adj.reason}>
                      {adj.reason}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Applied
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inventory Physical Count</h3>
                <p className="text-xs text-slate-500">Record counted inventory and reconcile variance</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Product *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Warehouse Location *
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                >
                  {internalLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recorded vs Counted vs Difference Indicator */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">System Recorded</div>
                  <div className="text-lg font-bold text-slate-700 mt-1">
                    {recordedQty} <span className="text-xs font-normal text-slate-400">{selectedProduct?.uom}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Physical Counted</div>
                  <div className="text-lg font-bold text-odoo-800 mt-1">
                    {countedQty} <span className="text-xs font-normal text-slate-400">{selectedProduct?.uom}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Variance Delta</div>
                  <div className={`text-lg font-bold mt-1 ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {difference > 0 ? `+${difference}` : difference}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Enter Physical Counted Quantity ({selectedProduct?.uom}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={countedQty}
                  onChange={(e) => setCountedQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. 3 kg damaged during transit, physical inventory surplus, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-adjustment-btn"
                  type="submit"
                  className="px-5 py-2 bg-odoo-700 hover:bg-odoo-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Apply Count Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
