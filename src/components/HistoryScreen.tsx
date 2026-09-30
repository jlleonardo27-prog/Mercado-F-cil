import React, { useState } from 'react';
import {
  X,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryScreen: React.FC = () => {
  const {
    sales,
    stockMovements,
    setSubView,
    formatCurrency,
    t
  } = useApp();

  const [tab, setTab] = useState<'vendas' | 'estoque'>('vendas');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('history_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('history_subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSubView('none')}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl space-x-1 border border-slate-800">
        <button
          type="button"
          onClick={() => setTab('vendas')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
            tab === 'vendas'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t('tab_sales')} ({sales.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('estoque')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
            tab === 'estoque'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('tab_stock_movs')} ({stockMovements.length})</span>
        </button>
      </div>

      {/* SALES TAB */}
      {tab === 'vendas' && (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {sales.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              {t('empty_sales')}
            </p>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-white">
                      {formatCurrency(sale.total)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sale.formaPagamento}
                    </span>
                  </div>
                  <span className={`text-xs font-black ${sale.lucro >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sale.lucro >= 0 ? `+${formatCurrency(sale.lucro)}` : formatCurrency(sale.lucro)}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  {sale.itens.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-400">
                      <span>• {i.nome} ({i.quantidade} {i.unidade}s @ {formatCurrency(i.precoVendaReal)})</span>
                      <span>{formatCurrency(i.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>{t('label_attendant')}: <strong className="text-slate-400">{sale.vendedorNome}</strong></span>
                  <span>{sale.data} {sale.hora}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* STOCK MOVEMENTS TAB */}
      {tab === 'estoque' && (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {stockMovements.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              {t('empty_movements')}
            </p>
          ) : (
            stockMovements.map((mov) => {
              const isPositive = mov.quantidade > 0;

              return (
                <div
                  key={mov.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white">{mov.produtoNome}</p>
                    <p className="text-[10px] text-slate-400">
                      {mov.motivo || mov.tipo} • {t('by_user')} {mov.usuarioNome}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {t('prev_stock')}: {mov.estoqueAnterior} → {t('new_stock')}: {mov.novoEstoque} {mov.unidade}s
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isPositive ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isPositive ? `+${mov.quantidade}` : mov.quantidade}
                    </span>
                    <p className="text-[10px] text-slate-500">{mov.data} {mov.hora}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
