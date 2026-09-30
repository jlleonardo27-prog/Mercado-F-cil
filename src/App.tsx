import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { SellerSalesScreen } from './components/SellerSalesScreen';
import { SellScreen } from './components/SellScreen';
import { StockScreen } from './components/StockScreen';
import { AddProductModal } from './components/AddProductModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StockEntryModal } from './components/StockEntryModal';
import { StockWithdrawalModal } from './components/StockWithdrawalModal';
import { ProfitScreen } from './components/ProfitScreen';
import { SellersManagerScreen } from './components/SellersManagerScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ExpensesScreen } from './components/ExpensesScreen';
import { MoreMenuScreen } from './components/MoreMenuScreen';
import { DownloadAppModal } from './components/DownloadAppModal';
import { PlansModal } from './components/PlansModal';
import { ReferralModal } from './components/ReferralModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AccessExpiredScreen } from './components/AccessExpiredScreen';
import { AccountInfoModal } from './components/AccountInfoModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    session,
    isOwner,
    isSeller,
    activeTab,
    sellerTab,
    subView,
    setSubView,
    toastMessage,
    isAccessBlockedOrExpired,
    refreshAccountState
  } = useApp();

  // 1. If not authenticated, render the unified AuthScreen (Login/Cadastro de Dono ou Vendedor)
  if (!session) {
    return <AuthScreen />;
  }

  // 2. Render Subviews (Modals / Detailed Pages)
  const renderSubView = () => {
    switch (subView) {
      case 'novo_produto':
        return <AddProductModal />;
      case 'detalhe_produto':
        return <ProductDetailModal />;
      case 'entrada_estoque':
        return <StockEntryModal />;
      case 'retirada_estoque':
        return <StockWithdrawalModal />;
      case 'vendedores':
        return <SellersManagerScreen />;
      case 'notificacoes':
        return <NotificationsScreen />;
      case 'historico':
        return <HistoryScreen />;
      case 'despesas':
        return <ExpensesScreen />;
      case 'baixar_app':
        return <DownloadAppModal />;
      case 'planos':
        return <PlansModal onClose={() => setSubView('none')} />;
      case 'convite':
        return <ReferralModal onClose={() => setSubView('none')} />;
      case 'minha_conta':
        return <AccountInfoModal isOpen={true} onClose={() => setSubView('none')} />;
      case 'admin':
        return (
          <AdminPanelModal
            isOpen={true}
            onClose={() => setSubView('none')}
            onAccountUpdated={refreshAccountState}
          />
        );
      default:
        return null;
    }
  };

  // If subscription has expired or is blocked, show AccessExpiredScreen (while still allowing subviews like planos or admin)
  if (isAccessBlockedOrExpired && subView !== 'planos' && subView !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 pb-16">
        <AccessExpiredScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 pb-16">
      {/* Role-aware Header Navigation */}
      <Navigation />

      {/* Main Container - Optimized for mobile-first viewport */}
      <main className="max-w-md mx-auto px-4 pt-3">
        {/* TOAST ALERT BANNER */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center space-x-2 animate-in fade-in slide-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* If a modal subview is active, render it for both roles */}
        {subView !== 'none' ? (
          renderSubView()
        ) : (
          <>
            {/* SELLER VIEW ROUTING */}
            {isSeller && (
              <>
                {(sellerTab === 'inicio' || sellerTab === 'produtos') && <SellerDashboard />}
                {sellerTab === 'vender' && <SellScreen />}
                {sellerTab === 'minhas_vendas' && <SellerSalesScreen />}
              </>
            )}

            {/* OWNER VIEW ROUTING */}
            {isOwner && (
              <>
                {activeTab === 'inicio' && <Dashboard />}
                {activeTab === 'vender' && <SellScreen />}
                {activeTab === 'estoque' && <StockScreen />}
                {activeTab === 'lucro' && <ProfitScreen />}
                {activeTab === 'mais' && <MoreMenuScreen />}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
