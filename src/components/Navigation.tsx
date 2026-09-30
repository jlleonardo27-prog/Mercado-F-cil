import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Menu,
  Sun,
  Moon,
  LogOut,
  Bell,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';

export const Navigation: React.FC = () => {
  const {
    isOwner,
    isSeller,
    business,
    activeTab,
    setActiveTab,
    sellerTab,
    setSellerTab,
    subView,
    setSubView,
    unreadNotificationCount,
    theme,
    toggleTheme,
    logout,
    t
  } = useApp();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur border-b border-slate-800 dark:border-slate-800 light:border-slate-200 px-3 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Logo & Active Business Info */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-md ring-2 ring-amber-500/30 shrink-0 bg-slate-950 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Mercado Fácil"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-sm text-white dark:text-white light:text-slate-900 font-display leading-tight truncate">
                  {t('app_name')}
                </h1>
                {isSeller && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shrink-0">
                    {t('nav_cashier')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[120px] sm:max-w-[150px]">
                {business?.name || t('market_name')}
              </p>
            </div>
          </div>

          {/* Actions: Language Selector, Baixar App, Theme Toggle, Notifications (Owner), Logout */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Real-time Language Selector Dropdown */}
            <LanguageSelector compact={true} />

            {/* Download App Modal Trigger */}
            <button
              type="button"
              id="btn-nav-download-app"
              onClick={() => setSubView('baixar_app')}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
              title={t('nav_download_app')}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav_download_app')}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition cursor-pointer"
              title={t('nav_theme_toggle')}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-blue-500" />
              )}
            </button>

            {/* Notifications Bell (Owner only) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setSubView('notificacoes')}
                className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition cursor-pointer relative"
                title={t('nav_notifications')}
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title={t('nav_logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur border-t border-slate-800 dark:border-slate-800 light:border-slate-200 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
          {/* OWNER TABS */}
          {isOwner && (
            <>
              {/* INÍCIO */}
              <button
                type="button"
                onClick={() => {
                  setSubView('none');
                  setActiveTab('inicio');
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition cursor-pointer ${
                  activeTab === 'inicio' && subView === 'none'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{t('nav_home')}</span>
              </button>

              {/* VENDER */}
              <button
                type="button"
                onClick={() => {
                  setSubView('none');
                  setActiveTab('vender');
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition cursor-pointer ${
                  activeTab === 'vender' && subView === 'none'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{t('nav_sell')}</span>
              </button>

              {/* ESTOQUE */}
              <button
                type="button"
                onClick={() => {
                  setSubView('none');
                  setActiveTab('estoque');
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition cursor-pointer ${
                  activeTab === 'estoque' && subView === 'none'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{t('nav_stock')}</span>
              </button>

              {/* LUCRO */}
              <button
                type="button"
                onClick={() => {
                  setSubView('none');
                  setActiveTab('lucro');
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition cursor-pointer ${
                  activeTab === 'lucro' && subView === 'none'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{t('nav_profit')}</span>
              </button>

              {/* MAIS */}
              <button
                type="button"
                onClick={() => {
                  setSubView('none');
                  setActiveTab('mais');
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition cursor-pointer ${
                  activeTab === 'mais' || subView !== 'none'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Menu className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{t('nav_more')}</span>
              </button>
            </>
          )}

          {/* SELLER TABS */}
          {isSeller && (
            <>
              {/* VENDER */}
              <button
                type="button"
                onClick={() => setSellerTab('vender')}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-2xl transition cursor-pointer ${
                  sellerTab === 'vender'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-black">{t('nav_sell')}</span>
              </button>

              {/* MINHAS VENDAS */}
              <button
                type="button"
                onClick={() => setSellerTab('minhas_vendas')}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-2xl transition cursor-pointer ${
                  sellerTab === 'minhas_vendas'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-black">{t('nav_my_sales')}</span>
              </button>

              {/* PRODUTOS */}
              <button
                type="button"
                onClick={() => setSellerTab('produtos')}
                className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-2xl transition cursor-pointer ${
                  sellerTab === 'produtos' || sellerTab === 'inicio'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-black">{t('nav_products')}</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
