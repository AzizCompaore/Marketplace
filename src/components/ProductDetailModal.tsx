import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { formatFCFA, calculateLinePricing, generateWholesaleTiers } from '../utils/pricing';
import {
  X,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedVariant?: ProductVariant) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  const pricing = calculateLinePricing(product, quantity);
  const wholesaleTiers = product.isWholesaleEligible ? generateWholesaleTiers(product.basePrice) : [];

  const handleQtyChange = (val: number) => {
    const safe = Math.max(1, Math.min(product.stock, val));
    setQuantity(safe);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-neutral-200 text-neutral-800">
              {product.universe}
            </span>
            <span className="text-xs text-neutral-400">/</span>
            <span className="text-xs font-medium text-neutral-600">{product.category}</span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
            aria-label="Fermer la fiche produit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Product photo gallery */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                {product.isWholesaleEligible && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Éligible Vente en Gros (-5% / 10u)
                  </span>
                )}
                {product.isFresh && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Frais & Vivrier
                  </span>
                )}
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImageIndex === idx ? 'border-red-600 ring-2 ring-red-100' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Credibility Card */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                  <Store className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-neutral-900">{product.vendorName}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-neutral-500 capitalize">
                    {product.vendorType === 'wholesale' ? 'Vendeur Grossiste Agréé' : 'Vendeur Certifié'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-neutral-800">★ {product.rating}</div>
                <div className="text-[11px] text-neutral-500">{product.reviewCount} avis clients</div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Pricing Engine */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-950 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-400 mt-1">Réf: {product.sku}</p>
            </div>

            {/* Dynamic Live Price Display */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                    {pricing.discountPercent > 0 ? 'Prix unitaire remisé' : 'Prix unitaire normal'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {formatFCFA(pricing.unitPriceAfterDiscount)}
                    </span>
                    {pricing.discountPercent > 0 && (
                      <span className="text-sm text-neutral-400 line-through">
                        {formatFCFA(product.basePrice)}
                      </span>
                    )}
                  </div>
                </div>

                {pricing.discountPercent > 0 && (
                  <span className="bg-red-600 text-white font-extrabold text-sm px-3 py-1 rounded-full animate-bounce">
                    -{pricing.discountPercent}% Remise
                  </span>
                )}
              </div>

              {/* Subtotal line */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400">
                  Sous-total ({pricing.quantity} {pricing.quantity > 1 ? 'unités' : 'unité'}) :
                </span>
                <span className="text-base font-bold text-red-400">
                  {formatFCFA(pricing.lineSubtotal)}
                </span>
              </div>

              {pricing.totalDiscountAmount > 0 && (
                <div className="text-[11px] text-emerald-400 font-medium">
                  Économie brute réalisée : {formatFCFA(pricing.totalDiscountAmount)}
                </div>
              )}
            </div>

            {/* Wholesale Tier Table (Cahier des charges V2) */}
            {product.isWholesaleEligible && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Barème Officiel Grossiste V2 (+5% / 10 unités)
                  </div>
                  <span className="text-[11px] font-medium text-neutral-500">
                    Base: {formatFCFA(product.basePrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {wholesaleTiers.slice(0, 4).map((tier, idx) => {
                    const isCurrentTier =
                      quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty);
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isCurrentTier
                            ? 'bg-neutral-900 text-white border-neutral-900 ring-2 ring-red-500 shadow-md font-bold'
                            : 'bg-white text-neutral-800 border-neutral-200'
                        }`}
                      >
                        <div className="text-[10px] text-neutral-400">
                          {tier.maxQty ? `${tier.minQty} à ${tier.maxQty} u.` : `${tier.minQty}+ u.`}
                        </div>
                        <div className={`text-xs ${isCurrentTier ? 'text-red-400' : 'text-red-600 font-bold'}`}>
                          {tier.discountPercent === 0 ? 'Prix plein' : `-${tier.discountPercent}%`}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {formatFCFA(tier.unitPrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Next tier incentive notice */}
                {pricing.nextTierIncentive && (
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-neutral-200">
                    <ArrowRight className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <span>
                      Ajoutez <strong className="text-red-600">{pricing.nextTierIncentive.unitsNeeded} unité(s)</strong> pour passer au palier -{pricing.nextTierIncentive.nextDiscountPercent}% ({formatFCFA(pricing.nextTierIncentive.nextSavingsPerUnit)} d’économie / unité) !
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description & Storage notes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Description & Usage
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {product.description}
              </p>
              {product.storageConditions && (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{product.storageConditions}</span>
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="border-t border-neutral-100 pt-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Caractéristiques
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">{key}</span>
                      <span className="font-semibold text-neutral-800 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="border-t border-neutral-200 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-700">Quantité commandée</span>
                  <span className="text-[11px] text-neutral-400">
                    Stock disponible : {product.stock} {product.unitLabel || 'unités'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white text-neutral-800 font-bold flex items-center justify-center hover:bg-neutral-200 disabled:opacity-40 transition-colors shadow-sm"
                    aria-label="Diminuer la quantité"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
                    className="w-14 text-center font-bold text-sm bg-transparent focus:outline-none"
                    aria-label="Quantité"
                  />

                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 rounded-lg bg-white text-neutral-800 font-bold flex items-center justify-center hover:bg-neutral-200 disabled:opacity-40 transition-colors shadow-sm"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Jump Buttons for Wholesalers */}
              {product.isWholesaleEligible && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 font-medium">Lots rapides :</span>
                  {[10, 20, 30, 50].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleQtyChange(step)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        quantity === step
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {step} u. (-{step >= 50 ? '25%' : step >= 30 ? '15%' : step >= 20 ? '10%' : '5%'})
                    </button>
                  ))}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                    isWishlisted
                      ? 'border-red-600 bg-red-50 text-red-600'
                      : 'border-neutral-300 hover:border-neutral-400 text-neutral-700'
                  }`}
                  title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-label="Favoris"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ajouter au panier · {formatFCFA(pricing.lineSubtotal)}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-neutral-600" />
                  Livraison Abidjan sous 24h à 48h
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Paiement sécurisé ou à la livraison
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
