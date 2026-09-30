import React, { useState } from 'react';
import {
  X,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockWithdrawalReason } from '../types';

export const StockWithdrawalModal: React.FC = () => {
  const {
    products,
    selectedProductId,
    withdrawStock,
    setSubView,
    t
  } = useApp();

  const [productId, setProductId] = useState<string>(
    selectedProductId || (products[0]?.id ?? '')
  );
  const selectedProduct = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState<string>('');
  const [motivo, setMotivo] = useState<StockWithdrawalReason>('Consumo próprio');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = parseFloat(quantity);

    if (!productId) {
      setErrorMsg(t('select_product_prompt'));
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      setErrorMsg(t('qty_greater_than_zero'));
      return;
    }

    if (selectedProduct && qty > selectedProduct.estoqueAtual) {
      setErrorMsg(`${t('qty_greater_than_stock')} (${selectedProduct.estoqueAtual} ${selectedProduct.unidade}s).`);
      return;
    }

    withdrawStock(productId, qty, motivo);
    setSubView('none');
  };

  const reasons: { value: StockWithdrawalReason; label: string }[] = [
    { value: 'Consumo próprio', label: t('reason_own_consumption') },
    { value: 'Produto danificado', label: t('reason_damaged') },
    { value: 'Perda', label: t('reason_loss') },
    { value: 'Produto vencido', label: t('reason_expired') },
    { value: 'Outro', label: t('reason_other') }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('stock_withdrawal_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('stock_withdrawal_subtitle')}</p>
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
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({t('available_stock')}: {p.estoqueAtual} {p.unidade}s)
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>{t('shelf_stock_label')}:</span>
            <span className="font-black text-white">{selectedProduct.estoqueAtual} {selectedProduct.unidade}(s)</span>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('quantity_to_withdraw_label')} ({selectedProduct?.unidade || 'unidade'})
          </label>
          <input
            type="number"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ex: 1, 2, 5..."
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('withdrawal_reason_label')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setMotivo(r.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition cursor-pointer border ${
                  motivo === r.value
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {t('withdrawal_notice')}
        </p>

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
            id="btn-confirm-stock-withdrawal"
            className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            {t('confirm_withdrawal_btn')}
          </button>
        </div>
      </form>
    </div>
  );
};
