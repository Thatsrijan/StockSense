import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { MovementType } from '../../types/inventory';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  CheckCircle,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

export const MoveHistoryView: React.FC = () => {
  const { moveHistory } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | MovementType>('all');

  const filteredHistory = moveHistory.filter((move) => {
    const matchesSearch =
      move.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.fromLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.toLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.user.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedType !== 'all' && move.type !== selectedType) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Reference', 'Type', 'Product', 'SKU', 'From Location', 'To Location', 'Quantity', 'UoM', 'Operator', 'Notes'];
    const rows = moveHistory.map((m) => [
      m.date,
      m.reference,
      m.type,
      `"${m.productName}"`,
      m.productSku,
      `"${m.fromLocationName}"`,
      `"${m.toLocationName}"`,
      m.quantity,
      m.uom,
      `"${m.user}"`,
      `"${m.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Move_Ledger_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-odoo-700" />
            Move History (Stock Ledger)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete, immutable double-entry audit trail for all incoming, outgoing, transfer, and adjustment operations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export Ledger CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference, product name, SKU, location, or operator..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-odoo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-odoo-600"
          >
            <option value="all">All Movement Types ({moveHistory.length})</option>
            <option value="receipt">Receipts (Incoming)</option>
            <option value="delivery">Deliveries (Outgoing)</option>
            <option value="internal">Internal Transfers</option>
            <option value="adjustment">Stock Adjustments</option>
          </select>
        </div>
      </div>

      {/* Move History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4 text-center">Flow</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No stock movements found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((move) => (
                  <tr key={move.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {move.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-odoo-800">
                      {move.reference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{move.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{move.productSku}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {move.fromLocationName}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto text-slate-400" />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {move.toLocationName}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          move.quantity > 0
                            ? 'text-emerald-700'
                            : move.quantity < 0
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {move.quantity > 0 ? `+${move.quantity}` : move.quantity}{' '}
                        <span className="text-[10px] font-normal text-slate-400">{move.uom}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {move.user}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
