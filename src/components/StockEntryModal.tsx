import React, { useState } from 'react';
import {
  X,
  ArrowDownRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StockEntryModal: React.FC = () => {
  const {
    business,
    products,
    selectedProductId,
    addStock,
    setSubView,
    formatCurrency,
    t
  } = useApp();

  const [productId, setProductId] = useState<string>(
    selectedProductId || (products[0]?.id ?? '')
  );
  const selectedProduct = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>(
    selectedProduct ? selectedProduct.precoCompra.toString() : ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProductChange = (newId: string) => {
    setProductId(newId);
    const prod = products.find((p) => p.id === newId);
    if (prod) {
      setCostPrice(prod.precoCompra.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = parseFloat(quantity);
    const cost = parseFloat(costPrice);

    if (!productId) {
      setErrorMsg(t('select_product_prompt'));
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      setErrorMsg(t('qty_greater_than_zero'));
      return;
    }

    addStock(productId, qty, isNaN(cost) ? 0 : cost);
    setSubView('none');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('stock_entry_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('stock_entry_subtitle')}</p>
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

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Select Product */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('select_product_prompt')}
          </label>
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({t('current_stock_label')}: {p.estoqueAtual} {p.unidade}s)
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>{t('current_stock_label')}: <strong className="text-white">{selectedProduct.estoqueAtual} {selectedProduct.unidade}(s)</strong></span>
            <span>{t('registered_cost_label')}: <strong className="text-white">{formatCurrency(selectedProduct.precoCompra)}</strong></span>
          </div>
        )}

        {/* Quantity to Add */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('quantity_arrived_label')} ({selectedProduct?.unidade || 'unidade'})
          </label>
          <input
            type="number"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ex: 10, 50, 100..."
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-lg font-black focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Purchase cost per unit for this arrival */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('purchase_cost_label')} ({business?.currency || 'MT'})
          </label>
          <input
            type="number"
            step="any"
            required
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-base font-black focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            {t('supplier_cost_changed_note')}
          </p>
        </div>

        <div className="pt-2 flex space-x-2">
          <button
            type="button"
            onClick={() => setSubView('none')}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            id="btn-confirm-stock-entry"
            className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
          >
            {t('confirm_entry_btn')}
          </button>
        </div>
      </form>
    </div>
  );
};
