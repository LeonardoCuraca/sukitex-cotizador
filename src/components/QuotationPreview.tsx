import React from 'react';
import type { QuotationDocument } from '../types/quotation';
import {
  calculateProductSubtotal,
  calculateQuotationTotals,
  formatMoney,
  formatSizeBreakdownSummary,
  numberToSpanishWords,
} from '../utils/calculations';

interface QuotationPreviewProps {
  doc: QuotationDocument;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const SukitexLogoSvg: React.FC<{ darkBg?: boolean; className?: string }> = ({
  darkBg = true,
  className = 'h-12',
}) => (
  <div className={`inline-flex items-center gap-3 select-none ${className}`}>
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="52"
        height="52"
        rx="10"
        fill={darkBg ? '#2A3329' : '#1F261E'}
        stroke="#EBA552"
        strokeWidth="2.2"
      />
      {/* Stylized textile weave / needle & thread monogram S */}
      <path
        d="M36 16H22C19.2386 16 17 18.2386 17 21V23.5C17 26.2614 19.2386 28.5 22 28.5H34C36.7614 28.5 39 30.7386 39 33.5V36C39 38.7614 36.7614 41 34 41H19"
        stroke="#EBA552"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M14 28.5H42"
        stroke={darkBg ? '#F8F5F1' : '#FFFFFF'}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <circle cx="37" cy="16" r="2.5" fill="#EBA552" />
      <circle cx="19" cy="41" r="2.5" fill="#EBA552" />
    </svg>
    <div className="flex flex-col">
      <span
        className={`text-2xl font-extrabold tracking-[0.22em] leading-none ${
          darkBg ? 'text-white' : 'text-[#1F261E]'
        }`}
      >
        {/** Brand Name */}
        SUKITEX
      </span>
      <span
        className={`text-[9.5px] uppercase tracking-[0.18em] mt-1 font-medium ${
          darkBg ? 'text-[#EBA552]' : 'text-[#9A6522]'
        }`}
      >
        Confección Corporativa
      </span>
    </div>
  </div>
);

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({ doc, previewRef }) => {
  const isCorporate = doc.theme === 'corporate';
  const isOrderMode = doc.mode === 'order';
  const totals = calculateQuotationTotals(doc);
  const enabledBanks = doc.bankAccounts.filter((b) => b.enabled);

  const taxLabel =
    doc.taxMode === 'plus_igv'
      ? `Más IGV (${doc.taxRate}%)`
      : doc.taxMode === 'inc_igv'
      ? `Incluye IGV (${doc.taxRate}%)`
      : 'Sin IGV (Valor Neto)';

  return (
    <div
      ref={previewRef}
      id="quotation-print-area"
      className="bg-white text-[#1F261E] w-[794px] min-h-[1123px] mx-auto shadow-2xl print:shadow-none flex flex-col justify-between font-sans text-[12px] leading-relaxed relative overflow-hidden"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* TOP CONTENT */}
      <div>
        {/* HEADER */}
        {isCorporate ? (
          <div className="bg-[#1F261E] text-white px-9 py-7 border-b-4 border-[#EBA552]">
            <div className="flex items-start justify-between gap-6">
              {/* Brand & Company Details */}
              <div className="flex-1">
                {doc.company.logoUrl ? (
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={doc.company.logoUrl}
                      alt={doc.company.brandName}
                      className="max-h-14 max-w-[200px] object-contain rounded bg-white/5 p-1"
                    />
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-[0.18em] text-white">
                        {doc.company.brandName}
                      </h1>
                      <p className="text-[10.5px] text-[#EBA552] uppercase tracking-wider font-medium">
                        {doc.company.tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <SukitexLogoSvg darkBg={true} />
                  </div>
                )}

                <div className="text-[11px] text-gray-300 space-y-0.5 mt-2">
                  <p className="font-semibold text-white">
                    {doc.company.legalName}{' '}
                    {doc.company.ruc && (
                      <span className="text-[#EBA552] font-mono ml-1.5">
                        · RUC: {doc.company.ruc}
                      </span>
                    )}
                  </p>
                  <p>{doc.company.address}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-300">
                    <span>Tel/WhatsApp: {doc.company.phone}</span>
                    <span>·</span>
                    <span>{doc.company.email}</span>
                    {doc.company.website && (
                      <>
                        <span>·</span>
                        <span>{doc.company.website}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Quotation Number Box */}
              <div className="bg-[#2A3329] border border-[#EBA552]/60 rounded-lg px-5 py-3.5 text-right min-w-[235px] shrink-0">
                <div className="text-[10px] uppercase tracking-[0.16em] text-[#EBA552] font-bold">
                  {isOrderMode ? 'Cotización Comercial B2B' : 'Tarifario / Cotización por Talla'}
                </div>
                <div className="text-xl font-extrabold tracking-wider text-white font-mono mt-0.5">
                  {doc.number || 'COT-0001'}
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10.5px] space-y-0.5 text-gray-300">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Fecha Emisión:</span>
                    <span className="font-medium text-white">{doc.issueDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Válido hasta:</span>
                    <span className="font-medium text-[#EBA552]">{doc.validUntilDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Moneda / Imp.:</span>
                    <span className="font-medium text-white">
                      {doc.currency === 'PEN' ? 'Soles (S/)' : 'Dólares (US$)'} · {taxLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CLEAN / ECO-PRINT HEADER */
          <div className="px-9 pt-7 pb-5 border-b-2 border-[#1F261E]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                {doc.company.logoUrl ? (
                  <div className="flex items-center gap-3.5 mb-2.5">
                    <img
                      src={doc.company.logoUrl}
                      alt={doc.company.brandName}
                      className="max-h-14 max-w-[200px] object-contain"
                    />
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-[0.18em] text-[#1F261E]">
                        {doc.company.brandName}
                      </h1>
                      <p className="text-[10.5px] text-[#9A6522] uppercase tracking-wider font-semibold">
                        {doc.company.tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-2.5">
                    <SukitexLogoSvg darkBg={false} />
                  </div>
                )}

                <div className="text-[11px] text-gray-700 space-y-0.5 mt-2">
                  <p className="font-bold text-[#1F261E]">
                    {doc.company.legalName}{' '}
                    {doc.company.ruc && (
                      <span className="font-mono text-gray-800 ml-1">
                        · RUC: {doc.company.ruc}
                      </span>
                    )}
                  </p>
                  <p>{doc.company.address}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-gray-600">
                    <span>Tel: {doc.company.phone}</span>
                    <span>·</span>
                    <span>{doc.company.email}</span>
                    {doc.company.website && (
                      <>
                        <span>·</span>
                        <span>{doc.company.website}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="border-2 border-[#1F261E] rounded-lg px-5 py-3 text-right min-w-[235px] shrink-0">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#9A6522] font-extrabold">
                  {isOrderMode ? 'Cotización Comercial B2B' : 'Tarifario / Cotización por Talla'}
                </div>
                <div className="text-xl font-extrabold tracking-wider text-[#1F261E] font-mono mt-0.5">
                  {doc.number || 'COT-0001'}
                </div>
                <div className="mt-2 pt-1.5 border-t border-gray-200 text-[10.5px] space-y-0.5 text-gray-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Emisión:</span>
                    <span className="font-semibold">{doc.issueDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Validez:</span>
                    <span className="font-semibold">{doc.validUntilDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Moneda:</span>
                    <span className="font-semibold">
                      {doc.currency === 'PEN' ? 'Soles (S/)' : 'Dólares (US$)'} ({taxLabel})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENT & PROJECT BAR */}
        <div className="px-9 py-4">
          <div
            className={`rounded-lg border p-3.5 grid grid-cols-12 gap-x-5 gap-y-2 ${
              isCorporate
                ? 'bg-[#F8F5F1] border-[#E5E0D8]'
                : 'bg-white border-gray-300'
            }`}
          >
            <div className="col-span-7 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                  Cliente:
                </span>
                <span className="font-bold text-[12.5px] text-[#1F261E]">
                  {doc.client.companyName || '—'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                  RUC / Doc.:
                </span>
                <span className="font-mono font-semibold text-gray-800">
                  {doc.client.ruc || '—'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                  Atención:
                </span>
                <span className="text-gray-800 font-medium">
                  {doc.client.contactName || '—'}
                  {doc.client.contactRole ? ` (${doc.client.contactRole})` : ''}
                </span>
              </div>
              {doc.client.address && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                    Dirección:
                  </span>
                  <span className="text-gray-700 text-[11px]">{doc.client.address}</span>
                </div>
              )}
            </div>

            <div className="col-span-5 space-y-1 border-l border-gray-300/80 pl-4">
              {doc.client.projectReference && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                    Proyecto:
                  </span>
                  <span className="font-semibold text-[#1F261E] text-[11.5px]">
                    {doc.client.projectReference}
                  </span>
                </div>
              )}
              {doc.client.phone && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                    Teléfono:
                  </span>
                  <span className="text-gray-700 text-[11px]">{doc.client.phone}</span>
                </div>
              )}
              {doc.client.email && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                    Correo:
                  </span>
                  <span className="text-gray-700 text-[11px]">{doc.client.email}</span>
                </div>
              )}
              {doc.salesperson && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 w-20 shrink-0">
                    Asesor B2B:
                  </span>
                  <span className="text-gray-800 font-medium text-[11px]">{doc.salesperson}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTS & VARIANTS / SIZES TABLE */}
        <div className="px-9">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Table Column Headers */}
            <div
              className={`grid grid-cols-12 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider ${
                isCorporate
                  ? 'bg-[#1F261E] text-white'
                  : 'bg-gray-100 text-[#1F261E] border-b border-gray-300'
              }`}
            >
              <div className={isOrderMode ? 'col-span-5' : 'col-span-6'}>
                Prenda / Ficha Técnica & Variantes de Acabado
              </div>
              <div className="col-span-3 text-center">Talla / Curva de Tallas</div>
              {isOrderMode ? (
                <>
                  <div className="col-span-1 text-center">Cant.</div>
                  <div className="col-span-1 text-right">P. Unit.</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </>
              ) : (
                <>
                  <div className="col-span-1 text-center">Escala</div>
                  <div className="col-span-2 text-right">Precio Unit.</div>
                </>
              )}
            </div>

            {/* Product Groups */}
            <div className="divide-y divide-gray-300">
              {doc.products.map((product, pIndex) => {
                const prodSub = calculateProductSubtotal(product);
                const hasSpecs =
                  product.showSpecs &&
                  (product.specs.fabric ||
                    product.specs.grammage ||
                    product.specs.composition ||
                    product.specs.colors ||
                    product.specs.finishing ||
                    product.specs.brandingSummary);

                return (
                  <div key={product.id} className="bg-white">
                    {/* Product Parent Header & Technical Specs */}
                    <div
                      className={`p-3.5 border-b border-gray-200 ${
                        isCorporate ? 'bg-[#FDFBF8]' : 'bg-gray-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                                isCorporate
                                  ? 'bg-[#1F261E] text-[#EBA552]'
                                  : 'bg-gray-800 text-white'
                              }`}
                            >
                              ÍTEM {String(pIndex + 1).padStart(2, '0')}
                            </span>
                            {product.code && (
                              <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded">
                                {product.code}
                              </span>
                            )}
                            {product.category && (
                              <span className="text-[10px] font-semibold text-[#9A6522] bg-[#FDF6EC] border border-[#EBA552]/40 px-2 py-0.5 rounded">
                                {product.category}
                              </span>
                            )}
                            <h3 className="text-[13px] font-extrabold text-[#1F261E]">
                              {product.name}
                            </h3>
                          </div>

                          {product.description && (
                            <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                              {product.description}
                            </p>
                          )}

                          {/* Technical Specs Grid */}
                          {hasSpecs && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 bg-white border border-gray-200 rounded px-2.5 py-1.5 text-[10.5px]">
                              {product.specs.fabric && (
                                <div>
                                  <span className="font-bold text-gray-500">Tela: </span>
                                  <span className="text-gray-800 font-medium">
                                    {product.specs.fabric}
                                  </span>
                                </div>
                              )}
                              {product.specs.grammage && (
                                <div>
                                  <span className="font-bold text-gray-500">Gramaje: </span>
                                  <span className="text-gray-800 font-medium">
                                    {product.specs.grammage}
                                  </span>
                                </div>
                              )}
                              {product.specs.composition && (
                                <div>
                                  <span className="font-bold text-gray-500">Composición: </span>
                                  <span className="text-gray-800 font-medium">
                                    {product.specs.composition}
                                  </span>
                                </div>
                              )}
                              {product.specs.colors && (
                                <div>
                                  <span className="font-bold text-gray-500">Colores: </span>
                                  <span className="text-gray-800 font-medium">
                                    {product.specs.colors}
                                  </span>
                                </div>
                              )}
                              {product.specs.finishing && (
                                <div className="col-span-2">
                                  <span className="font-bold text-gray-500">Confección/Acabado: </span>
                                  <span className="text-gray-800">{product.specs.finishing}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Optional Reference Image / Sketch */}
                        {product.imageUrl && (
                          <div className="w-20 h-20 rounded border border-gray-200 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Variant & Size Sub-rows */}
                    <div className="divide-y divide-gray-100">
                      {product.variants.map((v) => {
                        const rowTotal = (Number(v.quantity) || 0) * (Number(v.unitPrice) || 0);
                        const breakdownStr = v.useSizeCurve
                          ? formatSizeBreakdownSummary(v.sizeBreakdown)
                          : '';

                        return (
                          <div
                            key={v.id}
                            className="grid grid-cols-12 items-center px-3.5 py-2 text-[11.5px] hover:bg-gray-50/40"
                          >
                            <div className={`${isOrderMode ? 'col-span-5' : 'col-span-6'} pr-2`}>
                              <div className="flex items-start gap-1.5">
                                <span className="text-[#EBA552] font-bold mt-0.5">▸</span>
                                <div>
                                  <div className="font-semibold text-gray-800 leading-snug">
                                    {v.variantLabel || 'Estándar'}
                                  </div>
                                  {v.notes && (
                                    <div className="text-[10px] text-gray-500 italic">
                                      {v.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-3 text-center px-1">
                              <span className="inline-block bg-gray-100 border border-gray-300 text-[#1F261E] font-bold text-[10.5px] px-2 py-0.5 rounded">
                                {v.sizeLabel || 'S - M - L'}
                              </span>
                              {breakdownStr && (
                                <div className="text-[9.5px] font-mono text-gray-600 mt-0.5">
                                  ({breakdownStr})
                                </div>
                              )}
                            </div>

                            {isOrderMode ? (
                              <>
                                <div className="col-span-1 text-center font-mono font-semibold text-gray-800">
                                  {v.quantity}
                                </div>
                                <div className="col-span-1 text-right font-mono text-gray-700">
                                  {Number(v.unitPrice || 0).toFixed(2)}
                                </div>
                                <div className="col-span-2 text-right font-mono font-bold text-[#1F261E]">
                                  {formatMoney(rowTotal, doc.currency)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="col-span-1 text-center text-[10px] text-gray-500 font-medium">
                                  {v.minOrderLabel || (v.quantity ? `${v.quantity} und` : '—')}
                                </div>
                                <div className="col-span-2 text-right font-mono font-extrabold text-[#1F261E] text-[12px]">
                                  {formatMoney(v.unitPrice, doc.currency)}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Subtotal per Product (shown in Order mode if > 1 variant) */}
                    {isOrderMode && product.variants.length > 1 && (
                      <div className="grid grid-cols-12 items-center px-3.5 py-1.5 bg-gray-50 border-t border-gray-200 text-[10.5px]">
                        <div className="col-span-8 text-right font-semibold text-gray-500 pr-3">
                          Subtotal {product.name}:
                        </div>
                        <div className="col-span-1 text-center font-mono font-bold text-gray-700">
                          {prodSub.units} und
                        </div>
                        <div className="col-span-3 text-right font-mono font-bold text-gray-800">
                          {formatMoney(prodSub.amount, doc.currency)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY OR PRICELIST NOTE */}
        <div className="px-9 mt-4">
          {isOrderMode ? (
            <div className="grid grid-cols-12 gap-5 items-start">
              {/* Left Column: Amount in words + Total units + Advance payment schedule */}
              <div className="col-span-7 space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[10.5px] font-bold text-[#1F261E] tracking-wide">
                  {numberToSpanishWords(totals.grandTotal, doc.currency)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8F5F1] border border-[#E5E0D8] rounded-lg px-3.5 py-2 text-[11px]">
                  <div>
                    <span className="text-gray-600 font-medium">Volumen Total de Confección: </span>
                    <span className="font-extrabold text-[#1F261E] font-mono">
                      {totals.totalUnits} prendas
                    </span>{' '}
                    <span className="text-gray-500 text-[10px]">
                      ({totals.totalProducts} {totals.totalProducts === 1 ? 'modelo' : 'modelos'})
                    </span>
                  </div>

                  {doc.terms.showAdvanceCalculation && doc.terms.advancePercent > 0 && (
                    <div className="flex items-center gap-3 text-[10.5px] border-t sm:border-t-0 pt-1 sm:pt-0 border-gray-200">
                      <span>
                        <strong className="text-[#9A6522]">
                          Adelanto ({doc.terms.advancePercent}%):
                        </strong>{' '}
                        <span className="font-mono font-bold text-[#1F261E]">
                          {formatMoney(totals.advanceAmount, doc.currency)}
                        </span>
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>
                        <strong className="text-gray-600">
                          Contra entrega ({100 - doc.terms.advancePercent}%):
                        </strong>{' '}
                        <span className="font-mono font-semibold text-gray-800">
                          {formatMoney(totals.balanceAmount, doc.currency)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Totals Box */}
              <div className="col-span-5">
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="p-3 space-y-1.5 text-[11.5px] bg-white">
                    {totals.discount > 0 && (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Importe Bruto:</span>
                          <span className="font-mono">
                            {formatMoney(totals.rawLinesSum, doc.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>{doc.discountLabel || 'Descuento'}:</span>
                          <span className="font-mono">
                            - {formatMoney(totals.discount, doc.currency)}
                          </span>
                        </div>
                      </>
                    )}

                    {doc.taxMode !== 'no_igv' && (
                      <>
                        <div className="flex justify-between text-gray-700">
                          <span>Valor de Venta (Subtotal):</span>
                          <span className="font-mono font-semibold">
                            {formatMoney(totals.subtotalExclTax, doc.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>IGV ({doc.taxRate}%):</span>
                          <span className="font-mono font-semibold">
                            {formatMoney(totals.taxAmount, doc.currency)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className={`px-3.5 py-2.5 flex justify-between items-center ${
                      isCorporate
                        ? 'bg-[#1F261E] text-white'
                        : 'bg-gray-100 text-[#1F261E] border-t-2 border-[#1F261E]'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-[11.5px]">
                        Total Cotización
                      </span>
                      <span
                        className={`block text-[9.5px] ${
                          isCorporate ? 'text-[#EBA552]' : 'text-gray-600'
                        }`}
                      >
                        {taxLabel}
                      </span>
                    </div>
                    <span className="text-[16px] font-extrabold font-mono">
                      {formatMoney(totals.grandTotal, doc.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8F5F1] border border-[#E5E0D8] rounded-lg px-4 py-2.5 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-[#1F261E]">
                  Modalidad Tarifario / Precios Unitarios por Talla y Variante:
                </span>{' '}
                <span className="text-gray-700">
                  Los precios unitarios expresados en esta cotización están en{' '}
                  <strong>{doc.currency === 'PEN' ? 'Soles (S/)' : 'Dólares (US$)'}</strong> y son{' '}
                  <strong className="underline">{taxLabel}</strong>.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: COMMERCIAL TERMS, BANK ACCOUNTS & SIGNATURE */}
      <div className="px-9 pb-7 pt-4 mt-2">
        <div className="grid grid-cols-12 gap-5 items-end border-t border-gray-300 pt-4">
          {/* Commercial Terms & Bank Accounts */}
          <div className={doc.terms.showSignature ? 'col-span-8 space-y-3' : 'col-span-12 space-y-3'}>
            {/* Commercial Terms */}
            <div>
              <h4 className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#1F261E] mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EBA552] inline-block"></span>
                Condiciones Comerciales y de Producción
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10.5px] text-gray-700 bg-gray-50/80 border border-gray-200 rounded-lg p-2.5">
                {doc.terms.paymentTerms && (
                  <div className="col-span-2">
                    <span className="font-bold text-[#1F261E]">• Forma de Pago: </span>
                    <span>{doc.terms.paymentTerms}</span>
                  </div>
                )}
                {doc.terms.deliveryTime && (
                  <div className="col-span-2">
                    <span className="font-bold text-[#1F261E]">• Plazo de Entrega: </span>
                    <span>{doc.terms.deliveryTime}</span>
                  </div>
                )}
                {doc.terms.deliveryPlace && (
                  <div className="col-span-2">
                    <span className="font-bold text-[#1F261E]">• Entrega / Envío: </span>
                    <span>{doc.terms.deliveryPlace}</span>
                  </div>
                )}
                {doc.terms.warrantyAndSamples && (
                  <div className="col-span-2">
                    <span className="font-bold text-[#1F261E]">• Muestras y Garantía: </span>
                    <span>{doc.terms.warrantyAndSamples}</span>
                  </div>
                )}
                {doc.terms.additionalNotes && (
                  <div className="col-span-2 text-gray-600 italic pt-0.5">
                    <span className="font-bold not-italic text-gray-700">• Notas: </span>
                    {doc.terms.additionalNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Bank Accounts */}
            {doc.terms.showBankAccounts && enabledBanks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F261E] mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1F261E] inline-block"></span>
                  Cuentas Bancarias Autorizadas ({doc.company.legalName})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {enabledBanks.map((bank) => (
                    <div
                      key={bank.id}
                      className="border border-gray-200 rounded px-2.5 py-1.5 bg-white text-[9.5px]"
                    >
                      <div className="font-extrabold text-[#1F261E] truncate">{bank.bankName}</div>
                      <div className="text-gray-500 text-[9px]">{bank.accountType}</div>
                      <div className="font-mono font-bold text-gray-800 mt-0.5">
                        N°: {bank.accountNumber}
                      </div>
                      {bank.cci && (
                        <div className="font-mono text-gray-600 text-[9px]">CCI: {bank.cci}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signature Block */}
          {doc.terms.showSignature && (
            <div className="col-span-4 flex flex-col items-center justify-end text-center pt-4">
              {doc.company.signatureUrl ? (
                <img
                  src={doc.company.signatureUrl}
                  alt="Firma autorizada"
                  className="max-h-20 object-contain mb-1"
                />
              ) : (
                <div className="h-14 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xl text-gray-400 select-none">
                    {doc.company.brandName}
                  </span>
                </div>
              )}
              <div className="w-48 border-t border-[#1F261E] pt-1.5">
                <div className="font-bold text-[11px] text-[#1F261E]">
                  {doc.company.signerName || doc.salesperson}
                </div>
                <div className="text-[9.5px] text-gray-500">{doc.company.signerRole}</div>
                <div className="text-[9px] font-mono text-[#9A6522] font-semibold mt-0.5">
                  {doc.company.phone} · {doc.company.email}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="mt-4 pt-2.5 border-t border-gray-200 flex items-center justify-between text-[9.5px] text-gray-500">
          <span>
            <strong>{doc.company.brandName}</strong> — Especialistas en Confección de Prendas Corporativas, Industriales y Publicitarias.
          </span>
          <span className="font-mono">
            {doc.company.website} | {doc.company.phone}
          </span>
        </div>
      </div>
    </div>
  );
};
