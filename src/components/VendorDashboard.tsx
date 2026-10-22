import React, { useState } from 'react';
import { Product, Vendor, MainOrder, CommercialUniverse } from '../types';
import { COMMERCIAL_UNIVERSES } from '../data/mockData';
import { formatFCFA, generateWholesaleTiers } from '../utils/pricing';
import { OFFICIAL_LOGO_PATH } from './BrandLogo';
import {
  Store,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Percent,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface VendorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentVendor: Vendor;
  allVendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  orders: MainOrder[];
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({
  isOpen,
  onClose,
  currentVendor,
  allVendors,
  onSelectVendor,
  products,
  onSaveProduct,
  orders,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'simulator' | 'add_product'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Filter vendor's own products
  const vendorProducts = products.filter((p) => p.vendorId === currentVendor.id);

  // Filter orders containing this vendor's sub-orders
  const vendorOrders = orders
    .map((ord) => {
      const sub = ord.vendorSubOrders.find((s) => s.vendorId === currentVendor.id);
      return sub ? { mainOrder: ord, subOrder: sub } : null;
    })
    .filter(Boolean) as { mainOrder: MainOrder; subOrder: any }[];

  const totalRevenue = vendorOrders.reduce((sum, vo) => sum + vo.subOrder.subtotal, 0);

  // New product form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUniverse, setFormUniverse] = useState<CommercialUniverse>('Supermarché');
  const [formCategory, setFormCategory] = useState('Vivriers & Céréales');
  const [formPrice, setFormPrice] = useState(10000);
  const [formStock, setFormStock] = useState(100);
  const [formIsWholesale, setFormIsWholesale] = useState(currentVendor.type === 'wholesale');
  const [formHas3D, setFormHas3D] = useState(false);
  const [formUnit, setFormUnit] = useState('Sac de 25 kg');

  // Simulator base price
  const [simPrice, setSimPrice] = useState<number>(10000);
  const simTiers = generateWholesaleTiers(simPrice);

  const handleStartCreate = () => {
    setFormName('');
    setFormSku(`PROD-${Date.now().toString().slice(-5)}`);
    setFormDesc('');
    setFormPrice(10000);
    setFormStock(50);
    setFormIsWholesale(currentVendor.type === 'wholesale');
    setFormHas3D(false);
    setActiveTab('add_product');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct?.id || `prod-ven-${Date.now()}`,
      name: formName || 'Nouveau Produit Grossiste',
      sku: formSku || `SKU-${Date.now().toString().slice(-4)}`,
      description: formDesc || 'Description du produit certifié.',
      universe: formUniverse,
      category: formCategory,
      basePrice: formPrice,
      stock: formStock,
      vendorId: currentVendor.id,
      vendorName: currentVendor.name,
      vendorType: currentVendor.type,
      isWholesaleEligible: formIsWholesale,
      unitLabel: formUnit,
      images: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      ],
      has3DModel: formHas3D,
      model3DType: 'produce',
      specifications: {
        Fournisseur: currentVendor.companyName,
        Origine: 'Côte d’Ivoire',
      },
      featured: false,
      rating: 5.0,
      reviewCount: 1,
      status: 'published',
      createdAt: new Date().toISOString(),
    };

    onSaveProduct(newProduct);
    setActiveTab('products');
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Top Vendor Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={OFFICIAL_LOGO_PATH} alt="G Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">{currentVendor.name}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-red-400 border border-neutral-700">
                  {currentVendor.type === 'wholesale' ? 'Compte Grossiste' : 'Compte Standard'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{currentVendor.companyName} · {currentVendor.city}</p>
            </div>
          </div>

          {/* Switch vendor tester */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700">
              <span className="text-neutral-400">Tester un autre vendeur:</span>
              <select
                value={currentVendor.id}
                onChange={(e) => {
                  const target = allVendors.find((v) => v.id === e.target.value);
                  if (target) onSelectVendor(target);
                }}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {allVendors.map((v) => (
                  <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                    {v.name} ({v.type === 'wholesale' ? 'Grossiste' : 'Standard'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Fermer le tableau de bord"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Metrics Bar */}
        <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'products' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Mes Produits ({vendorProducts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'orders' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Mes Commandes Reçues ({vendorOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'simulator' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              Simulateur Paliers Grossiste
            </button>

            <button
              type="button"
              onClick={handleStartCreate}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'add_product' ? 'bg-neutral-900 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un Article
            </button>
          </div>

          <div className="flex items-center gap-4 text-neutral-600 font-semibold">
            <span>CA Total : <strong className="text-neutral-900">{formatFCFA(totalRevenue)}</strong></span>
            <span>Commission : 8%</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-neutral-900">
                  Catalogue Vendeur ({vendorProducts.length} articles)
                </h3>
              </div>

              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {vendorProducts.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{p.name}</div>
                        <div className="text-neutral-500 text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{p.universe} / {p.category}</span>
                          <span>·</span>
                          <span>Stock: {p.stock}</span>
                          {p.has3DModel && <span className="text-red-600 font-bold">Modèle 3D Actif</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-black text-neutral-900 text-sm">{formatFCFA(p.basePrice)}</div>
                        {p.isWholesaleEligible ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Tarif Grossiste Activé (-5%/10u)
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">Tarif Unique Standard</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...p, isWholesaleEligible: !p.isWholesaleEligible };
                          onSaveProduct(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                          p.isWholesaleEligible
                            ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {p.isWholesaleEligible ? 'Désactiver Grossiste' : 'Activer Grossiste'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-neutral-900">
                Lignes de commandes attribuées à votre boutique
              </h3>

              {vendorOrders.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  Aucune commande reçue pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorOrders.map(({ mainOrder, subOrder }, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <div>
                          <span className="font-bold text-neutral-900">{mainOrder.orderNumber}</span>
                          <span className="text-neutral-400 ml-2">Client : {mainOrder.customerName} ({mainOrder.shippingCity})</span>
                        </div>
                        <span className="text-red-600 font-bold">{formatFCFA(subOrder.subtotal)}</span>
                      </div>

                      <div className="space-y-1">
                        {subOrder.items.map((line: any, lIdx: number) => (
                          <div key={lIdx} className="flex justify-between text-neutral-700">
                            <span>
                              {line.quantity}x {line.productName} (Base: {formatFCFA(line.baseUnitPrice)})
                            </span>
                            <span className="font-semibold">
                              {line.discountPercentApplied > 0 && `-${line.discountPercentApplied}% -> `}
                              {formatFCFA(line.lineSubtotal)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex justify-between text-[11px] text-neutral-500">
                        <span>Paiement: {mainOrder.paymentMethod.toUpperCase()} ({mainOrder.paymentStatus})</span>
                        <span>Net à percevoir après commission 8% : {formatFCFA(subOrder.vendorNetPayout)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-5 max-w-2xl mx-auto bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
              <div>
                <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  Simulateur de Barème Dégressif Grossiste (Cahier des charges V2)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Chaque dizaine d’unités supplémentaire ajoute exactement +5 points de pourcentage de remise sur le prix de base.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Définir un prix unitaire de test (FCFA)
                </label>
                <input
                  type="number"
                  step="500"
                  value={simPrice}
                  onChange={(e) => setSimPrice(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full p-3 rounded-xl border border-neutral-300 bg-white text-base font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white text-xs">
                {simTiers.map((tier, i) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900">
                        {tier.maxQty ? `De ${tier.minQty} à ${tier.maxQty} unités` : `À partir de ${tier.minQty} unités`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {tier.discountPercent === 0 ? '0% (Prix normal)' : `-${tier.discountPercent}% de remise`}
                      </span>
                      <span className="font-black text-neutral-950 w-28 text-right">
                        {formatFCFA(tier.unitPrice)} / u.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'add_product' && (
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-4 text-xs">
              <h3 className="text-sm font-black text-neutral-900">
                Création / Publication d’un Produit Vendeur
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Nom du Produit</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ex: Sac d'Attiéké Déshydraté Premium 10kg"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Univers Commercial</label>
                  <select
                    value={formUniverse}
                    onChange={(e) => setFormUniverse(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  >
                    {COMMERCIAL_UNIVERSES.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="ex: Vivriers, Céréales..."
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Prix de base unitaire (FCFA)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Unité de conditionnement</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="ex: Sac 25kg, Carton de 12, Bidon 20L"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Description détaillée</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Description complète, qualité, conditionnement..."
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsWholesale}
                    onChange={(e) => setFormIsWholesale(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-neutral-900">Activer le barème dégressif Vente en Gros V2</span>
                    <p className="text-[11px] text-neutral-500">
                      Active automatiquement les remises : 10u (-5%), 20u (-10%), 30u (-15%), +5%/dizaine.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHas3D}
                    onChange={(e) => setFormHas3D(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-neutral-900">Activer le modèle 3D interactif</span>
                    <p className="text-[11px] text-neutral-500">
                      Génère la visualisation WebGL 360° pour les acheteurs sur la fiche produit.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Publier l’Article sur la Marketplace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
