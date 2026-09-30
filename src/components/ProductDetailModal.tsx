import React, { useState, useRef } from 'react';
import {
  X,
  Package,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { processImageFile } from '../utils/imageUtils';

export const ProductDetailModal: React.FC = () => {
  const {
    business,
    products,
    sales,
    stockMovements,
    selectedProductId,
    setSelectedProductId,
    setSubView,
    updateProduct,
    deleteProduct,
    formatCurrency,
    t
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId);

  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState(product?.nome || '');
  const [editPrecoCompra, setEditPrecoCompra] = useState(product?.precoCompra.toString() || '');
  const [editPrecoVenda, setEditPrecoVenda] = useState(product?.precoVendaSugerido.toString() || '');
  const [editEstoqueMin, setEditEstoqueMin] = useState(product?.estoqueMinimo.toString() || '');
  const [editFoto, setEditFoto] = useState<string | undefined>(product?.foto);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await processImageFile(file);
      setEditFoto(compressed);
    } catch {
      // ignore
    }
  };

  if (!product) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
        <p className="text-slate-400 text-sm">{t('no_products_found')}</p>
        <button
          type="button"
          onClick={() => setSubView('none')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  // Calculate Product Performance Metrics across all sales
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  let totalCostSold = 0;
  let totalProfit = 0;

  sales.forEach((s) => {
    s.itens.forEach((item) => {
      if (item.produtoId === product.id) {
        totalUnitsSold += item.quantidade;
        totalRevenue += item.subtotal;
        totalCostSold += item.custoTotal;
        totalProfit += item.lucro;
      }
    });
  });

  // Filter movements for this product
  const movements = stockMovements.filter((m) => m.produtoId === product.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const custo = parseFloat(editPrecoCompra);
    const venda = parseFloat(editPrecoVenda);
    const min = parseFloat(editEstoqueMin);

    if (!editNome.trim() || isNaN(custo) || isNaN(venda)) return;

    updateProduct({
      ...product,
      nome: editNome.trim(),
      precoCompra: custo,
      precoVendaSugerido: venda,
      estoqueMinimo: isNaN(min) ? 5 : min,
      foto: editFoto
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    setSelectedProductId(null);
    setSubView('none');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          {product.foto ? (
            <img
              src={product.foto}
              alt={product.nome}
              className="w-12 h-12 rounded-2xl object-cover bg-slate-800 border border-slate-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
          )}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t('product_sheet')}
            </span>
            <h2 className="text-lg font-black text-white font-display">
              {product.nome}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedProductId(null);
            setSubView('none');
          }}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Buttons for this product */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSubView('entrada_estoque')}
          className="py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>+ {t('add_stock_action')}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('retirada_estoque')}
          className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>- {t('remove_stock_action')}</span>
        </button>
      </div>

      {/* Current Stock and Pricing Pill */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{t('current_stock_label')}</p>
          <p className="text-xl font-black text-white font-display">
            {product.estoqueAtual}
          </p>
          <p className="text-[10px] text-slate-400">{product.unidade}(s)</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{t('cost_price_label')}</p>
          <p className="text-base font-black text-slate-300 font-display">
            {formatCurrency(product.precoCompra)}
          </p>
          <p className="text-[10px] text-slate-500">{t('unit_cost_note')}</p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{t('suggested_price_label')}</p>
          <p className="text-base font-black text-emerald-400 font-display">
            {formatCurrency(product.precoVendaSugerido)}
          </p>
          <p className="text-[10px] text-slate-500">{t('table_price_note')}</p>
        </div>
      </div>

      {/* Financial Performance of this product */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{t('product_performance_title')}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('total_sold_label')}</span>
            <span className="text-sm font-black text-white">
              {totalUnitsSold} {product.unidade}(s)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('total_revenue_label')}</span>
            <span className="text-sm font-black text-white">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('sales_cost_label')}</span>
            <span className="text-sm font-black text-slate-300">
              {formatCurrency(totalCostSold)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('realized_profit_label')}</span>
            <span className={`text-sm font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? `+${formatCurrency(totalProfit)}` : formatCurrency(totalProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form or Toggle */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase">{t('edit_product_title')}</h4>
          <div>
            <label className="text-[11px] text-slate-400 block font-bold">{t('product_name_label')}</label>
            <input
              type="text"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block font-bold">{t('cost_price_label')} ({business?.currency || 'MT'})</label>
              <input
                type="number"
                step="any"
                value={editPrecoCompra}
                onChange={(e) => setEditPrecoCompra(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block font-bold">{t('suggested_price_label')} ({business?.currency || 'MT'})</label>
              <input
                type="number"
                step="any"
                value={editPrecoVenda}
                onChange={(e) => setEditPrecoVenda(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-black"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block font-bold mb-1 flex items-center justify-between">
              <span>{t('product_photo_optional')}</span>
              {editFoto && (
                <button
                  type="button"
                  onClick={() => setEditFoto(undefined)}
                  className="text-rose-400 text-[10px] font-bold cursor-pointer"
                >
                  {t('remove_photo')}
                </button>
              )}
            </label>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="flex items-center space-x-2">
              {editFoto ? (
                <img
                  src={editFoto}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-800"
                />
              ) : null}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>{t('take_photo')}</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-sky-400" />
                <span>{t('gallery')}</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('edit_prices_name')}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Movement History for this product */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t('movements_history_title')}
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {movements.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">{t('empty_movements')}</p>
          ) : (
            movements.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className={`font-bold ${m.quantidade > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade} {m.unidade}(s)
                  </span>
                  <p className="text-[10px] text-slate-500">{m.motivo || m.tipo} • {m.usuarioNome}</p>
                </div>
                <span className="text-[10px] text-slate-500">{m.data} {m.hora}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
