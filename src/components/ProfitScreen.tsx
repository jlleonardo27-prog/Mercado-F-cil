import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../services/storage';

type PeriodFilter = 'hoje' | 'ontem' | '7dias' | 'mes';

export const ProfitScreen: React.FC = () => {
  const {
    sales,
    expenses,
    setSubView,
    formatCurrency,
    t
  } = useApp();

  const [period, setPeriod] = useState<PeriodFilter>('hoje');

  const now = new Date();
  const todayStr = formatDate(now);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // Filter items by period
  const filterByDate = (dateStr: string) => {
    if (period === 'hoje') {
      return dateStr === todayStr;
    }
    if (period === 'ontem') {
      return dateStr === yesterdayStr;
    }
    if (period === '7dias') {
      const itemDate = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (period === 'mes') {
      const itemDate = new Date(dateStr);
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  };

  const periodSales = sales.filter((s) => filterByDate(s.data));
  const periodExpenses = expenses.filter((e) => filterByDate(e.data));

  // 1. Total vendido
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);

  // 2. Custo dos produtos
  const totalCost = periodSales.reduce((sum, s) => sum + s.custoTotal, 0);

  // 3. Lucro bruto
  const grossProfit = totalRevenue - totalCost;

  // 4. Despesas
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.valor, 0);

  // 5. Lucro líquido
  const netProfit = grossProfit - totalExpenses;

  const isPositive = netProfit >= 0;

  const getPeriodLabel = () => {
    switch (period) {
      case 'hoje': return t('period_today');
      case 'ontem': return 'Ontem';
      case '7dias': return t('period_week');
      case 'mes': return t('period_month');
      default: return '';
    }
  };

  return (
    <div className="space-y-4 pb-16 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-display">
            {t('profit_report_title')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('profit_report_subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubView('despesas')}
          className="py-2 px-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center space-x-1.5 hover:bg-amber-500/30 transition cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t('btn_new_expense')}</span>
        </button>
      </div>

      {/* Period Filter Buttons */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl space-x-1">
        <button
          type="button"
          onClick={() => setPeriod('hoje')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
            period === 'hoje'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('period_today')}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('7dias')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
            period === '7dias'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('period_week')}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('mes')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
            period === 'mes'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('period_month')}
        </button>
      </div>

      {/* BIG NET PROFIT HERO CARD */}
      <div
        className={`rounded-3xl p-5 border shadow-2xl space-y-2 ${
          isPositive
            ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-500/30'
            : 'bg-gradient-to-br from-rose-950/70 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-400">
            {t('net_profit_final')} ({getPeriodLabel()})
          </span>
          {isPositive ? (
            <span className="flex items-center space-x-1 font-extrabold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>{t('net_profit_label')}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 font-extrabold text-rose-400">
              <TrendingDown className="w-4 h-4" />
              <span>{t('net_loss_label')}</span>
            </span>
          )}
        </div>

        <div className="py-1">
          <p
            className={`text-3xl font-black font-display tracking-tight ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netProfit, { showPlus: true })}
          </p>
        </div>

        <p className="text-xs text-slate-400">
          {t('net_profit_final')} • {periodSales.length} {t('sales_count_label')}
        </p>
      </div>

      {/* THE 5 PILLARS BREAKDOWN */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('details')} ({getPeriodLabel()})
        </h3>

        <div className="space-y-2.5 text-xs">
          {/* 1. Total vendido */}
          <div className="bg-slate-950 p-3 rounded-2xl flex items-center justify-between border border-slate-800/80">
            <div>
              <p className="font-bold text-white">{t('gross_revenue')}</p>
            </div>
            <span className="text-sm font-black text-white">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          {/* 2. Custo dos produtos */}
          <div className="bg-slate-950 p-3 rounded-2xl flex items-center justify-between border border-slate-800/80">
            <div>
              <p className="font-bold text-slate-300">{t('goods_cost')}</p>
            </div>
            <span className="text-sm font-black text-rose-400">
              - {formatCurrency(totalCost)}
            </span>
          </div>

          {/* 3. Lucro bruto */}
          <div className="bg-slate-950 p-3 rounded-2xl flex items-center justify-between border border-emerald-500/20">
            <div>
              <p className="font-bold text-emerald-400">{t('gross_profit')}</p>
            </div>
            <span className="text-sm font-black text-emerald-400">
              {formatCurrency(grossProfit, { showPlus: true })}
            </span>
          </div>

          {/* 4. Despesas */}
          <div className="bg-slate-950 p-3 rounded-2xl flex items-center justify-between border border-slate-800/80">
            <div>
              <p className="font-bold text-amber-400">{t('operating_expenses')}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-400">
                - {formatCurrency(totalExpenses)}
              </span>
              <p className="text-[10px] text-slate-500">{periodExpenses.length} lancamentos</p>
            </div>
          </div>

          {/* 5. Lucro líquido */}
          <div className="bg-emerald-950/20 p-3.5 rounded-2xl flex items-center justify-between border border-emerald-500/30">
            <div>
              <p className="font-extrabold text-white text-sm">{t('net_profit_final')}</p>
            </div>
            <span className={`text-base font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netProfit, { showPlus: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Helper Advice */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          {t('profit_report_subtitle')}
        </p>
      </div>
    </div>
  );
};
