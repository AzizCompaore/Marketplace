import React from 'react';
import { Product } from '../types';
import { formatFCFA } from '../utils/pricing';
import { Sparkles, Heart, Eye, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist,
}) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div
        className="relative aspect-square w-full bg-neutral-100 overflow-hidden cursor-pointer"
        onClick={() => onSelect(product)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isWholesaleEligible && (
            <span className="bg-neutral-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1 border border-neutral-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              GROSSISTE -5% / 10u
            </span>
          )}

          {product.has3DModel && (
            <span className="bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Vue 3D 360°
            </span>
          )}

          {product.isFresh && (
            <span className="bg-emerald-700/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Vivrier Frais
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-red-50 text-red-600 shadow-md'
              : 'bg-white/80 text-neutral-600 hover:text-red-600 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 py-1.5 px-3 bg-white hover:bg-neutral-100 text-neutral-900 rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir détails
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          {/* Category & Universe */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
            <span>{product.universe}</span>
            <span>{product.unitLabel || '1 unité'}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-neutral-900 hover:text-red-600 line-clamp-2 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Seller Tag */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
            <span className="truncate">{product.vendorName}</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-neutral-950">
                {formatFCFA(product.promoPrice || product.basePrice)}
              </span>
              {product.promoPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatFCFA(product.basePrice)}
                </span>
              )}
            </div>

            {product.isWholesaleEligible ? (
              <span className="text-[10px] text-red-600 font-semibold">
                Dès 10 u. : {formatFCFA(Math.round(product.basePrice * 0.95))}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 font-medium">En stock ({product.stock})</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onQuickAdd(product)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-red-600 text-white transition-colors shadow-xs active:scale-95 cursor-pointer"
            title="Ajouter rapidement au panier"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
