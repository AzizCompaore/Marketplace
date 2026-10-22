import React, { useState } from 'react';
import {
  MainNavSpace,
  UserRole,
  Product,
  Vendor,
  BusinessEntity,
  MallPartner,
  AdCampaign,
  CartItem,
  MainOrder,
  CommercialUniverse,
  ProductVariant,
} from './types';
import {
  COMMERCIAL_UNIVERSES,
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_MALLS,
  INITIAL_BUSINESSES,
  INITIAL_AD_CAMPAIGNS,
} from './data/mockData';
import { formatFCFA, calculateLinePricing } from './utils/pricing';
import { Header } from './components/Header';
import { BrandLogo, OFFICIAL_LOGO_PATH } from './components/BrandLogo';
import { HomeSearch } from './components/HomeSearch';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import {
  Sparkles,
  Search,
  Store,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Phone,
  Mail,
  MapPin,
  Package,
  Layers,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Navigation Space State
  const [currentSpace, setCurrentSpace] = useState<MainNavSpace>('home');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('client');

  // Core Data Collections
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [businesses, setBusinesses] = useState<BusinessEntity[]>(INITIAL_BUSINESSES);
  const [malls] = useState<MallPartner[]>(INITIAL_MALLS);
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(INITIAL_AD_CAMPAIGNS);
  const [orders, setOrders] = useState<MainOrder[]>([]);

  // User State: Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isVendorDashOpen, setIsVendorDashOpen] = useState(false);
  const [isAdminDashOpen, setIsAdminDashOpen] = useState(false);

  // Age Verification for +18 space
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  // Filters & Sub-views
  const [selectedUniverse, setSelectedUniverse] = useState<CommercialUniverse | 'all'>('all');
  const [wholesaleOnlyFilter, setWholesaleOnlyFilter] = useState(false);
  const [shoppingSearchQuery, setShoppingSearchQuery] = useState('');
  const [selectedMall, setSelectedMall] = useState<MallPartner | null>(null);
  const [selectedBusinessSector, setSelectedBusinessSector] = useState<string>('all');
  const [selectedBusinessForQuote, setSelectedBusinessForQuote] = useState<BusinessEntity | null>(null);

  // Active vendor for Vendor Dashboard simulation
  const [activeVendor, setActiveVendor] = useState<Vendor>(INITIAL_VENDORS[0]);

  // Handlers for Cart
  const handleAddToCart = (product: Product, quantity = 1, selectedVariant?: ProductVariant) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((it) => it.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        const pricing = calculateLinePricing(product, newQty);
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          calculatedUnitPrice: pricing.unitPriceAfterDiscount,
          calculatedDiscountPercent: pricing.discountPercent,
          calculatedDiscountAmount: pricing.totalDiscountAmount,
          calculatedSubtotal: pricing.lineSubtotal,
        };
        return updated;
      } else {
        const pricing = calculateLinePricing(product, quantity);
        const newItem: CartItem = {
          product,
          quantity,
          selectedVariant,
          calculatedUnitPrice: pricing.unitPriceAfterDiscount,
          calculatedDiscountPercent: pricing.discountPercent,
          calculatedDiscountAmount: pricing.totalDiscountAmount,
          calculatedSubtotal: pricing.lineSubtotal,
        };
        return [...prevCart, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const pricing = calculateLinePricing(item.product, newQty);
          return {
            ...item,
            quantity: newQty,
            calculatedUnitPrice: pricing.unitPriceAfterDiscount,
            calculatedDiscountPercent: pricing.discountPercent,
            calculatedDiscountAmount: pricing.totalDiscountAmount,
            calculatedSubtotal: pricing.lineSubtotal,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Navigation Handler with Space Switching
  const handleNavigate = (space: MainNavSpace) => {
    if (space === 'plus18' && !isAgeVerified) {
      setIsAgeModalOpen(true);
      return;
    }
    setCurrentSpace(space);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product Selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  // Search Submission from Central Engine
  const handleSearchSubmit = (query: string) => {
    setShoppingSearchQuery(query);
    if (query.toLowerCase().includes('grossiste')) {
      setWholesaleOnlyFilter(true);
    }
    setCurrentSpace('shopping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vendor Save / Edit Product
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        return [updatedProduct, ...prev];
      }
    });
  };

  // Order Success from Checkout
  const handleOrderSuccess = (order: MainOrder) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  // Filtered products for Shopping view
  const filteredShoppingProducts = products.filter((p) => {
    if (p.isPlus18 && currentSpace !== 'plus18') return false;
    if (selectedUniverse !== 'all' && p.universe !== selectedUniverse) return false;
    if (wholesaleOnlyFilter && !p.isWholesaleEligible) return false;
    if (shoppingSearchQuery.trim()) {
      const q = shoppingSearchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchVen = p.vendorName.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchVen) return false;
    }
    return true;
  });

  // Filtered Supermarket Products
  const supermarketProducts = products.filter(
    (p) => p.universe === 'Supermarché' && !p.isPlus18
  );

  // Business Sectors unique list
  const businessSectors = Array.from(new Set(businesses.map((b) => b.sector)));
  const filteredBusinesses = businesses.filter(
    (b) => selectedBusinessSector === 'all' || b.sector === selectedBusinessSector
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentSpace={currentSpace}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, it) => sum + it.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        currentUserRole={currentUserRole}
        onChangeUserRole={(role) => setCurrentUserRole(role)}
        onOpenVendorDashboard={() => setIsVendorDashOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {/* ========================================================
            VIEW: HOME (Search Engine Inspired, Clean, Curated, No Videos)
            ======================================================== */}
        {currentSpace === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Search Engine Hero Section with Official Logo Emblem */}
            <section className="pt-10 sm:pt-16 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center">
              {/* Copiously integrated Official Logo in Hero */}
              <div
                onClick={() => handleNavigate('apropos')}
                className="inline-block cursor-pointer group mb-4 transition-transform hover:scale-105"
                title="Découvrir l'histoire du logo officiel G"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-3xl mx-auto p-1 border-2 border-neutral-800 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-neutral-600 transition-colors">
                  <img
                    src={OFFICIAL_LOGO_PATH}
                    alt="Logo Officiel G"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-200/80 text-neutral-800 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Plateforme E-Commerce Multi-Vendeurs & Tarification Grossiste V2</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight sm:leading-none max-w-3xl mx-auto">
                Tout trouver, négocier et commander en Côte d’Ivoire.
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto mt-4 mb-8">
                De l’achat unitaire au tarif dégressif grossiste (-5% par dizaine d’articles), explorez supermarché vivrier, grandes enseignes et services professionnels.
              </p>

              {/* Central Dominant Search Bar */}
              <HomeSearch
                products={products}
                businesses={businesses}
                malls={malls}
                onSelectProduct={handleSelectProduct}
                onSearchSubmit={handleSearchSubmit}
                onNavigateSpace={handleNavigate}
              />
            </section>

            {/* Featured Active Ad Banner (Section 5.4) */}
            {adCampaigns.filter((a) => a.isActive).length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {(() => {
                  const activeAd = adCampaigns.find((a) => a.isActive)!;
                  return (
                    <div
                      onClick={() => handleNavigate(activeAd.targetLink as any)}
                      className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-6 sm:p-10 cursor-pointer group shadow-lg border border-neutral-800"
                    >
                      <img
                        src={activeAd.imageUrl}
                        alt={activeAd.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="relative z-10 max-w-xl space-y-3">
                        <span className="inline-block bg-red-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
                          {activeAd.badgeText || 'À la Une'}
                        </span>
                        <h2 className="text-xl sm:text-3xl font-black leading-snug">
                          {activeAd.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-300">
                          {activeAd.subtitle}
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-xs font-bold text-red-400 group-hover:text-red-300">
                          <span>Accéder à l’offre</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Curated Limited Product Selection (Section 5.3) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-950">
                    Sélection du Jour & Démonstrateurs 3D
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Produits phares éligibles aux remises grossistes et visualisations immersives 360°
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate('shopping')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <span>Voir tout le catalogue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products
                  .filter((p) => !p.isPlus18)
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                      onQuickAdd={(p) => handleAddToCart(p, 1)}
                      isWishlisted={wishlist.some((w) => w.id === product.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            </section>

            {/* Partner Malls Preview (Galerie) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-950">
                    Grandes Galeries & Enseignes d’Abidjan
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Commandez dans les plus grands centres commerciaux sans vous déplacer
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigate('galerie')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <span>Toutes les enseignes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {malls.map((mall) => (
                  <div
                    key={mall.id}
                    onClick={() => {
                      setSelectedMall(mall);
                      handleNavigate('galerie');
                    }}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={mall.coverImage}
                        alt={mall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 p-1 bg-white rounded-lg shadow-sm border border-neutral-200">
                        <img src={mall.logo} alt={mall.name} className="w-8 h-8 rounded object-cover" />
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="font-bold text-neutral-900 text-sm group-hover:text-red-600 transition-colors">
                        {mall.name}
                      </h3>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{mall.location}</p>
                      <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{mall.storeCount} boutiques</span>
                        <span className="font-semibold text-red-600 group-hover:underline">Ouvrir l’espace →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            VIEW: SHOPPING (10 Commercial Universes Marketplace)
            ======================================================== */}
        {currentSpace === 'shopping' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
                  Espace Shopping & Catalogue Général
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Les 10 univers commerciaux réunis avec tarification transparente en FCFA
                </p>
              </div>

              {/* Wholesale filter badge button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWholesaleOnlyFilter((prev) => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    wholesaleOnlyFilter
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-md ring-2 ring-red-500'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Uniquement Grossistes (-5% / 10u)</span>
                </button>
              </div>
            </div>

            {/* 10 Universes Pills Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedUniverse('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedUniverse === 'all'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                Tous les 10 Univers ({products.filter((p) => !p.isPlus18).length})
              </button>

              {COMMERCIAL_UNIVERSES.map((univ) => {
                const count = products.filter((p) => p.universe === univ && !p.isPlus18).length;
                return (
                  <button
                    key={univ}
                    type="button"
                    onClick={() => setSelectedUniverse(univ)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedUniverse === univ
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    {univ} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input Filter */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-200 max-w-md shadow-xs">
              <Search className="w-4 h-4 text-neutral-400 ml-2" />
              <input
                type="text"
                value={shoppingSearchQuery}
                onChange={(e) => setShoppingSearchQuery(e.target.value)}
                placeholder="Filtrer par nom de produit, catégorie, marque..."
                className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none"
              />
              {shoppingSearchQuery && (
                <button
                  type="button"
                  onClick={() => setShoppingSearchQuery('')}
                  className="text-xs text-neutral-400 hover:text-neutral-700 mr-2"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredShoppingProducts.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">Aucun produit ne correspond aux filtres</h3>
                <p className="text-xs mt-1">Essayez de réinitialiser vos critères de recherche ou de catégorie.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUniverse('all');
                    setWholesaleOnlyFilter(false);
                    setShoppingSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredShoppingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onQuickAdd={(p) => handleAddToCart(p, 1)}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW: SUPERMARCHÉ (Local Food, Agriculture, Fresh Produce)
            ======================================================== */}
        {currentSpace === 'supermarche' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Supermarket Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-emerald-950 text-white p-8 sm:p-12 shadow-lg border border-emerald-900">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
                  Marché Local & Vivriers de Côte d’Ivoire
                </span>
                <h1 className="text-2xl sm:text-4xl font-black">
                  Frais, Vivriers, Céréales & Boissons en Direct
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200">
                  Riz Dinor, huiles raffinées, bananes plantains d’Agboville et denrées maraîchères. Livraison express sous température contrôlée sur Abidjan et expéditions régionales.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-emerald-300">
                  <span>✓ Tarification dégressive grossiste certifiée</span>
                  <span>✓ Garantie fraîcheur du jour</span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-neutral-900">
                  Produits Disponibles au Supermarché ({supermarketProducts.length})
                </h2>
                <span className="text-xs text-neutral-500">Unité, poids et conditions de conservation indiqués</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {supermarketProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onQuickAdd={(p) => handleAddToCart(p, 1)}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW: GALERIE (Partner Malls & Hypermarkets)
            ======================================================== */}
        {currentSpace === 'galerie' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="pb-4 border-b border-neutral-200">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
                Galerie des Grandes Surfaces & Enseignes Partenaires
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Explorez Prima Center, Cap Nord, PlaYce et Cosmos Yopougon comme si vous y étiez
              </p>
            </div>

            {selectedMall ? (
              /* Dedicated Mall Boutique View */
              <div className="space-y-8 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setSelectedMall(null)}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5"
                >
                  <span>← Retour à toutes les enseignes de la Galerie</span>
                </button>

                <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[220px] flex items-end p-6 sm:p-10">
                  <img
                    src={selectedMall.coverImage}
                    alt={selectedMall.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="relative z-10 space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <img src={selectedMall.logo} alt={selectedMall.name} className="w-12 h-12 rounded-xl object-cover bg-white p-1" />
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black">{selectedMall.name}</h2>
                        <p className="text-xs text-neutral-300">{selectedMall.location} · {selectedMall.city}</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-200">{selectedMall.description}</p>
                    <div className="text-[11px] text-neutral-400">Horaires : {selectedMall.openingHours}</div>
                  </div>
                </div>

                {/* Brands inside Mall */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-neutral-900">Enseignes & Boutiques Présentes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMall.featuredBrands.map((brand, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-800 shadow-xs">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products matching this category */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-black text-neutral-900">Articles Sélectionnés chez {selectedMall.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onSelect={handleSelectProduct}
                        onQuickAdd={(item) => handleAddToCart(item, 1)}
                        isWishlisted={wishlist.some((w) => w.id === p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Malls Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {malls.map((mall) => (
                  <div
                    key={mall.id}
                    onClick={() => setSelectedMall(mall)}
                    className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={mall.coverImage}
                        alt={mall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-4 left-4 p-1.5 bg-white rounded-xl shadow-md">
                        <img src={mall.logo} alt={mall.name} className="w-10 h-10 rounded-lg object-cover" />
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-black text-neutral-900 group-hover:text-red-600 transition-colors">
                            {mall.name}
                          </h3>
                          <p className="text-xs text-neutral-500">{mall.tagline}</p>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                          {mall.storeCount} boutiques
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-2">{mall.description}</p>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                        <span>{mall.location}</span>
                        <span className="font-bold text-neutral-900 group-hover:text-red-600 flex items-center gap-1">
                          Consulter les rayons →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW: BUSINESS (Professional B2B Directory)
            ======================================================== */}
        {currentSpace === 'business' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="pb-4 border-b border-neutral-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold mb-2">
                <Building2 className="w-3.5 h-3.5 text-neutral-900" />
                <span>Annuaire Professionnel B2B & Prestations Certifiées</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
                Trouver un Prestataire & Entreprise en Côte d’Ivoire
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Comptabilité, audit, immobilier, mécanique, transport et services aux entreprises
              </p>
            </div>

            {/* Sector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedBusinessSector('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedBusinessSector === 'all'
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                Tous les Secteurs ({businesses.length})
              </button>

              {businessSectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => setSelectedBusinessSector(sector)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedBusinessSector === sector
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {sector} ({businesses.filter((b) => b.sector === sector).length})
                </button>
              ))}
            </div>

            {/* Businesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-xs hover:shadow-lg transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={biz.logo} alt={biz.name} className="w-12 h-12 rounded-2xl object-cover border border-neutral-200" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-neutral-950 text-sm sm:text-base">{biz.name}</h3>
                          {biz.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        </div>
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{biz.sector}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Vérifié G-Market
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">{biz.description}</p>

                  <div className="space-y-1 pt-2 border-t border-neutral-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Services Clés :</span>
                    <ul className="text-xs text-neutral-700 space-y-1">
                      {biz.services.map((serv, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
                          <span>{serv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5 text-neutral-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{biz.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{biz.phone}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBusinessForQuote(biz)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-red-600 text-white font-bold text-xs transition-colors"
                    >
                      Demander un devis
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote Modal */}
            {selectedBusinessForQuote && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-sm text-neutral-900">Demande de contact : {selectedBusinessForQuote.name}</h3>
                    <button type="button" onClick={() => setSelectedBusinessForQuote(null)} className="text-neutral-400 hover:text-neutral-900">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Votre message sera transmis directement au responsable de {selectedBusinessForQuote.name}.
                  </p>
                  <input type="text" placeholder="Votre nom" className="w-full p-2.5 rounded-xl border text-xs" defaultValue="Amadou Koné" />
                  <input type="tel" placeholder="Votre téléphone" className="w-full p-2.5 rounded-xl border text-xs" defaultValue="+225 07 58 92 11 04" />
                  <textarea rows={3} placeholder="Détaillez votre besoin de service..." className="w-full p-2.5 rounded-xl border text-xs" defaultValue="Bonjour, je souhaite obtenir une proposition de devis pour vos services." />
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Votre demande a été transmise avec succès à ${selectedBusinessForQuote.name}.`);
                      setSelectedBusinessForQuote(null);
                    }}
                    className="w-full py-3 bg-red-600 text-white font-bold text-xs rounded-xl"
                  >
                    Envoyer ma demande de devis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW: +18 (Restricted Adult Products)
            ======================================================== */}
        {currentSpace === 'plus18' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="rounded-3xl bg-neutral-950 text-white p-8 border border-neutral-800 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 text-red-400 text-xs font-bold border border-red-800">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>Accès Majeur Vérifié (+18 ans)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black">Espace Spiritueux Fins & Caves de Prestige</h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
                Sélection réservée aux amateurs avertis et établissements hôteliers. Vins millésimés, rhums vieux en fûts de chêne et accessoires d’art de vivre.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products
                .filter((p) => p.isPlus18)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onQuickAdd={(p) => handleAddToCart(p, 1)}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW: À PROPOS (Reached when clicking Logo from Home)
            ======================================================== */}
        {currentSpace === 'apropos' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
            {/* Copiously integrated Official Logo in About Page Hero */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-black rounded-3xl mx-auto flex items-center justify-center shadow-2xl border-2 border-neutral-800 p-1 overflow-hidden">
                <img
                  src={OFFICIAL_LOGO_PATH}
                  alt="Logo Officiel G"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-neutral-950">
                À Propos de G-Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
                L’infrastructure commerciale nouvelle génération conçue selon les spécifications officielles des Cahiers des charges V1 et V2.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-neutral-950 text-white">
                <div className="w-20 h-20 rounded-2xl bg-black border border-neutral-800 p-0.5 overflow-hidden shrink-0 shadow-lg">
                  <img src={OFFICIAL_LOGO_PATH} alt="Logo G" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">Identité Visuelle Officielle Intégrée</h3>
                  <p className="text-xs text-neutral-300">
                    Fond noir absolu, repères d'angle de visée blancs (*viewfinder brackets*), lettre capitale « G » centrale blanche et point rouge vif d'accentuation stratégique.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-base font-black text-neutral-900 mb-2">1. L’Identité Visuelle et Positionnement</h2>
                <p>
                  Le logo officiel de la plateforme symbolise le cadrage de précision logistique et l'excellence du commerce moderne en Côte d’Ivoire et dans l'espace UEMOA/CEDEAO. Le noir et blanc profond incarnent la rigueur et l'élégance, tandis que le point rouge marque les opportunités commerciales prioritaires.
                </p>
              </div>

              <div>
                <h2 className="text-base font-black text-neutral-900 mb-2">2. La Règle Spéciale de Navigation du Logo</h2>
                <p>
                  Conformément au cahier des charges :
                  <br />
                  - <strong>Depuis la page d’accueil</strong>, cliquer sur le logo mène directement à cette page « À propos ».
                  <br />
                  - <strong>Depuis n’importe quelle autre page</strong> (Shopping, Supermarché, Galerie, Business, +18), cliquer sur le logo ramène immédiatement à la page d’accueil avec sa barre de recherche centrale.
                </p>
              </div>

              <div>
                <h2 className="text-base font-black text-neutral-900 mb-2">3. La Tarification Dégressive Grossiste (Cahier des charges V2)</h2>
                <p>
                  La plateforme implémente fidèlement le barème officiel cumulatif :
                  <br />
                  • 1 à 9 unités : 0%
                  <br />
                  • 10 à 19 unités : 5%
                  <br />
                  • 20 à 29 unités : 10%
                  <br />
                  • 30 à 39 unités : 15%
                  <br />
                  • 40 à 49 unités : 20%
                  <br />
                  • Chaque dizaine supplémentaire ajoute 5 points de pourcentage de remise, calculée précisément côté serveur sans erreurs de virgule flottante.
                </p>
              </div>

              <div>
                <h2 className="text-base font-black text-neutral-900 mb-2">4. Les 5 Univers Commerciaux Distincts</h2>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li><strong>Shopping :</strong> Les 10 univers commerciaux avec filtres et fiches détaillées.</li>
                  <li><strong>Supermarché :</strong> Produits vivriers locaux, fruits, légumes et denrées fraîches.</li>
                  <li><strong>Galerie :</strong> Grandes surfaces et enseignes d’Abidjan (Prima Center, Cap Nord, Playce, Cosmos).</li>
                  <li><strong>Business :</strong> Annuaire B2B vérifié (Comptabilité, Finance, Immobilier, Mécanique, etc.).</li>
                  <li><strong>+18 :</strong> Espace adulte protégé avec contrôle d’âge réglementaire.</li>
                </ul>
              </div>

              <div className="pt-4 border-t flex justify-center">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Retourner au Moteur de Recherche Accueil</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Copiously Integrated Official Logo */}
      <footer className="border-t border-neutral-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg p-0.5 border border-neutral-800 overflow-hidden shrink-0 shadow-xs">
              <img src={OFFICIAL_LOGO_PATH} alt="Logo G" className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-neutral-900 tracking-tight">G-MARKETPLACE CI</span>
              <span>·</span>
              <span>Conforme aux Cahiers des charges V1 & V2</span>
              <span>·</span>
              <span>Devise : FCFA (XOF)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" onClick={() => handleNavigate('shopping')} className="hover:text-neutral-900">Shopping</button>
            <button type="button" onClick={() => handleNavigate('supermarche')} className="hover:text-neutral-900">Supermarché</button>
            <button type="button" onClick={() => handleNavigate('galerie')} className="hover:text-neutral-900">Galerie</button>
            <button type="button" onClick={() => handleNavigate('business')} className="hover:text-neutral-900">Business</button>
            <button type="button" onClick={() => handleNavigate('plus18')} className="hover:text-neutral-900">+18</button>
            <button type="button" onClick={() => handleNavigate('apropos')} className="hover:text-neutral-900">À Propos</button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlist.some((w) => w.id === selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onClearCart={handleClearCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onOpenProductDetail={handleSelectProduct}
      />

      <VendorDashboard
        isOpen={isVendorDashOpen}
        onClose={() => setIsVendorDashOpen(false)}
        currentVendor={activeVendor}
        allVendors={vendors}
        onSelectVendor={(v) => setActiveVendor(v)}
        products={products}
        onSaveProduct={handleSaveProduct}
        orders={orders}
      />

      <AdminDashboard
        isOpen={isAdminDashOpen}
        onClose={() => setIsAdminDashOpen(false)}
        adCampaigns={adCampaigns}
        onUpdateAdCampaigns={(ads) => setAdCampaigns(ads)}
        vendors={vendors}
        onUpdateVendors={(v) => setVendors(v)}
        businesses={businesses}
        onUpdateBusinesses={(b) => setBusinesses(b)}
        orders={orders}
      />

      <AgeVerificationModal
        isOpen={isAgeModalOpen}
        onConfirm={() => {
          setIsAgeVerified(true);
          setIsAgeModalOpen(false);
          setCurrentSpace('plus18');
        }}
        onReject={() => {
          setIsAgeModalOpen(false);
          setCurrentSpace('home');
        }}
      />
    </div>
  );
}
