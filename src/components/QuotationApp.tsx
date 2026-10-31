import React, { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Check,
  Download,
  FileCheck2,
  FileDown,
  FileJson,
  FilePlus2,
  FileText,
  FolderClock,
  Image as ImageIcon,
  Layers,
  Loader2,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Shirt,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  BankAccount,
  ClientInfo,
  ProductItem,
  QuotationDocument,
} from '../types/quotation';
import {
  type CatalogPreset,
  createInitialQuotation,
  GARMENT_CATALOG_PRESETS,
} from '../data/presets';
import { calculateQuotationTotals, formatMoney } from '../utils/calculations';
import {
  buildExportFileName,
  exportElementAsPdf,
  exportElementAsPng,
} from '../utils/exporter';
import { ProductEditorCard } from './ProductEditorCard';
import { QuotationPreview, SukitexLogoImg } from './QuotationPreview';
import { SUKITEX_LOGO_DATA_URL } from '../data/logoBase64';

const STORAGE_KEY_CURRENT = 'sukitex_current_quotation_v1';
const STORAGE_KEY_HISTORY = 'sukitex_quotation_history_v1';
const STORAGE_KEY_CUSTOM_PRESETS = 'sukitex_custom_garment_presets_v1';
const STORAGE_KEY_SAVED_CLIENTS = 'sukitex_saved_clients_v1';
const STORAGE_KEY_COMPANY_DEFAULTS = 'sukitex_company_defaults_v1';

type EditorTab = 'products' | 'client' | 'terms' | 'company';

