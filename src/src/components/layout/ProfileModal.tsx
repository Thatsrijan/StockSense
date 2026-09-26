import React from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { UserRole } from '../../types/inventory';
import { X, ShieldCheck, UserCheck, Warehouse, Mail, Key, RotateCcw, LogOut } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, logout, resetDemoData, warehouses } = useInventoryStore();

  if (!isOpen || !currentUser) return null;

  const currentWarehouse = warehouses.find((w) => w.id === currentUser.warehouseId) || warehouses[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header Banner */}
        <div className="h-24 bg-gradient-to-r from-odoo-700 via-purple-700 to-tealbrand-700 relative p-4 flex justify-between items-start">
          <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Enterprise Profile</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Avatar & Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-slate-100 shadow-md overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-odoo-700 text-white flex items-center justify-center text-2xl font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  currentUser.role === 'inventory_manager'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                {currentUser.role === 'inventory_manager' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Inventory Manager
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" /> Warehouse Staff
                  </>
                )}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{currentUser.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">@{currentUser.loginId}</p>
          </div>

          <div className="mt-5 space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <span className="font-semibold text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Warehouse className="w-3.5 h-3.5 text-slate-400" /> Assigned Facility
              </span>
              <span className="font-semibold text-slate-800">{currentWarehouse?.name}</span>
            </div>
          </div>

          {/* Quick Role Switcher for Test / Evaluation */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Role Simulator (Evaluation Tool)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchRole('inventory_manager')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  currentUser.role === 'inventory_manager'
                    ? 'bg-odoo-700 text-white border-odoo-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Inventory Manager
              </button>
              <button
                type="button"
                onClick={() => switchRole('warehouse_staff')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  currentUser.role === 'warehouse_staff'
                    ? 'bg-tealbrand-700 text-white border-tealbrand-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Warehouse Staff
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Switch roles to evaluate manager approvals, reordering configuration, versus warehouse staff picking &amp; shelf transfers.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all inventory records and seed initial demonstration data?')) {
                  resetDemoData();
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Demo Data
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
