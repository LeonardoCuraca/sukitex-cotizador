import type { CurrencyCode, ProductItem, QuotationDocument, SizeBreakdown } from '../types/quotation';
import { SIZE_KEYS } from '../types/quotation';

export function formatMoney(amount: number, currency: CurrencyCode = 'PEN'): string {
  const symbol = currency === 'PEN' ? 'S/' : 'US$';
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${symbol} ${safeAmount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function sumSizeBreakdown(breakdown: SizeBreakdown): number {
  return SIZE_KEYS.reduce((acc, key) => acc + (Number(breakdown[key]) || 0), 0);
}

export function formatSizeBreakdownSummary(breakdown: SizeBreakdown): string {
  const parts: string[] = [];
  for (const key of SIZE_KEYS) {
    const qty = Number(breakdown[key]) || 0;
    if (qty > 0) {
      parts.push(`${key}: ${qty}`);
    }
  }
  return parts.join(' · ');
}

export interface QuotationTotals {
  totalUnits: number;
  totalProducts: number;
  totalVariants: number;
  rawLinesSum: number;
  discount: number;
  subtotalExclTax: number;
  taxAmount: number;
  grandTotal: number;
  advanceAmount: number;
  balanceAmount: number;
}

export function calculateQuotationTotals(doc: QuotationDocument): QuotationTotals {
  let totalUnits = 0;
  let totalVariants = 0;
  let rawLinesSum = 0;

  for (const prod of doc.products) {
    for (const v of prod.variants) {
      totalVariants += 1;
      const qty = Math.max(0, Number(v.quantity) || 0);
      const price = Math.max(0, Number(v.unitPrice) || 0);
      totalUnits += qty;
      rawLinesSum += qty * price;
    }
  }

  const discount = Math.max(0, Number(doc.discountAmount) || 0);
  const afterDiscount = Math.max(0, rawLinesSum - discount);
  const rate = (Number(doc.taxRate) || 18) / 100;

  let subtotalExclTax = 0;
  let taxAmount = 0;
  let grandTotal = 0;

  if (doc.taxMode === 'plus_igv') {
    subtotalExclTax = afterDiscount;
    taxAmount = subtotalExclTax * rate;
    grandTotal = subtotalExclTax + taxAmount;
  } else if (doc.taxMode === 'inc_igv') {
    grandTotal = afterDiscount;
    subtotalExclTax = grandTotal / (1 + rate);
    taxAmount = grandTotal - subtotalExclTax;
  } else {
    subtotalExclTax = afterDiscount;
    taxAmount = 0;
    grandTotal = afterDiscount;
  }

  const advPct = Math.min(100, Math.max(0, Number(doc.terms.advancePercent) || 50));
  const advanceAmount = grandTotal * (advPct / 100);
  const balanceAmount = grandTotal - advanceAmount;

  return {
    totalUnits,
    totalProducts: doc.products.length,
    totalVariants,
    rawLinesSum,
    discount,
    subtotalExclTax,
    taxAmount,
    grandTotal,
    advanceAmount,
    balanceAmount,
  };
}

export function calculateProductSubtotal(product: ProductItem): { units: number; amount: number } {
  let units = 0;
  let amount = 0;
  for (const v of product.variants) {
    const q = Math.max(0, Number(v.quantity) || 0);
    const p = Math.max(0, Number(v.unitPrice) || 0);
    units += q;
    amount += q * p;
  }
  return { units, amount };
}

const UNIDADES = [
  '',
  'UN',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
  'VEINTE',
];

const DECENAS = [
  '',
  'DIEZ',
  'VEINTE',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA',
];

const CENTENAS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS',
];

function convertGroupToWords(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  let output = '';
  const c = Math.floor(n / 100);
  const rem = n % 100;
  if (c > 0) {
    output += CENTENAS[c] + ' ';
  }
  if (rem > 0) {
    if (rem <= 20) {
      output += UNIDADES[rem];
    } else if (rem < 30) {
      output += 'VEINTI' + UNIDADES[rem - 20];
    } else {
      const d = Math.floor(rem / 10);
      const u = rem % 10;
      output += DECENAS[d] + (u > 0 ? ' Y ' + UNIDADES[u] : '');
    }
  }
  return output.trim();
}

export function numberToSpanishWords(amount: number, currency: CurrencyCode): string {
  const safe = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const integerPart = Math.floor(safe);
  const cents = Math.round((safe - integerPart) * 100);
  const centsStr = String(cents).padStart(2, '0');
  const currencyLabel = currency === 'PEN' ? 'SOLES' : 'DÓLARES AMERICANOS';

  if (integerPart === 0) {
    return `SON: CERO Y ${centsStr}/100 ${currencyLabel}`;
  }

  const millions = Math.floor(integerPart / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const hundreds = integerPart % 1_000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('UN MILLÓN');
    } else {
      parts.push(`${convertGroupToWords(millions)} MILLONES`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('MIL');
    } else {
      parts.push(`${convertGroupToWords(thousands)} MIL`);
    }
  }

  if (hundreds > 0) {
    parts.push(convertGroupToWords(hundreds));
  }

  return `SON: ${parts.join(' ')} Y ${centsStr}/100 ${currencyLabel}`;
}
