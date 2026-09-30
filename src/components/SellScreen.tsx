import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, PaymentMethod } from '../types';

interface CartItemState {
  product: Product;
  quantity: number;
  precoVendaReal: number;
}

export const SellScreen: React.FC = () => {
  const {
    business,
    products,
    recordSale,
    isOwner,
    isSeller,
    setActiveTab,
    setSellerTab,
    formatCurrency,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItemState[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');
  const [observacao] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available products
  const availableProducts = products.filter(
    (p) => p.ativo && p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    setErrorMsg(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          precoVendaReal: product.precoVendaSugerido
        }
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItemState[]
    );
  };

  const updatePrice = (productId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, precoVendaReal: Number(newPrice) || 0 }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setErrorMsg(null);
  };

  // Totals calculations
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.precoVendaReal * item.quantity,
    0
  );

  const totalCost = cart.reduce(
    (sum, item) => sum + item.product.precoCompra * item.quantity,
    0
  );

  const totalProfit = totalAmount - totalCost;

  // Confirm Sale
  const handleConfirmSale = () => {
    setErrorMsg(null);
    if (cart.length === 0) {
      setErrorMsg(t('add_at_least_one_product'));
      return;
    }

    // Check stock warning
    for (const item of cart) {
      if (item.quantity > item.product.estoqueAtual) {
        setErrorMsg(
          t('insufficient_stock_error', {
            name: item.product.nome,
            available: item.product.estoqueAtual,
            unit: item.product.unidade
          })
        );
        return;
      }
    }

    const saleItems = cart.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      precoVendaReal: i.precoVendaReal
    }));

    const res = recordSale(saleItems, paymentMethod, observacao);
    if (res.success) {
      clearCart();
      if (isSeller) {
        setSellerTab('inicio');
      } else {
        setActiveTab('inicio');
      }
    } else {
      setErrorMsg(res.error || t('error'));
    }
  };

  const paymentOptions: { id: PaymentMethod; labelKey: string }[] = [
    { id: 'Dinheiro', labelKey: 'method_cash' },
    { id: 'M-Pesa', labelKey: 'method_mpesa' },
    { id: 'e-Mola', labelKey: 'method_emola' },
    { id: 'Outro', labelKey: 'method_other' }
  ];

  return (
    <div className="space-y-4 pb-16 animate-in fade-in">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-display">
            {t('record_sale')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('sell_subtitle')}
          </p>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
          >
            {t('clear_cart')}
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Product Search & Quick Picker */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_product_placeholder')}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Add Chips (First 5 products) */}
        {searchTerm === '' && availableProducts.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {availableProducts.slice(0, 5).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p)}
                className="shrink-0 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
              >
                {p.foto ? (
                  <img src={p.foto} alt="" className="w-5 h-5 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <Plus className="w-3 h-3 text-emerald-400" />
                )}
                <span className="truncate max-w-[120px]">{p.nome}</span>
                <span className="text-[10px] text-slate-400">
                  ({formatCurrency(p.precoVendaSugerido)})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CART ITEMS CONTAINER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('sale_items')} ({cart.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {t('sale_subtotal')}: {formatCurrency(totalAmount)}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-500">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-xs">{t('empty_cart_title')}</p>
            <p className="text-[11px] text-slate-600">
              {t('empty_cart_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => {
              const itemSubtotal = item.precoVendaReal * item.quantity;
              const itemProfit = isOwner
                ? (item.precoVendaReal - item.product.precoCompra) * item.quantity
                : 0;

              return (
                <div
                  key={item.product.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black text-white">{item.product.nome}</p>
                      <p className="text-[11px] text-slate-400">
                        {t('available_in_stock')}: {item.product.estoqueAtual} {item.product.unidade}(s)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity and Price Negotiator Row */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-900">
                    {/* Quantity Stepper */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('quantity_label')} ({item.product.unidade})
                      </label>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-black text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Negotiated Unit Price */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 truncate">
                        {t('real_unit_price')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.precoVendaReal}
                        onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-black text-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Item Subtotal & Owner Profit Visibility */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-medium">
                      {t('sale_subtotal')}: <strong className="text-white">{formatCurrency(itemSubtotal)}</strong>
                    </span>

                    {/* Owner only sees margin */}
                    {isOwner && (
                      <span className={`text-[11px] font-bold ${itemProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {itemProfit >= 0 ? `${t('margin_profit')}: ${formatCurrency(itemProfit, { showPlus: true })}` : `${t('margin_loss')}: ${formatCurrency(itemProfit)}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Method & Checkout Bar */}
      {cart.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t('payment_method_label')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                    paymentMethod === opt.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-950 p-3 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t('total_to_receive')}:</span>
              <span className="text-xl font-black text-white font-display">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* If Owner: show Net Profit of Sale */}
            {isOwner && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                <span className="text-slate-500 font-bold">{t('net_profit_this_sale')}:</span>
                <span className={`font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(totalProfit, { showPlus: true })}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            id="btn-confirm-sale"
            onClick={handleConfirmSale}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('btn_confirm_sale')}</span>
          </button>
        </div>
      )}

      {/* Available Products Quick List to Click and Add */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('catalog_quick_sale')}
        </h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {availableProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-white">{p.nome}</p>
                <p className="text-[11px] text-slate-400">
                  {t('nav_stock')}: <strong className="text-emerald-400">{p.estoqueAtual}</strong> {p.unidade}(s)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-emerald-400">
                  {formatCurrency(p.precoVendaSugerido)}
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