export const QuotationApp: React.FC = () => {
  const [doc, setDoc] = useState<QuotationDocument>(() => createInitialQuotation());
  const [activeTab, setActiveTab] = useState<EditorTab>('products');
  const [zoom, setZoom] = useState<number>(0.78);
  const [catalogModalOpen, setCatalogModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  const [historyList, setHistoryList] = useState<QuotationDocument[]>([]);
  const [customPresets, setCustomPresets] = useState<CatalogPreset[]>([]);
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);

  const [exportingType, setExportingType] = useState<'pdf' | 'png' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Load saved state on mount
  useEffect(() => {
    try {
        const rawCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
        if (rawCurrent) {
          const parsed = JSON.parse(rawCurrent);
          if (parsed && parsed.products) {
            // Ensure company logoUrl reflects the official SUKITEX logo if it was using old placeholder
            if (!parsed.company?.logoUrl || parsed.company.logoUrl.startsWith('data:image/svg')) {
              parsed.company = {
                ...parsed.company,
                logoUrl: SUKITEX_LOGO_DATA_URL,
                brandName: 'SUKITEX S.A.C.',
                tagline: 'Fabricación de Prendas de Vestir',
                legalName: parsed.company.legalName || 'SUKITEX S.A.C.',
              };
            }
            setDoc(parsed);
          }
        } else {
        // Check if company defaults were saved previously
        const rawCompany = localStorage.getItem(STORAGE_KEY_COMPANY_DEFAULTS);
        if (rawCompany) {
          const parsedCompany = JSON.parse(rawCompany);
          setDoc((prev) => ({
            ...prev,
            company: parsedCompany.company || prev.company,
            bankAccounts: parsedCompany.bankAccounts || prev.bankAccounts,
          }));
        }
      }

      const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (rawHistory) setHistoryList(JSON.parse(rawHistory));

      const rawPresets = localStorage.getItem(STORAGE_KEY_CUSTOM_PRESETS);
      if (rawPresets) setCustomPresets(JSON.parse(rawPresets));

      const rawClients = localStorage.getItem(STORAGE_KEY_SAVED_CLIENTS);
      if (rawClients) setSavedClients(JSON.parse(rawClients));
    } catch (e) {
      console.error('Error loading localStorage state:', e);
    }
  }, []);

  // Auto-save current quotation
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(doc));
    } catch (e) {
      console.error('Error saving current quotation:', e);
    }
  }, [doc]);

  const totals = calculateQuotationTotals(doc);

  // Handlers for products
  const addProductFromPreset = (preset: CatalogPreset) => {
    const newProduct: ProductItem = {
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: preset.code,
      name: preset.name,
      category: preset.category,
      description: preset.description,
      specs: { ...preset.specs },
      showSpecs: true,
      variants: preset.defaultVariants.map((v, i) => ({
        ...v,
        id: `var-${Date.now()}-${i}`,
        sizeBreakdown: { ...v.sizeBreakdown },
      })),
    };
    setDoc((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    setCatalogModalOpen(false);
    showToast(`Prenda "${preset.name}" añadida a la cotización`);
  };

  const addBlankProduct = () => {
    const nextIdx = doc.products.length + 1;
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      code: `PR-0${nextIdx}`,
      name: 'Nueva Prenda Corporativa',
      category: 'Confección a Medida',
      description: 'Confección textil con acabados corporativos de primera calidad.',
      specs: {
        fabric: 'Piqué 24/1 / Jersey 30/1 / Drill',
        grammage: '200 gr/m²',
        composition: '100% Algodón Peruano Reactivo',
        colors: 'A elección del cliente según carta textil',
        finishing: 'Costura reforzada, tapete en hombro, avíos de primera',
        brandingSummary: 'Bordado o estampado personalizado',
      },
      showSpecs: true,
      variants: [
        {
          id: `var-${Date.now()}-1`,
          variantLabel: 'Estándar · Con 1 bordado en pecho izq. (8 cm)',
          sizeLabel: 'S - M - L',
          useSizeCurve: false,
          sizeBreakdown: {},
          quantity: 30,
          minOrderLabel: 'Mín. 24 und',
          unitPrice: 35.0,
          notes: '',
        },
      ],
    };
    setDoc((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
  };

  const updateProduct = (index: number, updated: ProductItem) => {
    setDoc((prev) => {
      const next = [...prev.products];
      next[index] = updated;
      return { ...prev, products: next };
    });
  };

  const deleteProduct = (index: number) => {
    if (doc.products.length <= 1) {
      showToast('La cotización debe tener al menos una prenda');
      return;
    }
    setDoc((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const duplicateProduct = (index: number) => {
    const source = doc.products[index];
    const clone: ProductItem = {
      ...source,
      id: `prod-${Date.now()}`,
      name: `${source.name} (Copia)`,
      specs: { ...source.specs },
      variants: source.variants.map((v, i) => ({
        ...v,
        id: `var-${Date.now()}-${i}`,
        sizeBreakdown: { ...v.sizeBreakdown },
      })),
    };
    setDoc((prev) => {
      const next = [...prev.products];
      next.splice(index + 1, 0, clone);
      return { ...prev, products: next };
    });
    showToast('Prenda duplicada');
  };

  const moveProduct = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= doc.products.length) return;
    setDoc((prev) => {
      const next = [...prev.products];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, products: next };
    });
  };

  const saveProductAsPreset = (product: ProductItem) => {
    const newPreset: CatalogPreset = {
      id: `custom-${Date.now()}`,
      code: product.code || 'PER-01',
      name: product.name,
      category: product.category || 'Mis Plantillas',
      description: product.description,
      specs: { ...product.specs },
      defaultVariants: product.variants.map(({ id: _id, ...rest }) => ({
        ...rest,
        sizeBreakdown: { ...rest.sizeBreakdown },
      })),
    };
    const nextPresets = [newPreset, ...customPresets];
    setCustomPresets(nextPresets);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(nextPresets));
    showToast(`"${product.name}" guardada en tu catálogo de plantillas`);
  };

  const deleteCustomPreset = (id: string) => {
    const next = customPresets.filter((p) => p.id !== id);
    setCustomPresets(next);
    localStorage.setItem(STORAGE_KEY_CUSTOM_PRESETS, JSON.stringify(next));
  };

  // Save quotation to history
  const saveToHistory = () => {
    const updatedDoc: QuotationDocument = {
      ...doc,
      id: doc.id || `cot-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const existingIdx = historyList.findIndex(
      (item) => item.id === updatedDoc.id || item.number === updatedDoc.number
    );
    let nextHistory: QuotationDocument[];
    if (existingIdx >= 0) {
      nextHistory = [...historyList];
      nextHistory[existingIdx] = updatedDoc;
    } else {
      nextHistory = [updatedDoc, ...historyList];
    }
    setHistoryList(nextHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(nextHistory));
    showToast(`Cotización ${updatedDoc.number} guardada en el historial`);
  };

  const createNewQuotation = () => {
    const fresh = createInitialQuotation();
    // Keep company & bank settings from current doc
    fresh.id = `cot-${Date.now()}`;
    const numMatch = doc.number.match(/^(.*?)(\d+)$/);
    if (numMatch) {
      const prefix = numMatch[1];
      const nextNum = String(parseInt(numMatch[2], 10) + 1).padStart(numMatch[2].length, '0');
      fresh.number = `${prefix}${nextNum}`;
    }
    fresh.company = { ...doc.company };
    fresh.bankAccounts = doc.bankAccounts.map((b) => ({ ...b }));
    setDoc(fresh);
    showToast(`Nueva cotización ${fresh.number} lista`);
  };

  // Client Bookmarks
  const saveCurrentClient = () => {
    if (!doc.client.companyName.trim()) {
      showToast('Ingresa el nombre de la empresa cliente primero');
      return;
    }
    const clientEntry: ClientInfo = {
      ...doc.client,
      id: `cli-${Date.now()}`,
    };
    const nextClients = [
      clientEntry,
      ...savedClients.filter(
        (c) => c.ruc !== clientEntry.ruc && c.companyName !== clientEntry.companyName
      ),
    ];
    setSavedClients(nextClients);
    localStorage.setItem(STORAGE_KEY_SAVED_CLIENTS, JSON.stringify(nextClients));
    showToast(`Cliente "${clientEntry.companyName}" guardado en frecuentes`);
  };

  // Save company defaults
  const saveCompanyDefaults = () => {
    localStorage.setItem(
      STORAGE_KEY_COMPANY_DEFAULTS,
      JSON.stringify({
        company: doc.company,
        bankAccounts: doc.bankAccounts,
      })
    );
    showToast('Datos de SUKITEX y cuentas guardados por defecto');
  };

  // Export handlers
  const handleDownloadPdf = async () => {
    if (!previewRef.current || exportingType) return;
    setExportingType('pdf');
    try {
      await exportElementAsPdf(previewRef.current, doc.number, doc.client.companyName);
      showToast('Archivo PDF descargado correctamente');
    } catch (e) {
      console.error('Error exporting PDF:', e);
      showToast('Error al generar el PDF. Puedes usar el botón Imprimir.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadPng = async () => {
    if (!previewRef.current || exportingType) return;
    setExportingType('png');
    try {
      await exportElementAsPng(previewRef.current, doc.number, doc.client.companyName);
      showToast('Imagen PNG en Alta Definición descargada');
    } catch (e) {
      console.error('Error exporting PNG:', e);
      showToast('Error al generar la imagen PNG');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute(
      'download',
      buildExportFileName(doc.number, doc.client.companyName, 'json')
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Respaldo JSON descargado');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && Array.isArray(parsed.products)) {
          setDoc(parsed);
          showToast(`Cotización ${parsed.number || ''} cargada desde archivo JSON`);
        }
      } catch (err) {
        console.error(err);
        showToast('El archivo JSON no tiene un formato válido');
      }
    };
    reader.readAsText(file);
  };

  const setValidityOffsetDays = (days: number) => {
    const base = doc.issueDate ? new Date(doc.issueDate) : new Date();
    base.setDate(base.getDate() + days);
    const formatted = base.toISOString().split('T')[0];
    setDoc((prev) => ({
      ...prev,
      validUntilDate: formatted,
      terms: {
        ...prev.terms,
        validityDays: `${days} días calendario`,
      },
    }));
  };

  const handleLogoUpload = (
    field: 'logoUrl' | 'signatureUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDoc((prev) => ({
          ...prev,
          company: {
            ...prev.company,
            [field]: reader.result as string,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addBankAccount = () => {
    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: 'BBVA Perú',
      accountType: 'Cuenta Corriente Soles (S/)',
      accountNumber: '0011-0123-0100045678',
      cci: '011-123-000100045678-90',
      holder: doc.company.legalName,
      enabled: true,
    };
    setDoc((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newBank],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F3F0EA] text-[#1F261E] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1D2523] text-white border-l-4 border-[#48A987] px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce print:hidden">
          <Check className="w-4 h-4 text-[#48A987] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER (Hidden on Print) */}
      <header className="bg-[#1D2523] text-white border-b-2 border-[#48A987] sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white/95 rounded-lg px-2.5 py-1 shadow-sm flex items-center">
              <img
                src={SUKITEX_LOGO_DATA_URL}
                alt="SUKITEX S.A.C."
                className="h-9 max-w-[170px] object-contain"
              />
            </div>
            <div className="hidden md:block border-l border-white/15 pl-3">
              <span className="text-xs font-bold text-[#48A987] block">
                Sistema de Cotizaciones B2B
              </span>
              <span className="text-[11px] text-gray-300">
                Fabricación de Prendas de Vestir & Uniformes
              </span>
            </div>
          </div>

          {/* Quick Document Mode & Theme Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-[#26312E] p-1.5 rounded-lg border border-white/10">
            {/* Mode Switcher */}
            <div className="flex rounded bg-black/25 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDoc((prev) => ({ ...prev, mode: 'order' }))}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  doc.mode === 'order'
                    ? 'bg-[#48A987] text-white shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Con Cantidades y Total
              </button>
              <button
                type="button"
                onClick={() => setDoc((prev) => ({ ...prev, mode: 'pricelist' }))}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  doc.mode === 'pricelist'
                    ? 'bg-[#48A987] text-white shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Tarifario por Tallas
              </button>
            </div>

            {/* Currency Switcher */}
            <select
              value={doc.currency}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  currency: e.target.value as 'PEN' | 'USD',
                }))
              }
              className="bg-black/25 text-white text-xs font-bold px-2.5 py-1.5 rounded border border-white/10 focus:outline-none focus:border-[#48A987]"
            >
              <option value="PEN" className="bg-[#1D2523]">
                S/ Soles (PEN)
              </option>
              <option value="USD" className="bg-[#1D2523]">
                US$ Dólares (USD)
              </option>
            </select>

            {/* Tax Mode Switcher */}
            <select
              value={doc.taxMode}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  taxMode: e.target.value as 'plus_igv' | 'inc_igv' | 'no_igv',
                }))
              }
              className="bg-black/25 text-white text-xs font-bold px-2.5 py-1.5 rounded border border-white/10 focus:outline-none focus:border-[#48A987]"
            >
              <option value="plus_igv" className="bg-[#1D2523]">
                Precios + IGV (18%)
              </option>
              <option value="inc_igv" className="bg-[#1D2523]">
                Incluye IGV (18%)
              </option>
              <option value="no_igv" className="bg-[#1D2523]">
                Sin IGV (Valor Neto)
              </option>
            </select>

            {/* Visual Theme Switcher */}
            <button
              type="button"
              onClick={() =>
                setDoc((prev) => ({
                  ...prev,
                  theme: prev.theme === 'corporate' ? 'clean' : 'corporate',
                }))
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#48A987] transition"
              title="Alternar entre diseño Corporativo Oscuro y diseño Blanco para impresión"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>
                {doc.theme === 'corporate' ? 'Tema: Corporativo' : 'Tema: Impresión Limpia'}
              </span>
            </button>
          </div>

          {/* Export & History Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveToHistory}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Guardar cotización actual en el navegador"
            >
              <Save className="w-3.5 h-3.5 text-[#48A987]" />
              <span className="hidden sm:inline">Guardar</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <FolderClock className="w-3.5 h-3.5 text-[#48A987]" />
              <span className="hidden sm:inline">Historial ({historyList.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={exportingType !== null}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-lg bg-[#2E7A60] hover:bg-[#256650] text-white shadow transition disabled:opacity-50"
              title="Descargar como Imagen PNG en Alta Resolución (ideal para WhatsApp)"
            >
              {exportingType === 'png' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <span>Imagen PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={exportingType !== null}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-lg bg-[#48A987] hover:bg-[#3d9173] text-white shadow transition disabled:opacity-50"
              title="Descargar archivo PDF A4 directo"
            >
              {exportingType === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-white text-[#1F261E] hover:bg-gray-100 transition"
              title="Imprimir o Guardar como PDF Vectorial"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xl:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE: LEFT EDITOR + RIGHT LIVE A4 PREVIEW */}
      <div className="flex-1 max-w-[1800px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 print:p-0 print:block">
        {/* LEFT COLUMN: STRUCTURED EDITOR (Hidden on Print) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4 print:hidden">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition ${
                activeTab === 'products'
                  ? 'bg-[#1F261E] text-[#EBA552] shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shirt className="w-4 h-4 shrink-0" />
              <span className="truncate">1. Prendas ({doc.products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('client')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition ${
                activeTab === 'client'
                  ? 'bg-[#1F261E] text-[#EBA552] shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">2. Cliente & Doc</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition ${
                activeTab === 'terms'
                  ? 'bg-[#1F261E] text-[#EBA552] shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span className="truncate">3. Condiciones</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-extrabold transition ${
                activeTab === 'company'
                  ? 'bg-[#1F261E] text-[#EBA552] shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">4. SUKITEX & Bancos</span>
            </button>
          </div>

          {/* TAB 1: GARMENTS, VARIANTS & SIZES */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Top Action Bar for Adding Garments */}
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold text-[#1F261E]">
                    Prendas, Especificaciones Textiles y Precios por Talla
                  </h2>
                  <p className="text-xs text-gray-500">
                    Agrega prendas desde el catálogo SUKITEX o crea un ítem personalizado con sus variantes de bordado/estampado.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCatalogModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#1F261E] text-[#EBA552] hover:bg-[#2A3329] px-3.5 py-2 rounded-lg shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    Catálogo de Prendas SUKITEX
                  </button>

                  <button
                    type="button"
                    onClick={addBlankProduct}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#F8F5F1] text-[#1F261E] hover:bg-[#EBA552]/30 border border-[#E5E0D8] px-3 py-2 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4 text-[#9A6522]" />
                    Prenda en Blanco
                  </button>
                </div>
              </div>

              {/* List of Product Cards */}
              <div className="space-y-4">
                {doc.products.map((prod, idx) => (
                  <ProductEditorCard
                    key={prod.id}
                    product={prod}
                    index={idx}
                    totalProducts={doc.products.length}
                    mode={doc.mode}
                    currency={doc.currency}
                    onUpdate={(updated) => updateProduct(idx, updated)}
                    onDelete={() => deleteProduct(idx)}
                    onDuplicate={() => duplicateProduct(idx)}
                    onMoveUp={() => moveProduct(idx, idx - 1)}
                    onMoveDown={() => moveProduct(idx, idx + 1)}
                    onSaveAsPreset={saveProductAsPreset}
                  />
                ))}
              </div>

              {/* Bottom Add Button + Optional Discount Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCatalogModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#1F261E] text-[#EBA552] px-4 py-2 rounded-lg hover:bg-[#2A3329] transition"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Otra Prenda del Catálogo
                  </button>

                  <button
                    type="button"
                    onClick={addBlankProduct}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F261E] bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Prenda Vacía
                  </button>
                </div>

                {doc.mode === 'order' && (
                  <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                        Concepto de Descuento Especial (Opcional)
                      </label>
                      <input
                        type="text"
                        value={doc.discountLabel}
                        onChange={(e) =>
                          setDoc((prev) => ({ ...prev, discountLabel: e.target.value }))
                        }
                        placeholder="Ej. Descuento corporativo por volumen"
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                        Monto Descuento ({doc.currency === 'PEN' ? 'S/' : 'US$'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={doc.discountAmount}
                        onChange={(e) =>
                          setDoc((prev) => ({
                            ...prev,
                            discountAmount: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-gray-50 border border-gray-300 rounded-lg text-right"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT & QUOTATION METADATA */}
          {activeTab === 'client' && (
            <div className="space-y-4">
              {/* Document Metadata */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h2 className="text-sm font-extrabold text-[#1F261E] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#9A6522]" />
                    Datos del Documento de Cotización
                  </h2>
                  <button
                    type="button"
                    onClick={createNewQuotation}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#9A6522] bg-[#FDF6EC] border border-[#EBA552]/50 px-2.5 py-1 rounded hover:bg-[#EBA552]/30 transition"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    Nueva Cotización (+1 correlativo)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      N° de Cotización:
                    </label>
                    <input
                      type="text"
                      value={doc.number}
                      onChange={(e) => setDoc((prev) => ({ ...prev, number: e.target.value }))}
                      className="w-full px-3 py-2 font-mono font-bold text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Ejecutivo Comercial / Asesor B2B:
                    </label>
                    <input
                      type="text"
                      value={doc.salesperson}
                      onChange={(e) =>
                        setDoc((prev) => ({ ...prev, salesperson: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Fecha de Emisión:
                    </label>
                    <input
                      type="date"
                      value={doc.issueDate}
                      onChange={(e) =>
                        setDoc((prev) => ({ ...prev, issueDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-600">Válido Hasta:</label>
                      <div className="flex gap-1">
                        {[7, 15, 30].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setValidityOffsetDays(d)}
                            className="text-[10px] bg-gray-100 hover:bg-[#EBA552] text-gray-700 hover:text-[#1F261E] font-bold px-1.5 py-0.5 rounded"
                          >
                            +{d}d
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="date"
                      value={doc.validUntilDate}
                      onChange={(e) =>
                        setDoc((prev) => ({ ...prev, validUntilDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <h2 className="text-sm font-extrabold text-[#1F261E] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#9A6522]" />
                    Datos de la Empresa Cliente (B2B)
                  </h2>
                  <button
                    type="button"
                    onClick={saveCurrentClient}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1F261E] bg-[#F8F5F1] hover:bg-[#EBA552]/30 border border-[#E5E0D8] px-2.5 py-1 rounded transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#9A6522]" />
                    Guardar en Clientes Frecuentes
                  </button>
                </div>

                {/* Frequent Clients Quick Selector */}
                {savedClients.length > 0 && (
                  <div className="bg-[#F8F5F1] p-2.5 rounded-lg border border-[#E5E0D8]">
                    <span className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">
                      Autocompletar Cliente Frecuente:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedClients.map((c) => (
                        <div
                          key={c.id || c.companyName}
                          className="inline-flex items-center bg-white border border-gray-300 rounded-md overflow-hidden text-xs"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setDoc((prev) => ({ ...prev, client: { ...c } }))
                            }
                            className="px-2.5 py-1 font-semibold text-[#1F261E] hover:bg-[#FDF6EC]"
                          >
                            {c.companyName} {c.ruc ? `(${c.ruc})` : ''}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = savedClients.filter((x) => x !== c);
                              setSavedClients(next);
                              localStorage.setItem(
                                STORAGE_KEY_SAVED_CLIENTS,
                                JSON.stringify(next)
                              );
                            }}
                            className="px-1.5 py-1 text-gray-400 hover:text-red-600 border-l border-gray-200"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-600 mb-1">
                      Razón Social / Empresa Cliente:
                    </label>
                    <input
                      type="text"
                      value={doc.client.companyName}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, companyName: e.target.value },
                        }))
                      }
                      placeholder="Ej. CORPORACIÓN LOGÍSTICA ANDINA S.A.C."
                      className="w-full px-3 py-2 font-bold text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      RUC / Documento Fiscal:
                    </label>
                    <input
                      type="text"
                      value={doc.client.ruc}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, ruc: e.target.value },
                        }))
                      }
                      placeholder="Ej. 20548796321"
                      className="w-full px-3 py-2 font-mono bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Persona de Contacto (Atención):
                    </label>
                    <input
                      type="text"
                      value={doc.client.contactName}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, contactName: e.target.value },
                        }))
                      }
                      placeholder="Ej. Ing. Carlos Mendoza"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Cargo / Área del Contacto:
                    </label>
                    <input
                      type="text"
                      value={doc.client.contactRole}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, contactRole: e.target.value },
                        }))
                      }
                      placeholder="Ej. Jefatura de Logística / RR.HH."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Teléfono / WhatsApp Cliente:
                    </label>
                    <input
                      type="text"
                      value={doc.client.phone}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, phone: e.target.value },
                        }))
                      }
                      placeholder="+51 999 888 777"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Correo Electrónico:
                    </label>
                    <input
                      type="email"
                      value={doc.client.email}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, email: e.target.value },
                        }))
                      }
                      placeholder="compras@empresa.com.pe"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Dirección de Entrega / Sede:
                    </label>
                    <input
                      type="text"
                      value={doc.client.address}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, address: e.target.value },
                        }))
                      }
                      placeholder="Av. Industrial 123, Lima"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-600 mb-1">
                      Referencia del Proyecto / Campaña:
                    </label>
                    <input
                      type="text"
                      value={doc.client.projectReference}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          client: { ...prev.client, projectReference: e.target.value },
                        }))
                      }
                      placeholder="Ej. Dotación de Uniformes Corporativos de Invierno 2026"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4 text-xs">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-sm font-extrabold text-[#1F261E]">
                  Condiciones Comerciales, Plazos de Producción y Entregas
                </h2>
                <p className="text-xs text-gray-500">
                  Personaliza las condiciones operativas para el cliente corporativo.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Forma de Pago:
                  </label>
                  <input
                    type="text"
                    value={doc.terms.paymentTerms}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        terms: { ...prev.terms, paymentTerms: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      '50% de adelanto a la confirmación de la Orden de Compra y 50% contra entrega.',
                      '100% al contado a la confirmación del pedido.',
                      '50% adelanto y 50% Factura a 15 días (previa evaluación crediticia).',
                      'Factura a 30 días tras recepción conforme de mercadería con Guía de Remisión.',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setDoc((prev) => ({
                            ...prev,
                            terms: { ...prev.terms, paymentTerms: preset },
                          }))
                        }
                        className="text-[10.5px] bg-gray-100 hover:bg-[#FDF6EC] hover:text-[#9A6522] px-2 py-0.5 rounded border border-gray-200"
                      >
                        {preset.slice(0, 48)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advance Payment Calculator Toggle */}
                <div className="p-3 bg-[#F8F5F1] border border-[#E5E0D8] rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 font-bold text-[#1F261E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.terms.showAdvanceCalculation}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          terms: {
                            ...prev.terms,
                            showAdvanceCalculation: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-[#1F261E] focus:ring-[#EBA552]"
                    />
                    <span>Mostrar cálculo exacto de Adelanto y Saldo en la cotización</span>
                  </label>

                  {doc.terms.showAdvanceCalculation && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-600">% de Adelanto:</span>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        step="5"
                        value={doc.terms.advancePercent}
                        onChange={(e) =>
                          setDoc((prev) => ({
                            ...prev,
                            terms: {
                              ...prev.terms,
                              advancePercent: Math.min(
                                100,
                                Math.max(0, parseInt(e.target.value, 10) || 0)
                              ),
                            },
                          }))
                        }
                        className="w-16 px-2 py-1 font-mono font-bold text-center bg-white border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Plazo de Producción y Entrega:
                  </label>
                  <input
                    type="text"
                    value={doc.terms.deliveryTime}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        terms: { ...prev.terms, deliveryTime: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Lugar y Modalidad de Entrega:
                  </label>
                  <input
                    type="text"
                    value={doc.terms.deliveryPlace}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        terms: { ...prev.terms, deliveryPlace: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Muestras, Matriz de Bordado y Garantía:
                  </label>
                  <textarea
                    rows={2}
                    value={doc.terms.warrantyAndSamples}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        terms: { ...prev.terms, warrantyAndSamples: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Observaciones / Notas Textiles Adicionales:
                  </label>
                  <textarea
                    rows={2}
                    value={doc.terms.additionalNotes}
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        terms: { ...prev.terms, additionalNotes: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EBA552]"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-6">
                  <label className="inline-flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.terms.showBankAccounts}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          terms: { ...prev.terms, showBankAccounts: e.target.checked },
                        }))
                      }
                      className="rounded border-gray-300 text-[#1F261E]"
                    />
                    <span>Mostrar bloque de Cuentas Bancarias en el PDF</span>
                  </label>

                  <label className="inline-flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={doc.terms.showSignature}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          terms: { ...prev.terms, showSignature: e.target.checked },
                        }))
                      }
                      className="rounded border-gray-300 text-[#1F261E]"
                    />
                    <span>Mostrar bloque de Firma y Sello Comercial</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUKITEX COMPANY DATA, LOGO, BANK ACCOUNTS & SIGNATURE */}
          {activeTab === 'company' && (
            <div className="space-y-4 text-xs">
              {/* Company Profile */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <h2 className="text-sm font-extrabold text-[#1F261E]">
                    Datos Corporativos de SUKITEX
                  </h2>
                  <button
                    type="button"
                    onClick={saveCompanyDefaults}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1F261E] text-[#EBA552] px-3 py-1.5 rounded-lg hover:bg-[#2A3329] transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Guardar como Predeterminado
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Nombre Comercial / Marca:
                    </label>
                    <input
                      type="text"
                      value={doc.company.brandName}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, brandName: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 font-bold bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Especialidad / Eslogan:
                    </label>
                    <input
                      type="text"
                      value={doc.company.tagline}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, tagline: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Razón Social:
                    </label>
                    <input
                      type="text"
                      value={doc.company.legalName}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, legalName: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 font-semibold bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      RUC de SUKITEX:
                    </label>
                    <input
                      type="text"
                      value={doc.company.ruc}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, ruc: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 font-mono font-bold bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-600 mb-1">
                      Dirección de Planta / Oficina:
                    </label>
                    <input
                      type="text"
                      value={doc.company.address}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, address: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Teléfono / WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={doc.company.phone}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, phone: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Correo Corporativo:
                    </label>
                    <input
                      type="text"
                      value={doc.company.email}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          company: { ...prev.company, email: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Custom Logo & Signature Uploaders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[#1F261E]">Logo de Empresa</span>
                      <span className="text-[10.5px] text-gray-500">
                        {doc.company.logoUrl
                          ? 'Usando logo personalizado'
                          : 'Usando logo vectorial SUKITEX'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="cursor-pointer bg-white border border-gray-300 hover:border-[#EBA552] px-2.5 py-1.5 rounded font-bold text-[#1F261E] transition">
                        Subir Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload('logoUrl', e)}
                          className="hidden"
                        />
                      </label>
                      {doc.company.logoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              company: { ...prev.company, logoUrl: undefined },
                            }))
                          }
                          className="text-red-600 hover:underline px-1.5"
                        >
                          Restaurar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[#1F261E]">Firma / Sello Digital</span>
                      <span className="text-[10.5px] text-gray-500">
                        {doc.company.signatureUrl
                          ? 'Imagen de firma cargada'
                          : 'Sin imagen de firma'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="cursor-pointer bg-white border border-gray-300 hover:border-[#EBA552] px-2.5 py-1.5 rounded font-bold text-[#1F261E] transition">
                        Subir Firma
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload('signatureUrl', e)}
                          className="hidden"
                        />
                      </label>
                      {doc.company.signatureUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              company: { ...prev.company, signatureUrl: undefined },
                            }))
                          }
                          className="text-red-600 hover:underline px-1.5"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Accounts Management */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h2 className="text-sm font-extrabold text-[#1F261E]">
                    Cuentas Bancarias y Detracciones
                  </h2>
                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-[#F8F5F1] text-[#1F261E] border border-[#E5E0D8] px-2.5 py-1 rounded hover:bg-[#EBA552]/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Banco
                  </button>
                </div>

                <div className="space-y-2.5">
                  {doc.bankAccounts.map((bank, bIdx) => (
                    <div
                      key={bank.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-12 sm:col-span-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bank.enabled}
                          onChange={(e) => {
                            const next = [...doc.bankAccounts];
                            next[bIdx] = { ...bank, enabled: e.target.checked };
                            setDoc((prev) => ({ ...prev, bankAccounts: next }));
                          }}
                          className="rounded border-gray-300 text-[#1F261E]"
                        />
                        <input
                          type="text"
                          value={bank.bankName}
                          onChange={(e) => {
                            const next = [...doc.bankAccounts];
                            next[bIdx] = { ...bank, bankName: e.target.value };
                            setDoc((prev) => ({ ...prev, bankAccounts: next }));
                          }}
                          placeholder="Banco (ej. BCP)"
                          className="w-full px-2 py-1 font-bold bg-white border border-gray-300 rounded"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-3">
                        <input
                          type="text"
                          value={bank.accountType}
                          onChange={(e) => {
                            const next = [...doc.bankAccounts];
                            next[bIdx] = { ...bank, accountType: e.target.value };
                            setDoc((prev) => ({ ...prev, bankAccounts: next }));
                          }}
                          placeholder="Tipo (Cta. Cte. Soles)"
                          className="w-full px-2 py-1 bg-white border border-gray-300 rounded"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <input
                          type="text"
                          value={bank.accountNumber}
                          onChange={(e) => {
                            const next = [...doc.bankAccounts];
                            next[bIdx] = { ...bank, accountNumber: e.target.value };
                            setDoc((prev) => ({ ...prev, bankAccounts: next }));
                          }}
                          placeholder="N° Cuenta"
                          className="w-full px-2 py-1 font-mono bg-white border border-gray-300 rounded"
                        />
                      </div>

                      <div className="col-span-5 sm:col-span-2">
                        <input
                          type="text"
                          value={bank.cci}
                          onChange={(e) => {
                            const next = [...doc.bankAccounts];
                            next[bIdx] = { ...bank, cci: e.target.value };
                            setDoc((prev) => ({ ...prev, bankAccounts: next }));
                          }}
                          placeholder="CCI (Opcional)"
                          className="w-full px-2 py-1 font-mono bg-white border border-gray-300 rounded"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDoc((prev) => ({
                              ...prev,
                              bankAccounts: prev.bankAccounts.filter((_, i) => i !== bIdx),
                            }))
                          }
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE A4 PREVIEW */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center print:w-full print:block">
          {/* Preview Control Bar (Hidden on Print) */}
          <div className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-3 shadow-sm flex flex-wrap items-center justify-between gap-2 print:hidden sticky top-16 z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-extrabold text-[#1F261E] uppercase tracking-wider">
                Vista Previa Hoja A4 en Vivo
              </span>
              {doc.mode === 'order' && (
                <span className="text-xs font-mono bg-[#F8F5F1] border border-[#E5E0D8] px-2 py-0.5 rounded font-bold text-[#9A6522]">
                  {totals.totalUnits} prendas · {formatMoney(totals.grandTotal, doc.currency)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.08).toFixed(2))))}
                className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.1, Number((z + 0.08).toFixed(2))))}
                className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.78)}
                className="text-[10.5px] font-bold px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Ajustar
              </button>
            </div>
          </div>

          {/* Scaled A4 Container on screen, 100% scale on Print & Export */}
          <div className="w-full overflow-x-auto flex justify-center pb-12 print:pb-0 print:overflow-visible">
            <div
              className="origin-top transition-transform duration-150 print:!transform-none"
              style={{
                transform: `scale(${zoom})`,
                marginBottom: `${(zoom - 1) * 1123}px`,
              }}
            >
              <QuotationPreview doc={doc} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: GARMENT CATALOG PRESETS */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#1F261E] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#EBA552]">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EBA552]" />
                  Catálogo de Prendas y Especificaciones B2B — SUKITEX
                </h3>
                <p className="text-xs text-gray-300">
                  Selecciona una prenda para insertarla con su ficha técnica textil y variantes de tallas listas para ajustar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCatalogModalOpen(false)}
                className="text-gray-300 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Custom User Presets if any */}
              {customPresets.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9A6522] mb-2.5">
                    Mis Plantillas Guardadas ({customPresets.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="border border-[#EBA552] bg-[#FDF6EC]/50 rounded-xl p-3.5 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold bg-[#1F261E] text-[#EBA552] px-2 py-0.5 rounded">
                              {preset.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteCustomPreset(preset.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar plantilla
                            </button>
                          </div>
                          <h5 className="font-extrabold text-sm text-[#1F261E] mt-1">
                            {preset.name}
                          </h5>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProductFromPreset(preset)}
                          className="w-full py-2 rounded-lg bg-[#1F261E] text-[#EBA552] font-extrabold text-xs hover:bg-[#2A3329] transition"
                        >
                          + Insertar en la Cotización
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard SUKITEX B2B Garment Presets */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2.5">
                  Plantillas Textiles Estándar SUKITEX
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {GARMENT_CATALOG_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="border border-gray-200 hover:border-[#EBA552] rounded-xl p-4 flex flex-col justify-between gap-3 bg-gray-50/60 hover:bg-white transition shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold bg-[#1F261E] text-[#EBA552] px-2 py-0.5 rounded">
                            {preset.code}
                          </span>
                          <span className="text-[10.5px] font-semibold text-[#9A6522] bg-[#FDF6EC] px-2 py-0.5 rounded">
                            {preset.category}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-sm text-[#1F261E]">
                          {preset.name}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200/80 text-[11px] text-gray-600 space-y-0.5">
                          <div>
                            <strong>Tela:</strong> {preset.specs.fabric} ({preset.specs.grammage})
                          </div>
                          <div>
                            <strong>Variantes incluidas:</strong> {preset.defaultVariants.length}{' '}
                            sub-filas por talla/acabado
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addProductFromPreset(preset)}
                        className="w-full py-2 rounded-lg bg-[#1F261E] hover:bg-[#EBA552] text-white hover:text-[#1F261E] font-extrabold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Insertar Prenda con Ficha y Tallas
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SAVED QUOTATIONS HISTORY & JSON BACKUP */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#1F261E] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#EBA552]">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <FolderClock className="w-5 h-5 text-[#EBA552]" />
                  Historial de Cotizaciones y Respaldo JSON
                </h3>
                <p className="text-xs text-gray-300">
                  Carga cotizaciones anteriores, crea nuevas versiones o exporta/importa un archivo editable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="text-gray-300 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Top Backup & Restore Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8F5F1] p-3.5 rounded-xl border border-[#E5E0D8]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={saveToHistory}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#1F261E] text-[#EBA552] px-3.5 py-2 rounded-lg"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Guardar Cotización Actual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      createNewQuotation();
                      setHistoryModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-[#1F261E] border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nueva Cotización Limpia
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-gray-300 px-3 py-2 rounded-lg hover:border-[#EBA552]"
                  >
                    <FileJson className="w-3.5 h-3.5 text-[#9A6522]" />
                    Exportar .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => jsonInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-gray-300 px-3 py-2 rounded-lg hover:border-[#EBA552]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#9A6522]" />
                    Importar .JSON
                  </button>
                  <input
                    ref={jsonInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Saved History List */}
              {historyList.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  Aún no has guardado cotizaciones en el historial. Haz clic en{' '}
                  <strong>"Guardar"</strong> para almacenar versiones.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((item) => {
                    const itemTotals = calculateQuotationTotals(item);
                    return (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 hover:border-[#EBA552] transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-xs bg-[#1F261E] text-[#EBA552] px-2 py-0.5 rounded">
                              {item.number}
                            </span>
                            <span className="font-bold text-sm text-[#1F261E]">
                              {item.client.companyName || 'Sin nombre de cliente'}
                            </span>
                            <span className="text-xs text-gray-400">· {item.issueDate}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {item.products.length} prendas ({itemTotals.totalUnits} und) ·{' '}
                            <strong className="font-mono text-[#1F261E]">
                              {formatMoney(itemTotals.grandTotal, item.currency)}
                            </strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDoc(item);
                              setHistoryModalOpen(false);
                              showToast(`Cotización ${item.number} cargada`);
                            }}
                            className="text-xs font-extrabold bg-[#EBA552] text-[#1F261E] px-3 py-1.5 rounded-lg hover:bg-[#d9933f]"
                          >
                            Cargar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = historyList.filter((x) => x.id !== item.id);
                              setHistoryList(next);
                              localStorage.setItem(
                                STORAGE_KEY_HISTORY,
                                JSON.stringify(next)
                              );
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600"
                            title="Eliminar del historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
