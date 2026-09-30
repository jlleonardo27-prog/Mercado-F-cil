import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StockScreen: React.FC = () => {
  const {
    products,
    setSubView,
    setSelectedProductId,
    formatCurrency,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'baixo' | 'zerado'>('todos');

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'baixo') {
      return p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0;
    }
    if (filterType === 'zerado') {
      return p.estoqueAtual <= 0;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-16 animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-display">
            {t('stock_control')}
          </h2>
          <p className="text-xs text-slate-400">
            {products.length} {products.length === 1 ? t('product_singular') : t('product_plural')}
          </p>
        </div>
      </div>

      {/* Main Stock Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setSubView('novo_produto')}
          className="py-3 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center space-y-1 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('btn_new_product')}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('entrada_estoque')}
          className="py-3 px-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center space-y-1 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <ArrowDownRight className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('btn_entry')}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('retirada_estoque')}
          className="py-3 px-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center space-y-1 shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('btn_withdrawal')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5">
        <button
          type="button"
          onClick={() => setFilterType('todos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterType === 'todos'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('filter_all')} ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('baixo')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterType === 'baixo'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          {t('filter_low')} ({products.filter((p) => p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0).length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('zerado')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            filterType === 'zerado'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          {t('filter_zero')} ({products.filter((p) => p.estoqueAtual <= 0).length})
        </button>
      </div>

      {/* Products List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-700" />
            <p>{t('no_products_found')}</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLow = p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0;
            const isOut = p.estoqueAtual <= 0;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProductId(p.id);
                  setSubView('detalhe_produto');
                }}
                className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {p.foto ? (
                    <img
                      src={p.foto}
                      alt={p.nome}
                      className="w-11 h-11 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-black text-white">{p.nome}</p>
                      {isLow && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                          {t('filter_low')}
                        </span>
                      )}
                      {isOut && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400">
                          {t('out_of_stock')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>
                        {t('table_cost_price')}: <strong className="text-slate-300">{formatCurrency(p.precoCompra)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {t('table_sale_price')}: <strong className="text-emerald-400">{formatCurrency(p.precoVendaSugerido)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`text-base font-black font-display ${
                      isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'
                    }`}>
                      {p.estoqueAtual}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">{p.unidade}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
