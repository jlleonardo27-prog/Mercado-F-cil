import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Copy,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SellersManagerScreen: React.FC = () => {
  const {
    business,
    sellers,
    sales,
    deliveries,
    closures,
    addSeller,
    updateSeller,
    deleteSeller,
    confirmDeliveryByOwner,
    setSubView,
    showToast,
    formatCurrency,
    t
  } = useApp();

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(t('sellers_name_required'));
      return;
    }

    if (!pin || pin.length < 4) {
      setErrorMsg(t('sellers_pin_min_digits'));
      return;
    }

    const res = addSeller(name, pin, phone);
    if (res.success) {
      setName('');
      setPin('');
      setPhone('');
      setIsAdding(false);
      showToast(`${t('sellers_created_toast')} "${name.trim()}"!`);
    } else {
      setErrorMsg(res.error || t('save_error'));
    }
  };

  const copyMarketCode = () => {
    if (business?.code) {
      navigator.clipboard?.writeText(business.code);
      showToast(`${t('team_code_label')} ${business.code} ${t('copied')}`);
    }
  };

  // Calculate detailed financial & delivery metrics per seller
  const getSellerMetrics = (sellerId: string) => {
    const sellerSales = sales.filter((s) => s.vendedorId === sellerId);
    const totalSold = sellerSales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = sellerSales.reduce((sum, s) => sum + s.lucro, 0);
    const count = sellerSales.length;

    const sellerDeliveries = deliveries.filter((d) => d.vendedorId === sellerId);
    const totalDelivered = sellerDeliveries.reduce((sum, d) => sum + d.valorEntregue, 0);

    const valorEsperado = totalSold;
    const faltaEntregar = Math.max(0, valorEsperado - totalDelivered);

    const latestDelivery = sellerDeliveries[0];
    const isMarkedNotDelivered = latestDelivery?.status === 'NAO_ENTREGUE' && latestDelivery?.valorEntregue === 0;

    let status: 'CONFERIDO' | 'PARCIAL' | 'NAO_ENTREGUE' = 'CONFERIDO';
    if (valorEsperado > 0) {
      if (isMarkedNotDelivered || totalDelivered === 0) {
        status = 'NAO_ENTREGUE';
      } else if (totalDelivered < valorEsperado) {
        status = 'PARCIAL';
      } else {
        status = 'CONFERIDO';
      }
    }

    const sellerClosures = closures.filter((c) => c.vendedorId === sellerId);
    const latestClosure = sellerClosures[0];

    return {
      sellerSales,
      sellerDeliveries,
      totalSold,
      totalProfit,
      count,
      valorEsperado,
      totalDelivered,
      faltaEntregar,
      status,
      latestClosure
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('sellers_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('sellers_subtitle')}</p>
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

      {/* Market Connection Card for Team */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            {t('team_code_label')}
          </span>
          <p className="text-xl font-mono font-black text-cyan-400">
            {business?.code}
          </p>
          <p className="text-[10px] text-slate-400">
            {t('team_code_helper')}
          </p>
        </div>
        <button
          type="button"
          onClick={copyMarketCode}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
          title={t('btn_copy')}
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Add Seller Form or Button */}
      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ {t('btn_register_seller')}</span>
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase">{t('new_seller_title')}</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              {t('seller_name_label')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria José, Carlos..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                PIN (4 {t('digits')})
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 1234"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-center tracking-widest text-sm font-black focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('seller_phone_optional')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 84..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer"
          >
            {t('save')}
          </button>
        </form>
      )}

      {/* Sellers List with full Cash Delivery and Profit details */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('sellers_control_title')} ({sellers.length})
        </h3>

        {sellers.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">
            {t('no_sellers_registered')}
          </p>
        ) : (
          sellers.map((seller) => {
            const metrics = getSellerMetrics(seller.id);
            const isExpanded = expandedSellerId === seller.id;

            return (
              <div
                key={seller.id}
                className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 space-y-3"
              >
                {/* Top Row: Name, Status and Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-black text-white">{seller.name}</p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          seller.active
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {seller.active ? t('status_active') : t('status_inactive')}
                      </span>
                      {metrics.latestClosure && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-400 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{t('shift_closed')}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PIN: <span className="font-mono text-cyan-400">••••</span>
                      {seller.phone && ` • ${seller.phone}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => updateSeller({ ...seller, active: !seller.active })}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                    >
                      {seller.active ? t('btn_deactivate') : t('btn_activate')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteSeller(seller.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Financial Overview Grid for this seller */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {t('total_sold_seller')}
                    </span>
                    <p className="text-sm font-black text-white font-display mt-0.5">
                      {formatCurrency(metrics.totalSold)}
                    </p>
                    <span className="text-[10px] text-slate-400">{metrics.count} {t('sales_count')}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {t('profit_generated_seller')}
                    </span>
                    <p className="text-sm font-black text-emerald-400 font-display mt-0.5">
                      +{formatCurrency(metrics.totalProfit)}
                    </p>
                    <span className="text-[10px] text-slate-400">{t('by_seller_note')}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {t('delivered_money')}
                    </span>
                    <p className="text-sm font-black text-white font-display mt-0.5">
                      {formatCurrency(metrics.totalDelivered)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {t('expected_amount')}: {formatCurrency(metrics.valorEsperado)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {t('pending_delivery')}
                    </span>
                    <p className={`text-sm font-black font-display mt-0.5 ${metrics.faltaEntregar > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(metrics.faltaEntregar)}
                    </p>
                    <span className="text-[10px] text-slate-400">{t('difference_label')}</span>
                  </div>
                </div>

                {/* Delivery Status Banner and Confirmation Button */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-bold">{t('cash_status_label')}:</span>
                    {metrics.status === 'CONFERIDO' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-black">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('all_checked')}</span>
                      </span>
                    )}
                    {metrics.status === 'PARCIAL' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-black">
                        <AlertCircle className="w-3 h-3" />
                        <span>{t('pending_amount')} {formatCurrency(metrics.faltaEntregar)}</span>
                      </span>
                    )}
                    {metrics.status === 'NAO_ENTREGUE' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-xs font-black">
                        <Clock3 className="w-3 h-3" />
                        <span>{t('cash_not_delivered')}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {metrics.faltaEntregar > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          confirmDeliveryByOwner(seller.id);
                          showToast(`${t('delivery_from')} ${seller.name} ${t('confirmed')}!`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-black flex items-center space-x-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t('confirm_receipt')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedSellerId(isExpanded ? null : seller.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{isExpanded ? t('hide_details') : t('view_detailed_sales')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Sales list and Cash Deliveries */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 space-y-3 animate-in fade-in">
                    {/* Deliveries History */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('seller_deliveries_record')} ({metrics.sellerDeliveries.length})
                      </span>
                      {metrics.sellerDeliveries.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">{t('no_deliveries_yet')}</p>
                      ) : (
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {metrics.sellerDeliveries.map((del) => (
                            <div
                              key={del.id}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-white">
                                  {del.valorEntregue > 0
                                    ? formatCurrency(del.valorEntregue)
                                    : t('reported_not_delivered_yet')}
                                </span>
                                <span className="text-slate-500 ml-2">
                                  {del.data} {del.hora}
                                </span>
                                {del.observacao && (
                                  <p className="text-[10px] text-slate-400">{del.observacao}</p>
                                )}
                              </div>
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  del.status === 'CONFERIDO'
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : del.status === 'PARCIAL'
                                    ? 'text-amber-400 bg-amber-500/10'
                                    : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {del.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sales by this seller */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('seller_sales_record')} ({metrics.sellerSales.length})
                      </span>
                      {metrics.sellerSales.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">{t('no_sales_by_seller')}</p>
                      ) : (
                        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                          {metrics.sellerSales.map((sale) => (
                            <div
                              key={sale.id}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-white">
                                  {sale.itens.map((it) => `${it.nome} (${it.quantidade} ${it.unidade})`).join(', ')}
                                </span>
                                <p className="text-[10px] text-slate-500">
                                  {sale.data} {sale.hora || '12:00'} • {sale.formaPagamento}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-cyan-400">
                                  {formatCurrency(sale.total)}
                                </p>
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  {t('label_profit')}: +{formatCurrency(sale.lucro)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
