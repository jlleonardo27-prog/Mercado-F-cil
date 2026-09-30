import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Package,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SellerDashboard: React.FC = () => {
  const {
    session,
    business,
    products,
    setSellerTab,
    formatCurrency,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) =>
    p.ativo && p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-in fade-in">
      {/* Seller Header Greeting */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/20 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            {t('seller_terminal_title')}
          </span>
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-500/30 shadow-md shrink-0 bg-slate-950">
            <img
              src="/logo.png"
              alt="Mercado Fácil"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white font-display mt-0.5">
          {t('greeting_hello')}, {session?.userName} 👋
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {business?.name} • {t('seller_ready_subtitle')}
        </p>

        {/* Big Giant New Sale Button */}
        <button
          type="button"
          id="btn-seller-new-sale"
          onClick={() => setSellerTab('vender')}
          className="w-full mt-4 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>🛒 {t('btn_start_new_sale')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Product Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search_stock_placeholder')}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Products Catalog for Seller */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('products_in_stock')} ({filteredProducts.length})
            </h3>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {t('no_products_found_with_term')} "{searchTerm}".
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map((p) => {
              const isLow = p.estoqueAtual <= p.estoqueMinimo;
              const isOut = p.estoqueAtual <= 0;

              return (
                <div
                  key={p.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">{p.nome}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-cyan-400">
                        {t('suggested_price_label')}: {formatCurrency(p.precoVendaSugerido)}
                      </span>
                      <span className="text-[10px] text-slate-500">/ {p.unidade}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                        isOut
                          ? 'bg-rose-500/20 text-rose-400'
                          : isLow
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      <span>{p.estoqueAtual} {t('in_stock_label')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
