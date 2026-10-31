import type {
  BankAccount,
  CommercialTerms,
  CompanyInfo,
  ProductItem,
  QuotationDocument,
} from '../types/quotation';
import { SUKITEX_LOGO_DATA_URL } from './logoBase64';

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  brandName: 'SUKITEX S.A.C.',
  tagline: 'Fabricación de Prendas de Vestir',
  legalName: 'SUKITEX S.A.C.',
  ruc: '20608945123',
  address: 'Daniel A. Carrión 173, Lurigancho - Chosica, Lima - Perú',
  phone: '+51 948 669 513',
  email: 'ventas@sukitex.pe',
  website: 'www.sukitex.pe',
  logoUrl: SUKITEX_LOGO_DATA_URL,
  signerName: 'Área Comercial & Proyectos B2B',
  signerRole: 'SUKITEX S.A.C. · Fabricación de Prendas de Vestir',
};

export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-bcp-pen',
    bankName: 'BCP (Banco de Crédito del Perú)',
    accountType: 'Cuenta Corriente Soles (S/)',
    accountNumber: '191-2849501-0-45',
    cci: '002-19100284950104552',
    holder: 'SUKITEX PERÚ S.A.C.',
    enabled: true,
  },
  {
    id: 'bank-interbank-pen',
    bankName: 'Interbank',
    accountType: 'Cuenta Corriente Soles (S/)',
    accountNumber: '200-3004958120',
    cci: '003-20000300495812034',
    holder: 'SUKITEX PERÚ S.A.C.',
    enabled: true,
  },
  {
    id: 'bank-bn-detraccion',
    bankName: 'Banco de la Nación',
    accountType: 'Cuenta de Detracciones (S/)',
    accountNumber: '00-058-194820',
    cci: '',
    holder: 'SUKITEX PERÚ S.A.C.',
    enabled: true,
  },
];

export const DEFAULT_COMMERCIAL_TERMS: CommercialTerms = {
  paymentTerms:
    '50% de adelanto a la confirmación del pedido / Orden de Compra y 50% contra entrega de las prendas.',
  advancePercent: 50,
  deliveryTime:
    '12 a 15 días hábiles contabilizados a partir de la aprobación de muestra de bordado/ficha técnica y recepción del adelanto.',
  deliveryPlace:
    'Entrega coordinada en almacén del cliente (Lima Metropolitana) o recojo en planta (Daniel A. Carrión 173, Lurigancho - Chosica). Envíos a provincia vía agencia.',
  validityDays: '15 días calendario',
  warrantyAndSamples:
    'Incluye digitalización de matriz de bordado y prueba de bordado referencial. Garantía total por costuras, teñido reactivo y acabados.',
  additionalNotes:
    'Las tallas se confeccionan según cuadro de medidas estándar corporativo SUKITEX (se adjunta tabla o kit de tallaje a solicitud). Tolerancia textil estándar ±1 cm.',
  showBankAccounts: true,
  showSignature: true,
  showAdvanceCalculation: true,
};

export const VARIANT_QUICK_PRESETS: string[] = [
  'Estándar · Con 1 bordado computarizado en pecho izq. (8 cm)',
  'Doble Bordado · Pecho izq. (8 cm) + Espalda alta (24 cm)',
  'Full Branding · Pecho + Espalda + 1 Manga bordada',
  'Estampado Serigráfico / Plastisol / Tacto Cero (Pecho + Espalda)',
  'Estampado DTF Alta Definición Full Color (Pecho + Espalda)',
  'Con Cinta Reflectiva Certificada 2" (360° torso y mangas)',
  'Prenda Llana · Sin bordado ni estampado',
  'Corte Dama / Entallado Corporativo',
  'Corte Caballero / Clásico Corporativo',
];

export const SIZE_QUICK_PRESETS: string[] = [
  'S - M - L',
  'XS - S - M - L',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'XL - XXL (Talla Especial)',
  'Talla Estándar / Única',
];

