import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Send,
  Lock,
  History,
  FileCheck2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sale, DeliveryStatus } from '../types';

export const SellerSalesScreen: React.FC = () => {
  const {
    session,
    business,
    sales,
    deliveries,
    recordCashDelivery,
    closeShift,
    setSellerTab,
    showToast,
    formatCurrency,
    t
  } = useApp();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [valorEntregaInput, setValorEntregaInput] = useState('');
  const [obsEntregaInput, setObsEntregaInput] = useState('');

  // Seller's own sales (Data Isolation: never show other sellers' data!)
  const sellerId = session?.sellerId || '';
  const mySales = useMemo(() => {
    return sales.filter((s) => s.vendedorId === sellerId);
  }, [sales, sellerId]);

  // Today's sales
  const today = new Date().toISOString().split('T')[0];
  const mySalesToday = useMemo(() => {
    return mySales.filter((s) => s.data === today);
  }, [mySales, today]);

  // Totals
  const totalVendasQtd = mySales.length;
  const totalVendido = mySales.reduce((sum, s) => sum + s.total, 0);
  const lucroGerado = mySales.reduce((sum, s) => sum + s.lucro, 0);

  const totalVendidoHoje = mySalesToday.reduce((sum, s) => sum + s.total, 0);
  const lucroHoje = mySalesToday.reduce((sum, s) => sum + s.lucro, 0);

  // Deliveries for this seller
  const myDeliveries = useMemo(() => {
    return deliveries.filter((d) => d.vendedorId === sellerId);
  }, [deliveries, sellerId]);

  const totalEntregue = useMemo(() => {
    return myDeliveries.reduce((sum, d) => sum + d.valorEntregue, 0);
  }, [myDeliveries]);

  // Expected is the total of sales made
  const valorEsperado = totalVendido;
  const faltaEntregar = Math.max(0, valorEsperado - totalEntregue);
  const diferenca = valorEsperado - totalEntregue;

  // Determine current status
  const latestDelivery = myDeliveries[0];
  const isMarkedNotDelivered = latestDelivery?.status === 'NAO_ENTREGUE' && latestDelivery?.valorEntregue === 0;

  let currentStatus: DeliveryStatus = 'CONFERIDO';
  if (valorEsperado > 0) {
    if (isMarkedNotDelivered || totalEntregue === 0) {
      currentStatus = 'NAO_ENTREGUE';
    } else if (totalEntregue < valorEsperado) {
      currentStatus = 'PARCIAL';
    } else {
      currentStatus = 'CONFERIDO';
    }
  }

  // Handle Delivery Registration
  const handleRegisterDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorEntregaInput);
    if (isNaN(val) || val <= 0) {
      showToast(t('valid_delivery_amount_required'));
      return;
    }

    recordCashDelivery(sellerId, val, obsEntregaInput.trim());
    setValorEntregaInput('');
    setObsEntregaInput('');
    setShowDeliveryModal(false);
  };

  // Handle "Não entreguei ainda"
  const handleMarkNotDelivered = () => {
    recordCashDelivery(sellerId, 0, t('reported_not_delivered_yet'), true);
    setShowDeliveryModal(false);
  };

  // Handle Close Shift
  const handleConfirmCloseShift = () => {
    closeShift(sellerId);
    setShowCloseShiftModal(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              {t('seller_panel_badge')}
            </span>
            <h2 className="text-xl font-black text-white font-display">
              {t('my_sales_title')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {session?.userName} • {t('seller_sales_control_subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSellerTab('vender')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            + {t('btn_new_sale')}
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {/* Total Vendido */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('total_sold_label')}
            </span>
            <p className="text-lg font-black text-white font-display mt-0.5">
              {formatCurrency(totalVendido)}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('today_sales')}: {formatCurrency(totalVendidoHoje)}
            </span>
          </div>

          {/* Lucro Gerado */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('profit_generated_seller')}
            </span>
            <p className="text-lg font-black text-emerald-400 font-display mt-0.5">
              +{formatCurrency(lucroGerado)}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('today_sales')}: +{formatCurrency(lucroHoje)}
            </span>
          </div>

          {/* Quantidade de Vendas */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('sales_count_label')}
            </span>
            <p className="text-lg font-black text-white font-display mt-0.5">
              {totalVendasQtd}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              {t('today_sales')}: {mySalesToday.length} {t('sales_count')}
            </span>
          </div>

          {/* Ticket Médio */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('avg_ticket_label')}
            </span>
            <p className="text-lg font-black text-slate-200 font-display mt-0.5">
              {formatCurrency(totalVendasQtd > 0 ? Math.round(totalVendido / totalVendasQtd) : 0)}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">{t('per_sale_note')}</span>
          </div>
        </div>
      </div>

      {/* DINHEIRO A ENTREGAR CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display">
                {t('cash_to_deliver_title')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('cash_to_deliver_subtitle')}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {currentStatus === 'CONFERIDO' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('all_checked')}</span>
            </span>
          )}
          {currentStatus === 'PARCIAL' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('partial_delivery')}</span>
            </span>
          )}
          {currentStatus === 'NAO_ENTREGUE' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black">
              <Clock3 className="w-3.5 h-3.5" />
              <span>{t('cash_not_delivered')}</span>
            </span>
          )}
        </div>

        {/* Calculation breakdown: Esperado vs Entregue vs Falta */}
        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t('expected_amount')}
            </span>
            <p className="text-base font-black text-white font-display mt-0.5">
              {formatCurrency(valorEsperado)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t('delivered_money')}
            </span>
            <p className="text-base font-black text-emerald-400 font-display mt-0.5">
              {formatCurrency(totalEntregue)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t('pending_delivery')}
            </span>
            <p className={`text-base font-black font-display mt-0.5 ${faltaEntregar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(faltaEntregar)}
            </p>
          </div>
        </div>

        {/* Action Buttons: Registrar Entrega & Fechar Minhas Vendas */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            id="btn-register-delivery"
            onClick={() => setShowDeliveryModal(true)}
            className="py-3 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
            <span>{t('record_delivery_btn')}</span>
          </button>

          <button
            type="button"
            id="btn-close-shift"
            onClick={() => setShowCloseShiftModal(true)}
            className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>{t('close_shift_btn')}</span>
          </button>
        </div>

        {/* Delivery History */}
        {myDeliveries.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('deliveries_history_title')}</span>
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {myDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">
                      {del.valorEntregue > 0
                        ? formatCurrency(del.valorEntregue)
                        : t('reported_not_delivered_yet')}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {del.data} {del.hora}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      del.status === 'CONFERIDO'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : del.status === 'PARCIAL'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {del.status === 'CONFERIDO'
                      ? t('status_checked')
                      : del.status === 'PARCIAL'
                      ? t('status_partial')
                      : t('status_not_delivered')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED SALES LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white font-display">
              {t('sales_made_title')} ({mySales.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            {t('tap_to_view_details')}
          </span>
        </div>

        {mySales.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-700" />
            <p>{t('no_sales_by_seller')}</p>
            <p className="text-[11px] text-slate-600">
              {t('click_new_sale_to_start')}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {mySales.map((sale) => {
              const firstItem = sale.itens[0];
              const itemsText =
                sale.itens.length === 1
                  ? `${firstItem.nome} × ${firstItem.quantidade} ${firstItem.unidade}`
                  : `${firstItem.nome} + ${sale.itens.length - 1} ${t('other_items_note')}`;

              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{itemsText}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{sale.hora || '12:00'}</span>
                      </span>
                      <span>•</span>
                      <span>{sale.data}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">
                        {t('label_profit')}: +{formatCurrency(sale.lucro)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-cyan-400 font-display">
                      {formatCurrency(sale.total)}
                    </p>
                    <span className="text-[10px] text-slate-500">{sale.formaPagamento}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: DETALHES DA VENDA */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {t('sale_receipt_title')}
                </span>
                <h3 className="text-base font-black text-white font-display">
                  {selectedSale.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sale Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                {t('items_sold_title')}
              </span>
              {selectedSale.itens.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{item.nome}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.quantidade} {item.unidade} × {formatCurrency(item.precoVendaReal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      {t('label_profit')}: +{formatCurrency(item.lucro)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Time */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('time_label')}:</span>
                <span className="font-bold text-white">
                  {selectedSale.data} {selectedSale.hora || '12:00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('payment_method_label')}:</span>
                <span className="font-bold text-white">{selectedSale.formaPagamento}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>{t('sale_profit_label')}:</span>
                <span>+{formatCurrency(selectedSale.lucro)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                <span>{t('total_sale_label')}:</span>
                <span className="text-cyan-400">
                  {formatCurrency(selectedSale.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSale(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ENTREGA DE DINHEIRO */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    {t('deliver_cash_title')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('deliver_cash_subtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliveryModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>{t('total_sold_label')}:</span>
                <strong className="text-white">{formatCurrency(valorEsperado)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('already_delivered')}:</span>
                <strong className="text-emerald-400">{formatCurrency(totalEntregue)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('pending_delivery')}:</span>
                <strong className="text-amber-400">{formatCurrency(faltaEntregar)}</strong>
              </div>
            </div>

            <form onSubmit={handleRegisterDelivery} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('delivering_now_label')} ({business?.currency || 'MT'})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={valorEntregaInput}
                  onChange={(e) => setValorEntregaInput(e.target.value)}
                  placeholder={`Ex: ${faltaEntregar}`}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('delivery_note_optional')}
                </label>
                <input
                  type="text"
                  value={obsEntregaInput}
                  onChange={(e) => setObsEntregaInput(e.target.value)}
                  placeholder={t('delivery_note_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
                >
                  {t('confirm_delivery_btn')}
                </button>

                <button
                  type="button"
                  onClick={handleMarkNotDelivered}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-xs transition cursor-pointer"
                >
                  ⏳ {t('not_delivered_yet_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FECHAR MINHAS VENDAS (FECHAMENTO DE TURNO) */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    {t('shift_closing_title')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('shift_closing_subtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary details as explicitly mandated */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('sales_made_title')}:</span>
                <strong className="text-white text-sm">{totalVendasQtd}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('total_sold_label')}:</span>
                <strong className="text-white text-sm">{formatCurrency(totalVendido)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('profit_generated_seller')}:</span>
                <strong className="text-emerald-400 text-sm">+{formatCurrency(lucroGerado)}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">{t('cash_to_deliver_title')}:</span>
                <strong className="text-white">{formatCurrency(valorEsperado)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('delivered_money')}:</span>
                <strong className="text-emerald-400">{formatCurrency(totalEntregue)}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400 font-bold">{t('difference_label')}:</span>
                <strong className={diferenca > 0 ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
                  {formatCurrency(diferenca)}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              {t('shift_close_notice')}
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-confirm-close-shift"
                onClick={handleConfirmCloseShift}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                {t('confirm_shift_close_btn')}
              </button>

              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                {t('back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
