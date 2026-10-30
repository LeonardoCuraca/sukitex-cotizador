export type QuotationMode = 'order' | 'pricelist';
export type TaxMode = 'plus_igv' | 'inc_igv' | 'no_igv';
export type CurrencyCode = 'PEN' | 'USD';
export type ThemeStyle = 'corporate' | 'clean';

export interface SizeBreakdown {
  XS?: number;
  S?: number;
  M?: number;
  L?: number;
  XL?: number;
  XXL?: number;
  XXXL?: number;
}

export const SIZE_KEYS: (keyof SizeBreakdown)[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export interface ProductVariantRow {
  id: string;
  variantLabel: string;
  sizeLabel: string;
  useSizeCurve: boolean;
  sizeBreakdown: SizeBreakdown;
  quantity: number;
  minOrderLabel: string;
  unitPrice: number;
  notes?: string;
}

export interface GarmentSpecs {
  fabric: string;
  grammage: string;
  composition: string;
  colors: string;
  finishing: string;
  brandingSummary: string;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  specs: GarmentSpecs;
  showSpecs: boolean;
  imageUrl?: string;
  variants: ProductVariantRow[];
}

export interface CompanyInfo {
  brandName: string;
  tagline: string;
  legalName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  signatureUrl?: string;
  signerName: string;
  signerRole: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  cci: string;
  holder: string;
  enabled: boolean;
}

export interface ClientInfo {
  id?: string;
  companyName: string;
  ruc: string;
  contactName: string;
  contactRole: string;
  phone: string;
  email: string;
  address: string;
  projectReference: string;
}

export interface CommercialTerms {
  paymentTerms: string;
  advancePercent: number;
  deliveryTime: string;
  deliveryPlace: string;
  validityDays: string;
  warrantyAndSamples: string;
  additionalNotes: string;
  showBankAccounts: boolean;
  showSignature: boolean;
  showAdvanceCalculation: boolean;
}

export interface QuotationDocument {
  id: string;
  number: string;
  issueDate: string;
  validUntilDate: string;
  salesperson: string;
  mode: QuotationMode;
  taxMode: TaxMode;
  taxRate: number;
  currency: CurrencyCode;
  discountAmount: number;
  discountLabel: string;
  theme: ThemeStyle;
  company: CompanyInfo;
  bankAccounts: BankAccount[];
  client: ClientInfo;
  products: ProductItem[];
  terms: CommercialTerms;
  updatedAt: string;
}