export interface CatalogPreset {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  specs: ProductItem['specs'];
  defaultVariants: Omit<ProductItem['variants'][0], 'id'>[];
}

export const GARMENT_CATALOG_PRESETS: CatalogPreset[] = [
  {
    id: 'preset-polo-pique',
    code: 'POL-PIQ-24',
    name: 'Polo Camisero Piqué Corporativo (24/1 Reactivo)',
    category: 'Polos Camiseros',
    description:
      'Confeccionado en tela Piqué Lacoste doble fijado con teñido reactivo (no destiñe ni encoge). Ideal para personal administrativo, supervisión y ventas.',
    specs: {
      fabric: 'Piqué Lacoste 24/1 Doble Fijado',
      grammage: '210 - 220 gr/m²',
      composition: '100% Algodón Peruano Tangüis / Pima (Teñido Reactivo)',
      colors: 'Azul Marino, Negro, Blanco, Gris Melange, Guinda, Rey',
      finishing: 'Cuello y puños tejidos antipilling, tapete en hombro, pechera con 3 botones al tono, abertura lateral reforzada',
      brandingSummary: 'Bordado computarizado alta densidad',
    },
    defaultVariants: [
      {
        variantLabel: 'Estándar · Con 1 bordado en pecho izq. (hasta 8 cm)',
        sizeLabel: 'S - M - L',
        useSizeCurve: true,
        sizeBreakdown: { S: 10, M: 20, L: 15 },
        quantity: 45,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 36.0,
        notes: 'Incluye digitalización de logo',
      },
      {
        variantLabel: 'Estándar · Con 1 bordado en pecho izq. (Talla Especial)',
        sizeLabel: 'XL',
        useSizeCurve: false,
        sizeBreakdown: { XL: 5 },
        quantity: 5,
        minOrderLabel: 'A pedido',
        unitPrice: 39.0,
        notes: 'Recargo por metraje de tela talla XL',
      },
      {
        variantLabel: 'Variante Doble Bordado · Pecho izq. (8 cm) + Espalda (24 cm)',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 20,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 42.0,
        notes: 'Bordado trasero institucional de alta densidad',
      },
    ],
  },
  {
    id: 'preset-camisa-oxford',
    code: 'CAM-OXF-ML',
    name: 'Camisa / Blusa Corporativa en Tela Oxford Manga Larga',
    category: 'Camisas & Blusas',
    description:
      'Camisa ejecutiva en corte caballero y blusa entallada con pinzas para dama. Tela Oxford de alto rendimiento y fácil planchado.',
    specs: {
      fabric: 'Oxford Sanforizado / Mercerizado Premium',
      grammage: '145 gr/m²',
      composition: '65% Algodón / 35% Poliéster de alta resistencia',
      colors: 'Celeste Corporativo, Blanco, Azul Noche, Gris Plata, Beige',
      finishing: 'Cuello fusionado con entretela alemana (Button-down en caballero), yugo doble espalda, costuras francesas',
      brandingSummary: 'Bordado sobre bolsillo o pecho izquierdo',
    },
    defaultVariants: [
      {
        variantLabel: 'Corte Caballero / Dama · Con 1 bordado en pecho izq.',
        sizeLabel: 'S - M - L',
        useSizeCurve: true,
        sizeBreakdown: { S: 8, M: 14, L: 8 },
        quantity: 30,
        minOrderLabel: 'Mín. 20 und',
        unitPrice: 52.0,
      },
      {
        variantLabel: 'Corte Caballero / Dama · Con 1 bordado en pecho izq. (Talla Especial)',
        sizeLabel: 'XL - XXL',
        useSizeCurve: false,
        sizeBreakdown: { XL: 4 },
        quantity: 4,
        minOrderLabel: 'A pedido',
        unitPrice: 56.0,
      },
    ],
  },
  {
    id: 'preset-casaca-cortaviento',
    code: 'CAS-TAS-IMP',
    name: 'Casaca Corporativa Impermeable con Forro Micropolar',
    category: 'Casacas & Abrigo',
    description:
      'Casaca térmica e impermeable ideal para trabajo en campo, logística e invierno corporativo. Incluye capucha oculta en cuello y bolsillos con cierre.',
    specs: {
      fabric: 'Exterior Taslan Engomado Impermeable + Interior Polar Antipeeling',
      grammage: 'Exterior 160 gr/m² + Polar 240 gr/m²',
      composition: '100% Poliéster Técnico Hidrófugo',
      colors: 'Azul Marino, Negro, Gris Acero, Rojo Institucional',
      finishing: 'Cierre principal tractor #5, 2 bolsillos laterales con cierre, 1 bolsillo interno, puños elasticados con velcro',
      brandingSummary: 'Bordado en pecho izquierdo y espalda alta',
    },
    defaultVariants: [
      {
        variantLabel: 'Con 1 bordado en pecho izq. (8 cm)',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 30,
        minOrderLabel: 'Mín. 20 und',
        unitPrice: 78.0,
      },
      {
        variantLabel: 'Doble Bordado · Pecho izq. (8 cm) + Espalda (25 cm)',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 20,
        minOrderLabel: 'Mín. 20 und',
        unitPrice: 85.0,
      },
      {
        variantLabel: 'Doble Bordado · Tallas Especiales',
        sizeLabel: 'XL - XXL',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 5,
        minOrderLabel: 'A pedido',
        unitPrice: 90.0,
      },
    ],
  },
  {
    id: 'preset-polo-jersey',
    code: 'POL-JER-30',
    name: 'Polo Corporativo / Publicitario Cuello Redondo (Jersey 30/1)',
    category: 'Polos Publicitarios',
    description:
      'Polo en algodón peruano suave al tacto con cuello rib con lycra que no se deforma. Excelente para eventos, campañas de marketing y dotación de personal.',
    specs: {
      fabric: 'Jersey Algodón Peinado 30/1 o 20/1 Reactivo',
      grammage: '175 - 190 gr/m²',
      composition: '100% Algodón Peruano Reactivo',
      colors: 'Todos los colores de carta textil disponibles',
      finishing: 'Cuello Rib 1x1 con spandex, tapete de hombro a hombro, recubierto en basta y mangas',
      brandingSummary: 'Estampado serigráfico / DTF o Bordado',
    },
    defaultVariants: [
      {
        variantLabel: 'Con Estampado en Pecho + Espalda (Serigrafía / DTF)',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 100,
        minOrderLabel: 'Mín. 50 und',
        unitPrice: 22.5,
      },
      {
        variantLabel: 'Con 1 Bordado Computarizado en Pecho',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 50,
        minOrderLabel: 'Mín. 30 und',
        unitPrice: 25.0,
      },
      {
        variantLabel: 'Talla Especial XL',
        sizeLabel: 'XL',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 10,
        minOrderLabel: 'A pedido',
        unitPrice: 25.5,
      },
    ],
  },
  {
    id: 'preset-chaleco-drill',
    code: 'CHA-DRI-REP',
    name: 'Chaleco Corporativo / Geólogo en Drill Nuevo Mundo',
    category: 'Seguridad & Campo',
    description:
      'Chaleco multibolsillos de alta resistencia para ingenieros, supervisores de obra, logística y personal técnico.',
    specs: {
      fabric: 'Drill Nuevo Mundo 384 (100% Algodón) o Taslan',
      grammage: '255 gr/m²',
      composition: '100% Algodón Mercerizado Sanforizado',
      colors: 'Azul Marino, Caqui, Gris, Naranja, Negro, Verde Militar',
      finishing: 'Cierre tractor frontal, 4 bolsillos multifunción con fuelle y velcro, porta fotocheck, espalda con forro de malla',
      brandingSummary: 'Bordado institucional + Cintas reflectivas opcionales',
    },
    defaultVariants: [
      {
        variantLabel: 'Estándar · Con bordado en pecho y espalda',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 25,
        minOrderLabel: 'Mín. 20 und',
        unitPrice: 54.0,
      },
      {
        variantLabel: 'Con Cinta Reflectiva 2" (360°) + Bordado Pecho y Espalda',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 25,
        minOrderLabel: 'Mín. 20 und',
        unitPrice: 59.0,
      },
      {
        variantLabel: 'Talla Especial XL / XXL',
        sizeLabel: 'XL - XXL',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 5,
        minOrderLabel: 'A pedido',
        unitPrice: 64.0,
      },
    ],
  },
  {
    id: 'preset-pantalon-drill',
    code: 'PAN-DRI-IND',
    name: 'Pantalón Corporativo / Industrial en Drill Nuevo Mundo',
    category: 'Pantalones & EPPs',
    description:
      'Pantalón de trabajo pesado o vestir casual corporativo con costuras triples de seguridad y atraques en puntos de tensión.',
    specs: {
      fabric: 'Drill Nuevo Mundo Tecnología / Confort',
      grammage: '260 gr/m²',
      composition: '98% Algodón / 2% Spandex (o 100% Algodón rígido)',
      colors: 'Azul Marino, Beige/Caqui, Negro, Gris Oscuro',
      finishing: 'Costura triple en tiro y entrepierna, cierre metálico YKK/Rey, bolsillos profundos en tocuyo pesado',
      brandingSummary: 'Bordado opcional o cinta reflectiva en piernas',
    },
    defaultVariants: [
      {
        variantLabel: 'Clásico Corporativo (Sin cinta reflectiva)',
        sizeLabel: 'Tallas 28 - 30 - 32 - 34',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 40,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 55.0,
      },
      {
        variantLabel: 'Industrial con Cinta Reflectiva 2" en piernas',
        sizeLabel: 'Tallas 28 - 30 - 32 - 34',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 20,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 59.0,
      },
      {
        variantLabel: 'Tallas Especiales (36 - 38 - 40)',
        sizeLabel: 'Tallas 36 - 38 - 40',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 6,
        minOrderLabel: 'A pedido',
        unitPrice: 63.0,
      },
    ],
  },
  {
    id: 'preset-polera-franela',
    code: 'PLR-FRA-280',
    name: 'Polera Corporativa en Franela Reactiva 280 gr/m²',
    category: 'Casacas & Abrigo',
    description:
      'Polera de alto gramaje (con o sin capucha / cierre completo o canguro), interior perchado suave que mantiene el calor.',
    specs: {
      fabric: 'Franela Algodón Reactivo 20/1 + 10/1 Perchado',
      grammage: '280 - 300 gr/m²',
      composition: '100% Algodón Peruano Reactivo Antipilling',
      colors: 'Azul Marino, Negro, Gris Melange, Verde Bosque, Guinda',
      finishing: 'Puños y pretina en Rib 2x1 con spandex, costuras remalladas y recubiertas de 5 hilos',
      brandingSummary: 'Bordado en pecho o estampado de alta densidad',
    },
    defaultVariants: [
      {
        variantLabel: 'Modelo Cuello Redondo o Canguro · 1 Bordado en pecho',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 30,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 58.0,
      },
      {
        variantLabel: 'Modelo con Cierre Completo + Capucha Forrada + 2 Bordados',
        sizeLabel: 'S - M - L',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 30,
        minOrderLabel: 'Mín. 24 und',
        unitPrice: 66.0,
      },
      {
        variantLabel: 'Talla Especial XL',
        sizeLabel: 'XL',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 5,
        minOrderLabel: 'A pedido',
        unitPrice: 70.0,
      },
    ],
  },
  {
    id: 'preset-gorro-drill',
    code: 'GOR-DRI-6P',
    name: 'Gorro Corporativo en Drill Pesado 6 Paños con Hebilla Metálica',
    category: 'Accesorios & Merchandising',
    description:
      'Gorro estructurado de 6 paños con visera precurvada reforzada y regulador metálico bronce/níquel.',
    specs: {
      fabric: 'Drill Pesado Nuevo Mundo / Bull Denim',
      grammage: '260 gr/m²',
      composition: '100% Algodón',
      colors: 'Azul Marino, Negro, Blanco, Rojo, Beige, Bicolor con sándwich en visera',
      finishing: '6 ojalillos bordados de ventilación, tafilete interno absorbente, hebilla metálica regulable',
      brandingSummary: 'Bordado frontal plano o 3D en alto relieve',
    },
    defaultVariants: [
      {
        variantLabel: 'Con 1 Bordado Frontal Computarizado',
        sizeLabel: 'Talla Estándar Regulable',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 100,
        minOrderLabel: 'Mín. 50 und',
        unitPrice: 14.5,
      },
      {
        variantLabel: 'Con Bordado Frontal 3D Alto Relieve + Bordado Lateral/Posterior',
        sizeLabel: 'Talla Estándar Regulable',
        useSizeCurve: false,
        sizeBreakdown: {},
        quantity: 100,
        minOrderLabel: 'Mín. 50 und',
        unitPrice: 17.5,
      },
    ],
  },
];

