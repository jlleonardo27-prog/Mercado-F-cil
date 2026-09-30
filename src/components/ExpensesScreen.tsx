import React, { useState } from 'react';
import {
  X,
  Receipt,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExpenseCategory } from '../types';

export const ExpensesScreen: React.FC = () => {
  const {
    business,
    expenses,
    addExpense,
    deleteExpense,
    setSubView,
    formatCurrency,
    t
  } = useApp();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<ExpenseCategory>('Transporte');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: 'Transporte', label: t('cat_transport') },
    { value: 'Energia / Água', label: t('cat_energy_water') },
    { value: 'Aluguel', label: t('cat_rent') },
    { value: 'Salários / Ajudante', label: t('cat_salaries') },
    { value: 'Embalagens / Sacolas', label: t('cat_packaging') },
    { value: 'Manutenção', label: t('cat_maintenance') },
    { value: 'Outro', label: t('cat_other') }
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const val = parseFloat(valor);
    if (isNaN(val) || val <= 0) {
      setErrorMsg(t('valid_expense_amount_required'));
      return;
    }

    if (!descricao.trim()) {
      setErrorMsg(t('expense_description_required'));
      return;
    }

    const res = addExpense(descricao.trim(), val, categoria);
    if (res.success) {
      setDescricao('');
      setValor('');
      setIsAdding(false);
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.valor, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-display">
              {t('expenses_title')}
            </h2>
            <p className="text-[11px] text-slate-400">{t('expenses_subtitle')}</p>
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

      {/* Summary Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold">{t('total_expenses_label')}</span>
          <p className="text-xl font-black text-amber-400 font-display">
            {formatCurrency(totalExpenseSum)}
          </p>
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
          >
            + {t('new_expense_btn')}
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase">{t('record_expense_title')}</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {t('cancel')}
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              {t('expense_description_label')}
            </label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={t('expense_desc_placeholder')}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('amount_label')} ({business?.currency || 'MT'})
              </label>
              <input
                type="number"
                step="any"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-sm font-black focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                {t('category_label')}
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
          >
            {t('save_expense_btn')}
          </button>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {expenses.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">
            {t('empty_expenses')}
          </p>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{exp.descricao}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {exp.categoria}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {exp.data} {exp.hora && `${exp.hora}`} • {t('by_user')} {exp.criadoPor}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-amber-400">
                  - {formatCurrency(exp.valor)}
                </span>
                <button
                  type="button"
                  onClick={() => deleteExpense(exp.id)}
                  className="p-1 rounded text-slate-600 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
