import React from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Clock,
  User,
  ChevronRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../services/storage';
import { getPlanName } from '../services/plansService';

export const Dashboard: React.FC = () => {
  const {
    business,
    products,
    sales,
    setActiveTab,
    setSubView,
    setSelectedProductId,
    accessStatus,
    daysRemaining,
    planType,
    expiryDateDisplay,
    expirationWarning,
    openBuyPlanModal,
    openReferralModal,
    formatCurrency,
    t
  } = useApp();

  const todayStr = formatDate();

  // Metrics for Today
  const todaysSales = sales.filter((s) => s.data === todayStr);
  const revenueToday = todaysSales.reduce((sum, s) => sum + s.total, 0);
  const profitToday = todaysSales.reduce((sum, s) => sum + s.lucro, 0);
  const salesCountToday = todaysSales.length;

  // Total stock items and distinct active products
  const totalStockUnits = products
    .filter((p) => p.ativo)
    .reduce((sum, p) => sum + p.estoqueAtual, 0);
  const activeProductsCount = products.filter((p) => p.ativo).length;

  // Low stock products
  const lowStockProducts = products.filter(
    (p) => p.ativo && p.estoqueAtual <= p.estoqueMinimo
  );

  return (
    <div className="space-y-4 pb-12 animate-in fade-in">
      {/* Expiration Warning Alert (3 days, 1 day, or expired) */}
      {expirationWarning && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-200 leading-snug">
                {expirationWarning}
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {t('days_remaining')}: <strong className="text-amber-300">{daysRemaining} {daysRemaining === 1 ? t('day_singular') : t('days_plural')}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openBuyPlanModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shrink-0 cursor-pointer shadow-md text-center"
          >
            {t('choose_plan')}
          </button>
        </div>
      )}

      {/* MEU ACESSO STATUS CARD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              {t('my_access')}
            </h3>
          </div>
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              accessStatus === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : accessStatus === 'TRIAL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {accessStatus === 'TRIAL' ? t('plan_status_trial') : accessStatus === 'ACTIVE' ? t('plan_status_active') : t('plan_status_expired')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('plan_type_label')}</span>
            <span className="text-xs font-black text-white block mt-0.5 truncate">
              {getPlanName(planType)}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('days_remaining')}</span>
            <span className={`text-xs font-black block mt-0.5 ${daysRemaining <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {daysRemaining > 0 ? `${daysRemaining} ${t('days_plural')}` : t('plan_status_expired')}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('expires_in')}</span>
            <span className="text-xs font-black text-slate-200 block mt-0.5 truncate">
              {expiryDateDisplay}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={openBuyPlanModal}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20"
          >
            <span>{daysRemaining <= 0 ? t('buy_access') : t('renew_plan')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={openReferralModal}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1 border border-amber-500/20"
            title={t('invite_friends_bonus')}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{t('plus_days')}</span>
          </button>
        </div>
      </div>

      {/* Title Header: Meu Mercado */}
      <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/20 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {t('dashboard_owner_panel')}
            </span>
            <h2 className="text-xl font-extrabold text-white font-display">
              {business?.name || t('market_name')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('team_code')}: <span className="font-mono text-emerald-400 font-bold">{business?.code}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('vender')}
            className="py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 transition cursor-pointer uppercase"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('nav_sell')}</span>
          </button>
        </div>
      </div>

      {/* TELA VAZIA DE NOVO MERCADO */}
      {products.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-dashed border-emerald-500/40 rounded-3xl p-6 text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white font-display">
              {t('empty_market_title')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t('empty_market_desc')}
            </p>
          </div>
          <button
            type="button"
            id="btn-empty-add-product"
            onClick={() => setSubView('novo_produto')}
            className="py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 inline-flex items-center space-x-2 transition cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('btn_add_first_product')}</span>
          </button>
        </div>
      )}

      {/* PRIMARY 3 METRICS: Vendas de hoje, Lucro de hoje, Estoque atual */}
      <div className="grid grid-cols-3 gap-2">
        {/* Vendas de hoje */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">{t('today_sales')}</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <p className="text-base font-black text-white font-display leading-tight truncate">
            {formatCurrency(revenueToday)}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {salesCountToday} {salesCountToday === 1 ? t('sales_count_singular') : t('sales_count_plural')}
          </p>
        </div>

        {/* Lucro de hoje */}
        <div className={`rounded-2xl p-3 space-y-1 border ${
          profitToday >= 0
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-rose-950/40 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">{t('today_profit')}</span>
            <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <p className={`text-base font-black font-display leading-tight truncate ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(profitToday, { showPlus: true })}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {profitToday >= 0 ? t('net_profit_label') : t('net_loss_label')}
          </p>
        </div>

        {/* Estoque atual */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">{t('current_stock')}</span>
            <Package className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </div>
          <p className="text-base font-black text-white font-display leading-tight truncate">
            {totalStockUnits.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{t('items_count')}</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {activeProductsCount} {activeProductsCount === 1 ? t('product_singular') : t('product_plural')}
          </p>
        </div>
      </div>

      {/* Fast Action Buttons Grid */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-3.5 space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {t('quick_actions')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSubView('novo_produto')}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center space-x-2.5 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('action_add_product')}</p>
              <p className="text-[10px] text-slate-400">{t('action_add_product_desc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSubView('entrada_estoque')}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center space-x-2.5 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('action_stock_entry')}</p>
              <p className="text-[10px] text-slate-400">{t('action_stock_entry_desc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSubView('retirada_estoque')}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center space-x-2.5 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('action_stock_withdrawal')}</p>
              <p className="text-[10px] text-slate-400">{t('action_stock_withdrawal_desc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lucro')}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center space-x-2.5 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('action_profit_panel')}</p>
              <p className="text-[10px] text-slate-400">{t('action_profit_panel_desc')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* ESTOQUE BAIXO: Somente os produtos que atingiram ou ficaram abaixo do estoque mínimo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-extrabold text-xs uppercase tracking-wider">
                {t('low_stock_alert')} ({lowStockProducts.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('estoque')}
              className="text-[11px] text-amber-400 hover:underline font-bold"
            >
              {t('see_stock')}
            </button>
          </div>

          <div className="space-y-2">
            {lowStockProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{prod.nome}</p>
                  <p className="text-[11px] text-slate-400">
                    {t('stock_remaining')}: <span className="font-black text-amber-400">{prod.estoqueAtual}</span> {prod.unidade}(s) • {t('min_stock_label')}: {prod.estoqueMinimo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    setSubView('entrada_estoque');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition cursor-pointer"
                >
                  {t('btn_restock')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÚLTIMAS VENDAS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('recent_sales')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSubView('historico')}
            className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center space-x-1"
          >
            <span>{t('see_all')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            {t('no_sales_today')}
          </div>
        ) : (
          <div className="space-y-2.5">
            {sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5"
              >
                {/* Vendedor and Hora header */}
                <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-extrabold text-white">{sale.vendedorNome}</span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-800">
                      {sale.formaPagamento}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{sale.hora}</span>
                </div>

                {/* Products, Quantities, and Prices list */}
                <div className="space-y-1">
                  {sale.itens.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        {item.nome} <span className="text-slate-500 font-mono">× {item.quantidade}</span>
                      </span>
                      <span className="text-slate-200 font-bold">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sale Total & Net Profit */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                  <div className="text-slate-400">
                    {t('sale_total')}: <strong className="text-white font-black text-sm">{formatCurrency(sale.total)}</strong>
                  </div>
                  <span className={`text-xs font-black ${sale.lucro >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(sale.lucro, { showPlus: true })} {t('sale_profit_suffix')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
