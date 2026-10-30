import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ImagePlus,
  Layers,
  Plus,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  BookmarkPlus,
  X,
} from 'lucide-react';
import type {
  CurrencyCode,
  ProductItem,
  ProductVariantRow,
  QuotationMode,
  SizeBreakdown,
} from '../types/quotation';
import { SIZE_KEYS } from '../types/quotation';
import { SIZE_QUICK_PRESETS, VARIANT_QUICK_PRESETS } from '../data/presets';
import {
  calculateProductSubtotal,
  formatMoney,
  sumSizeBreakdown,
} from '../utils/calculations';

interface ProductEditorCardProps {
  product: ProductItem;
  index: number;
  totalProducts: number;
  mode: QuotationMode;
  currency: CurrencyCode;
  onUpdate: (updated: ProductItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaveAsPreset: (product: ProductItem) => void;
}

export const ProductEditorCard: React.FC<ProductEditorCardProps> = ({
  product,
  index,
  totalProducts,
  mode,
  currency,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSaveAsPreset,
}) => {
  const [specsOpen, setSpecsOpen] = useState<boolean>(false);
  const [activePresetRowId, setActivePresetRowId] = useState<string | null>(null);

  const isOrderMode = mode === 'order';
  const prodTotals = calculateProductSubtotal(product);

  const handleFieldChange = <K extends keyof ProductItem>(field: K, value: ProductItem[K]) => {
    onUpdate({
      ...product,
      [field]: value,
    });
  };

  const handleSpecChange = (field: keyof ProductItem['specs'], value: string) => {
    onUpdate({
      ...product,
      specs: {
        ...product.specs,
        [field]: value,
      },
    });
  };

  const handleVariantChange = <K extends keyof ProductVariantRow>(
    variantId: string,
    field: K,
    value: ProductVariantRow[K]
  ) => {
    onUpdate({
      ...product,
      variants: product.variants.map((v) =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    });
  };

  const handleSizeBreakdownChange = (
    variantId: string,
    sizeKey: keyof SizeBreakdown,
    qtyValue: number
  ) => {
    onUpdate({
      ...product,
      variants: product.variants.map((v) => {
        if (v.id !== variantId) return v;
        const nextBreakdown: SizeBreakdown = {
          ...v.sizeBreakdown,
          [sizeKey]: qtyValue > 0 ? qtyValue : undefined,
        };
        const totalQty = sumSizeBreakdown(nextBreakdown);
        return {
          ...v,
          sizeBreakdown: nextBreakdown,
          quantity: totalQty > 0 ? totalQty : v.quantity,
        };
      }),
    });
  };

  const addVariantRow = (custom?: Partial<ProductVariantRow>) => {
    const lastRow = product.variants[product.variants.length - 1];
    const newRow: ProductVariantRow = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      variantLabel:
        custom?.variantLabel ??
        lastRow?.variantLabel ??
        'Estándar · Con 1 bordado en pecho izq.',
      sizeLabel: custom?.sizeLabel ?? 'S - M - L',
      useSizeCurve: custom?.useSizeCurve ?? false,
      sizeBreakdown: custom?.sizeBreakdown ?? {},
      quantity: custom?.quantity ?? 20,
      minOrderLabel: custom?.minOrderLabel ?? 'Mín. 20 und',
      unitPrice: custom?.unitPrice ?? (lastRow ? Number(lastRow.unitPrice) : 35),
      notes: custom?.notes ?? '',
    };
    onUpdate({
      ...product,
      variants: [...product.variants, newRow],
    });
  };

  const duplicateVariantAsSpecialSize = (row: ProductVariantRow) => {
    const nextSize = row.sizeLabel.includes('XL') ? 'XXL' : 'XL';
    const basePrice = Number(row.unitPrice) || 0;
    addVariantRow({
      variantLabel: row.variantLabel,
      sizeLabel: nextSize,
      useSizeCurve: false,
      sizeBreakdown: {},
      quantity: Math.max(2, Math.round((row.quantity || 10) * 0.15)),
      minOrderLabel: 'A pedido',
      unitPrice: Number((basePrice + 3.5).toFixed(2)),
      notes: `Talla especial ${nextSize}`,
    });
  };

  const generateStandardSizeScale = () => {
    const baseRow = product.variants[0];
    const basePrice = baseRow ? Number(baseRow.unitPrice) || 35 : 35;
    const baseVariant =
      baseRow?.variantLabel || 'Estándar · Con 1 bordado computarizado en pecho izq.';

    const generated: ProductVariantRow[] = [
      {
        id: `var-${Date.now()}-sml`,
        variantLabel: baseVariant,
        sizeLabel: 'S - M - L',
        useSizeCurve: true,
        sizeBreakdown: { S: 10, M: 20, L: 15 },
        quantity: 45,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: basePrice,
        notes: 'Tallas estándar corporativas',
      },
      {
        id: `var-${Date.now()}-xl`,
        variantLabel: baseVariant,
        sizeLabel: 'XL',
        useSizeCurve: false,
        sizeBreakdown: { XL: 5 },
        quantity: 5,
        minOrderLabel: 'A pedido',
        unitPrice: Number((basePrice + 3).toFixed(2)),
        notes: 'Talla especial XL',
      },
      {
        id: `var-${Date.now()}-xxl`,
        variantLabel: baseVariant,
        sizeLabel: 'XXL',
        useSizeCurve: false,
        sizeBreakdown: { XXL: 2 },
        quantity: 2,
        minOrderLabel: 'A pedido',
        unitPrice: Number((basePrice + 6).toFixed(2)),
        notes: 'Talla especial XXL',
      },
    ];

    onUpdate({
      ...product,
      variants: generated,
    });
  };

  const removeVariantRow = (variantId: string) => {
    if (product.variants.length <= 1) return;
    onUpdate({
      ...product,
      variants: product.variants.filter((v) => v.id !== variantId),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleFieldChange('imageUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-[#EBA552]/70">
      {/* Top Bar of Product Card */}
      <div className="bg-[#1F261E] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#EBA552] text-[#1F261E] text-xs font-extrabold font-mono px-2 py-0.5 rounded">
            PRENDA #{index + 1}
          </span>
          <input
            type="text"
            value={product.code}
            onChange={(e) => handleFieldChange('code', e.target.value)}
            placeholder="Código (ej. POL-01)"
            className="bg-white/10 text-white placeholder-gray-400 text-xs font-mono px-2 py-1 rounded border border-white/15 focus:outline-none focus:border-[#EBA552] w-28"
          />
          <input
            type="text"
            value={product.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            placeholder="Categoría (ej. Polos)"
            className="bg-white/10 text-[#EBA552] placeholder-gray-400 text-xs font-medium px-2 py-1 rounded border border-white/15 focus:outline-none focus:border-[#EBA552] w-36 hidden sm:block"
          />
        </div>

        <div className="flex items-center gap-1">
          {isOrderMode && (
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded text-gray-200 mr-1">
              {prodTotals.units} und ·{' '}
              <strong className="text-[#EBA552]">
                {formatMoney(prodTotals.amount, currency)}
              </strong>
            </span>
          )}
          <button
            type="button"
            onClick={() => onSaveAsPreset(product)}
            title="Guardar esta prenda en mi catálogo de plantillas"
            className="p-1.5 text-gray-300 hover:text-[#EBA552] hover:bg-white/10 rounded transition"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Subir prenda"
            className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 hover:bg-white/10 rounded transition"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalProducts - 1}
            title="Bajar prenda"
            className="p-1.5 text-gray-300 hover:text-white disabled:opacity-30 hover:bg-white/10 rounded transition"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicar prenda completa"
            className="p-1.5 text-gray-300 hover:text-[#EBA552] hover:bg-white/10 rounded transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar prenda"
            className="p-1.5 text-red-300 hover:text-red-400 hover:bg-white/10 rounded transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Garment Info */}
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full space-y-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Nombre de la Prenda / Producto
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Ej. Polo Camisero Piqué Corporativo 24/1 Reactivo"
                className="w-full px-3 py-2 text-sm font-bold text-[#1F261E] bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EBA552] focus:bg-white"
              />
            </div>

            <div>
              <input
                type="text"
                value={product.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Descripción breve (ej. Confeccionado en Piqué doble fijado, no destiñe ni encoge...)"
                className="w-full px-3 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#EBA552] focus:bg-white"
              />
            </div>
          </div>

          {/* Image Upload Box */}
          <div className="shrink-0 flex items-center gap-2">
            {product.imageUrl ? (
              <div className="relative w-20 h-20 border border-gray-300 rounded-lg bg-gray-50 p-1 flex items-center justify-center group">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleFieldChange('imageUrl', undefined)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
                  title="Quitar imagen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 hover:border-[#EBA552] rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-[#9A6522] transition bg-gray-50/50 text-center p-1">
                <ImagePlus className="w-5 h-5 mb-1" />
                <span className="text-[9.5px] font-semibold leading-tight">Foto / Boceto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Technical Sheet Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8F5F1] px-3 py-2 rounded-lg border border-[#E5E0D8]">
          <button
            type="button"
            onClick={() => setSpecsOpen(!specsOpen)}
            className="flex items-center gap-2 text-xs font-bold text-[#1F261E] hover:text-[#9A6522]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9A6522]" />
            <span>
              Ficha Técnica Textil (Tela, Gramaje, Composición, Costura)
            </span>
            {specsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={product.showSpecs}
              onChange={(e) => handleFieldChange('showSpecs', e.target.checked)}
              className="rounded border-gray-300 text-[#1F261E] focus:ring-[#EBA552]"
            />
            <span className="font-medium">Mostrar ficha técnica en PDF</span>
          </label>
        </div>

        {/* Collapsible Technical Specs Inputs */}
        {specsOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 mb-0.5">
                Tela / Tejido:
              </label>
              <input
                type="text"
                value={product.specs.fabric}
                onChange={(e) => handleSpecChange('fabric', e.target.value)}
                placeholder="Ej. Piqué Lacoste 24/1 Reactivo"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-0.5">
                Gramaje / Densidad:
              </label>
              <input
                type="text"
                value={product.specs.grammage}
                onChange={(e) => handleSpecChange('grammage', e.target.value)}
                placeholder="Ej. 210 gr/m²"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-0.5">
                Composición:
              </label>
              <input
                type="text"
                value={product.specs.composition}
                onChange={(e) => handleSpecChange('composition', e.target.value)}
                placeholder="Ej. 100% Algodón Peruano Reactivo"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-0.5">
                Colores:
              </label>
              <input
                type="text"
                value={product.specs.colors}
                onChange={(e) => handleSpecChange('colors', e.target.value)}
                placeholder="Ej. Azul Marino, Negro, Blanco..."
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-600 mb-0.5">
                Detalles de Costura, Avíos y Acabado:
              </label>
              <input
                type="text"
                value={product.specs.finishing}
                onChange={(e) => handleSpecChange('finishing', e.target.value)}
                placeholder="Ej. Cuello y puños tejidos antipilling, tapete en hombro, 3 botones al tono..."
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
              />
            </div>
          </div>
        )}

        {/* SUB-ROWS: VARIANTS (BORDADOS/ESTAMPADOS) & SIZES */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1F261E] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#9A6522]" />
              Sub-filas de Variantes (Bordados / Estampados) y Precios por Talla
            </span>

            <button
              type="button"
              onClick={generateStandardSizeScale}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A6522] bg-[#FDF6EC] hover:bg-[#EBA552]/25 border border-[#EBA552]/50 px-2.5 py-1 rounded-md transition"
              title="Reemplaza las sub-filas con el esquema estándar S-M-L + XL + XXL"
            >
              <Sparkles className="w-3 h-3" />
              Generar escala S-M-L / XL / XXL
            </button>
          </div>

          <div className="space-y-2.5">
            {product.variants.map((v, vIdx) => {
              const rowTotal = (Number(v.quantity) || 0) * (Number(v.unitPrice) || 0);
              const isPresetMenuOpen = activePresetRowId === v.id;

              return (
                <div
                  key={v.id}
                  className="p-3 rounded-lg border border-gray-200 bg-gray-50/70 hover:bg-white hover:border-gray-300 transition space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-start">
                    {/* Variant / Customization Description */}
                    <div className="col-span-12 sm:col-span-5">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          Variante #{vIdx + 1} (Bordado / Estampado / Corte)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setActivePresetRowId(isPresetMenuOpen ? null : v.id)
                          }
                          className="text-[10px] font-semibold text-[#9A6522] hover:underline"
                        >
                          {isPresetMenuOpen ? 'Cerrar opciones' : '+ Elegir plantilla'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={v.variantLabel}
                        onChange={(e) =>
                          handleVariantChange(v.id, 'variantLabel', e.target.value)
                        }
                        placeholder="Ej. Con 1 bordado en pecho izq. (8cm)"
                        className="w-full px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
                      />
                    </div>

                    {/* Size / Size Range */}
                    <div className="col-span-5 sm:col-span-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">
                          Talla(s)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleVariantChange(v.id, 'useSizeCurve', !v.useSizeCurve)
                          }
                          className={`text-[10px] font-semibold flex items-center gap-0.5 px-1.5 rounded ${
                            v.useSizeCurve
                              ? 'bg-[#1F261E] text-[#EBA552]'
                              : 'text-gray-500 hover:text-[#1F261E]'
                          }`}
                          title="Desglosar cantidades exactas por talla (XS, S, M, L, XL...)"
                        >
                          <Ruler className="w-2.5 h-2.5" />
                          Curva
                        </button>
                      </div>
                      <input
                        type="text"
                        value={v.sizeLabel}
                        onChange={(e) =>
                          handleVariantChange(v.id, 'sizeLabel', e.target.value)
                        }
                        placeholder="S - M - L, XL..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-center text-[#1F261E] bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
                      />
                    </div>

                    {/* Quantity OR Min Order Scale */}
                    {isOrderMode ? (
                      <div className="col-span-3 sm:col-span-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5 text-center">
                          Cant.
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={v.quantity}
                          onChange={(e) =>
                            handleVariantChange(
                              v.id,
                              'quantity',
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                          className="w-full px-1.5 py-1.5 text-xs font-mono font-bold text-center bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
                        />
                      </div>
                    ) : (
                      <div className="col-span-3 sm:col-span-1">
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5 text-center">
                          Escala
                        </label>
                        <input
                          type="text"
                          value={v.minOrderLabel}
                          onChange={(e) =>
                            handleVariantChange(v.id, 'minOrderLabel', e.target.value)
                          }
                          placeholder="Mín 20"
                          className="w-full px-1.5 py-1.5 text-[11px] text-center bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
                        />
                      </div>
                    )}

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5 text-right">
                        P. Unit ({currency === 'PEN' ? 'S/' : '$'})
                      </label>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={v.unitPrice}
                        onChange={(e) =>
                          handleVariantChange(
                            v.id,
                            'unitPrice',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs font-mono font-bold text-right text-[#1F261E] bg-white border border-gray-300 rounded focus:outline-none focus:border-[#EBA552]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 sm:col-span-1 flex sm:flex-col items-center justify-end gap-1 pt-1 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => duplicateVariantAsSpecialSize(v)}
                        title="Crear fila de talla especial (XL / XXL) basada en esta variante"
                        className="text-[10px] font-bold px-1.5 py-1 rounded bg-[#FDF6EC] text-[#9A6522] border border-[#EBA552]/40 hover:bg-[#EBA552]/30 transition w-full text-center"
                      >
                        +XL
                      </button>
                      {product.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantRow(v.id)}
                          title="Eliminar esta sub-fila"
                          className="text-gray-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Variant & Size Chips Drawer */}
                  {isPresetMenuOpen && (
                    <div className="p-2.5 bg-white border border-[#EBA552]/50 rounded-lg space-y-2 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Plantillas de Variante / Bordado / Estampado:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {VARIANT_QUICK_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                handleVariantChange(v.id, 'variantLabel', preset);
                                setActivePresetRowId(null);
                              }}
                              className="text-[10.5px] bg-gray-100 hover:bg-[#1F261E] hover:text-[#EBA552] text-gray-700 px-2 py-0.5 rounded transition text-left"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-gray-400 mb-1">
                          Tallas Rápidas:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {SIZE_QUICK_PRESETS.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleVariantChange(v.id, 'sizeLabel', sz)}
                              className="text-[10.5px] font-mono font-bold bg-gray-100 hover:bg-[#EBA552] hover:text-[#1F261E] text-gray-800 px-2 py-0.5 rounded transition"
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Size Curve Breakdown Mini-Calculator */}
                  {v.useSizeCurve && (
                    <div className="bg-white border border-gray-200 rounded-md p-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold text-[#1F261E] flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-[#9A6522]" />
                        Curva de Tallas (suma automática = {v.quantity} und):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SIZE_KEYS.map((szKey) => (
                          <div key={szKey} className="flex items-center bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                            <span className="text-[10px] font-extrabold text-gray-600 mr-1">
                              {szKey}:
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={v.sizeBreakdown[szKey] ?? ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleSizeBreakdownChange(
                                  v.id,
                                  szKey,
                                  Math.max(0, parseInt(e.target.value, 10) || 0)
                                )
                              }
                              className="w-10 text-center font-mono text-xs font-bold bg-white border border-gray-200 rounded py-0.5 focus:outline-none focus:border-[#EBA552]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom row: Optional Note & Row Subtotal */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <input
                      type="text"
                      value={v.notes || ''}
                      onChange={(e) => handleVariantChange(v.id, 'notes', e.target.value)}
                      placeholder="Nota opcional de esta variante (ej. Bordado hasta 8,000 puntadas, tela reactiva...)"
                      className="flex-1 text-[11px] text-gray-600 bg-transparent border-b border-dashed border-gray-300 focus:border-[#EBA552] focus:outline-none py-0.5"
                    />
                    {isOrderMode && (
                      <span className="text-xs font-mono font-bold text-[#1F261E] shrink-0">
                        Importe: {formatMoney(rowTotal, currency)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Variant Button */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => addVariantRow()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F261E] bg-[#F8F5F1] hover:bg-[#EBA552]/30 border border-[#E5E0D8] px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#9A6522]" />
              Agregar Variante / Talla a esta Prenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