export function createInitialQuotation(): QuotationDocument {
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(today.getDate() + 15);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    id: 'cot-initial-001',
    number: 'COT-2026-001',
    issueDate: formatDate(today),
    validUntilDate: formatDate(validUntil),
    salesperson: 'Ejecutivo Comercial SUKITEX',
    mode: 'order',
    taxMode: 'plus_igv',
    taxRate: 18,
    currency: 'PEN',
    discountAmount: 0,
    discountLabel: 'Descuento corporativo por volumen',
    theme: 'corporate',
    company: { ...DEFAULT_COMPANY_INFO },
    bankAccounts: DEFAULT_BANK_ACCOUNTS.map((b) => ({ ...b })),
    client: {
      companyName: 'CORPORACIÓN LOGÍSTICA ANDINA S.A.C.',
      ruc: '20548796321',
      contactName: 'Ing. Carlos Mendoza Ríos',
      contactRole: 'Jefe de Compras y Logística',
      phone: '+51 987 654 321',
      email: 'cmendoza@logisticaandina.com.pe',
      address: 'Av. Argentina 2450, Zona Industrial - Lima',
      projectReference: 'Dotación de Uniformes Corporativos de Verano / Invierno',
    },
    products: [
      {
        id: 'prod-1',
        code: GARMENT_CATALOG_PRESETS[0].code,
        name: GARMENT_CATALOG_PRESETS[0].name,
        category: GARMENT_CATALOG_PRESETS[0].category,
        description: GARMENT_CATALOG_PRESETS[0].description,
        specs: { ...GARMENT_CATALOG_PRESETS[0].specs },
        showSpecs: true,
        variants: GARMENT_CATALOG_PRESETS[0].defaultVariants.map((v, idx) => ({
          ...v,
          id: `var-1-${idx + 1}`,
          sizeBreakdown: { ...v.sizeBreakdown },
        })),
      },
      {
        id: 'prod-2',
        code: GARMENT_CATALOG_PRESETS[1].code,
        name: GARMENT_CATALOG_PRESETS[1].name,
        category: GARMENT_CATALOG_PRESETS[1].category,
        description: GARMENT_CATALOG_PRESETS[1].description,
        specs: { ...GARMENT_CATALOG_PRESETS[1].specs },
        showSpecs: true,
        variants: GARMENT_CATALOG_PRESETS[1].defaultVariants.map((v, idx) => ({
          ...v,
          id: `var-2-${idx + 1}`,
          sizeBreakdown: { ...v.sizeBreakdown },
        })),
      },
    ],
    terms: { ...DEFAULT_COMMERCIAL_TERMS },
    updatedAt: new Date().toISOString(),
  };
}
