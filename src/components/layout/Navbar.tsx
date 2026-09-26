import React, { useState, useRef, useEffect } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import {
  Package,
  Layers,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  LogOut,
  User as UserIcon,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'products' | 'receipts' | 'deliveries' | 'transfers' | 'adjustments' | 'move_history' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, switchRole, logout, products, isLowStock, resetDemoData } = useInventoryStore();
  const [opsDropdownOpen, setOpsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const opsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (opsRef.current && !opsRef.current.contains(event.target as Node)) {
        setOpsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lowStockProducts = products.filter((p) => isLowStock(p.id));

  const isOpsActive = ['receipts', 'deliveries', 'transfers', 'adjustments'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-odoo-700 flex items-center justify-center text-white shadow-sm shadow-odoo-700/20 group-hover:bg-odoo-800 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  StockSense
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-odoo-800 rounded">
                    ERP
                  </span>
                </div>
                <div className="text-[10px] font-medium text-slate-400">Inventory Operations</div>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Dashboard */}
              <button
                id="nav-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-odoo-50 text-odoo-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Layers className="w-4 h-4" />
                Dashboard
              </button>

              {/* Operations Dropdown */}
              <div className="relative" ref={opsRef}>
                <button
                  id="nav-operations-dropdown"
                  type="button"
                  onClick={() => setOpsDropdownOpen(!opsDropdownOpen)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isOpsActive
                      ? 'bg-odoo-50 text-odoo-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  Operations
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${opsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {opsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      id="nav-sub-receipts"
                      onClick={() => {
                        setActiveTab('receipts');
                        setOpsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        activeTab === 'receipts' ? 'text-odoo-800 font-bold bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold">Receipts</div>
                        <div className="text-[10px] text-slate-400">Incoming vendor stock</div>
                      </div>
                    </button>

                    <button
                      id="nav-sub-deliveries"
                      onClick={() => {
                        setActiveTab('deliveries');
                        setOpsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        activeTab === 'deliveries' ? 'text-odoo-800 font-bold bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold">Delivery Orders</div>
                        <div className="text-[10px] text-slate-400">Outgoing customer dispatch</div>
                      </div>
                    </button>

                    <button
                      id="nav-sub-transfers"
                      onClick={() => {
                        setActiveTab('transfers');
                        setOpsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        activeTab === 'transfers' ? 'text-odoo-800 font-bold bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-semibold">Internal Transfers</div>
                        <div className="text-[10px] text-slate-400">Inter-location movements</div>
                      </div>
                    </button>

                    <button
                      id="nav-sub-adjustments"
                      onClick={() => {
                        setActiveTab('adjustments');
                        setOpsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        activeTab === 'adjustments' ? 'text-odoo-800 font-bold bg-purple-50/50' : 'text-slate-700'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-semibold">Inventory Adjustment</div>
                        <div className="text-[10px] text-slate-400">Physical count reconciliations</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Stock / Products */}
              <button
                id="nav-products"
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'products'
                    ? 'bg-odoo-50 text-odoo-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Package className="w-4 h-4" />
                Products &amp; Stock
              </button>

              {/* Move History */}
              <button
                id="nav-move-history"
                onClick={() => setActiveTab('move_history')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'move_history'
                    ? 'bg-odoo-50 text-odoo-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <History className="w-4 h-4" />
                Move History
              </button>

              {/* Settings */}
              <button
                id="nav-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-odoo-50 text-odoo-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative hidden lg:block w-56">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU or doc..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs rounded-lg border border-transparent focus:border-slate-300 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Low Stock Alerts Bell */}
            <div className="relative" ref={alertsRef}>
              <button
                id="alerts-bell-btn"
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Low Stock Alerts"
              >
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {alertsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Low Stock Alerts ({lowStockProducts.length})
                    </div>
                  </div>
                  <div className="py-2 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">All stock levels are optimal!</p>
                    ) : (
                      lowStockProducts.map((p) => (
                        <div key={p.id} className="py-2 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              SKU: {p.sku} | Min: {p.minStockThreshold}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab('products');
                              setAlertsOpen(false);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-odoo-800 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200"
                          >
                            Restock
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <button
              onClick={() => switchRole(currentUser?.role === 'inventory_manager' ? 'warehouse_staff' : 'inventory_manager')}
              title="Click to toggle simulated role"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                currentUser?.role === 'inventory_manager'
                  ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
            >
              {currentUser?.role === 'inventory_manager' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Manager</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Staff</span>
                </>
              )}
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                id="user-avatar-menu-btn"
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 focus:outline-none transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-odoo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm overflow-hidden">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name.charAt(0) || 'U'
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900">{currentUser?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenProfile();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      switchRole(currentUser?.role === 'inventory_manager' ? 'warehouse_staff' : 'inventory_manager');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Switch Role ({currentUser?.role === 'inventory_manager' ? 'Staff' : 'Manager'})
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all demo data to default warehouse state?')) {
                        resetDemoData();
                        setUserDropdownOpen(false);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Demo Data
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'products' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'receipts' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'deliveries' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Deliveries
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'transfers' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Transfers
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'adjustments' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Adjustments
          </button>
          <button
            onClick={() => setActiveTab('move_history')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'move_history' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Move History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-odoo-50 text-odoo-800' : 'text-slate-600'
            }`}
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};
