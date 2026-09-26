import React, { useState } from 'react';
import { InventoryProvider, useInventoryStore } from './store/useInventoryStore';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { ProfileModal } from './components/layout/ProfileModal';
import { DashboardView } from './components/views/DashboardView';
import { ProductsView } from './components/views/ProductsView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { DeliveriesView } from './components/views/DeliveriesView';
import { TransfersView } from './components/views/TransfersView';
import { AdjustmentsView } from './components/views/AdjustmentsView';
import { MoveHistoryView } from './components/views/MoveHistoryView';
import { SettingsView } from './components/views/SettingsView';

const MainApp: React.FC = () => {
  const { currentUser } = useInventoryStore();

  // Auth screen state
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Triggers for creation modals opened from quick actions
  const [openReceiptModal, setOpenReceiptModal] = useState(false);
  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openAdjustmentModal, setOpenAdjustmentModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);

  // If not logged in, render authentication screens
  if (!currentUser) {
    if (authView === 'signup') {
      return <SignupPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot') {
      return <ForgotPasswordModal onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onNavigateToSignup={() => setAuthView('signup')}
        onNavigateToForgot={() => setAuthView('forgot')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={globalSearch}
        setSearchQuery={setGlobalSearch}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewReceipt={() => {
              setActiveTab('receipts');
              setOpenReceiptModal(true);
            }}
            onOpenNewDelivery={() => {
              setActiveTab('deliveries');
              setOpenDeliveryModal(true);
            }}
            onOpenNewTransfer={() => {
              setActiveTab('transfers');
              setOpenTransferModal(true);
            }}
            onOpenNewAdjustment={() => {
              setActiveTab('adjustments');
              setOpenAdjustmentModal(true);
            }}
            onOpenNewProduct={() => {
              setActiveTab('products');
              setOpenProductModal(true);
            }}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            externalSearch={globalSearch}
            isCreateOpen={openProductModal}
            setIsCreateOpen={setOpenProductModal}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsView
            isCreateOpen={openReceiptModal}
            setIsCreateOpen={setOpenReceiptModal}
          />
        )}

        {activeTab === 'deliveries' && (
          <DeliveriesView
            isCreateOpen={openDeliveryModal}
            setIsCreateOpen={setOpenDeliveryModal}
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersView
            isCreateOpen={openTransferModal}
            setIsCreateOpen={setOpenTransferModal}
          />
        )}

        {activeTab === 'adjustments' && (
          <AdjustmentsView
            isCreateOpen={openAdjustmentModal}
            setIsCreateOpen={setOpenAdjustmentModal}
          />
        )}

        {activeTab === 'move_history' && <MoveHistoryView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <InventoryProvider>
      <MainApp />
    </InventoryProvider>
  );
}

export default App;
