import React, { useState, useRef } from 'react';
import {
  X,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductUnit } from '../types';
import { processImageFile } from '../utils/imageUtils';

export const AddProductModal: React.FC = () => {
  const { business, addProduct, setSubView, t } = useApp();

  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState<ProductUnit>('unidade');
  const [precoCompra, setPrecoCompra] = useState<string>('');
  const [precoVendaSugerido, setPrecoVendaSugerido] = useState<string>('');
  const [quantidadeInicial, setQuantidadeInicial] = useState<string>('0');
  const [estoqueMinimo, setEstoqueMinimo] = useState<string>('5');
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await processImageFile(file);
      setFoto(compressed);
    } catch {
      setErrorMsg(t('error'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nome.trim()) {
      setErrorMsg(t('product_name_required'));
      return;
    }

    const custo = parseFloat(precoCompra);
    const venda = parseFloat(precoVendaSugerido);

    if (isNaN(custo) || custo < 0) {
      setErrorMsg(t('valid_cost_required'));
      return;
    }

    if (isNaN(venda) || venda < 0) {
      setErrorMsg(t('valid_price_required'));
      return;
    }

    const res = addProduct({
      nome: nome.trim(),
      unidade,
      precoCompra: custo,
      precoVendaSugerido: venda,
      quantidadeInicial: parseFloat(quantidadeInicial) || 0,
      estoqueMinimo: parseFloat(estoqueMinimo) || 5,
      foto
    });

    if (res.success) {
      setSubView('none');
    } else {
      setErrorMsg(t('save_error'));
    }
  };

  const unitOptions: { label: string; value: ProductUnit }[] = [
    { label: t('unit_unidade'), value: 'unidade' },
    { label: t('unit_kg'), value: 'kg' },
    { label: t('unit_saco'), value: 'saco' },
    { label: t('unit_caixa'), value: 'caixa' },
    { label: t('unit_pacote'), value: 'pacote' },
    { label: t('unit_garrafa'), value: 'garrafa' },
    { label: t('unit_litro'), value: 'litro' },
    { label: t('unit_outro'), value: 'outro' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white font-display">
            {t('new_product_title')}
          </h2>
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
        {/* Nome */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('product_name_label')}
          </label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={t('product_name_placeholder')}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Unidade */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('unit_measure_label')}
          </label>
          <select
            value={unidade}
            onChange={(e) => setUnidade(e.target.value as ProductUnit)}
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {unitOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preço de Custo e Venda */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('cost_label')} ({business?.currency || 'MT'})
            </label>
            <input
              type="number"
              step="any"
              required
              value={precoCompra}
              onChange={(e) => setPrecoCompra(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('sale_price_label')} ({business?.currency || 'MT'})
            </label>
            <input
              type="number"
              step="any"
              required
              value={precoVendaSugerido}
              onChange={(e) => setPrecoVendaSugerido(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Quantidade Inicial e Estoque Mínimo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('initial_stock_label')}
            </label>
            <input
              type="number"
              step="any"
              value={quantidadeInicial}
              onChange={(e) => setQuantidadeInicial(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('min_alert_label')}
            </label>
            <input
              type="number"
              step="any"
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(e.target.value)}
              placeholder="5"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Foto do Produto (Opcional) */}
        <div className="pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>{t('product_photo_optional')}</span>
            {foto && (
              <button
                type="button"
                onClick={() => setFoto(undefined)}
                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('remove_photo')}</span>
              </button>
            )}
          </label>

          {/* Hidden inputs for camera and gallery */}
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

          {foto ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 p-2 flex items-center space-x-3">
              <img
                src={foto}
                alt="Foto do produto"
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-400">{t('photo_added_success')} ✓</p>
                <p className="text-[11px] text-slate-400">{t('photo_visible_notice')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center space-x-2 text-xs font-bold transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t('take_photo')}</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-3 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center space-x-2 text-xs font-bold transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>{t('gallery')}</span>
              </button>
            </div>
          )}
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
            id="btn-save-new-product"
            className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            {t('save_product')}
          </button>
        </div>
      </form>
    </div>
  );
};
