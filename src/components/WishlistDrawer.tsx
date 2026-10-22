import React from 'react';
import { Product } from '../types';
import { formatFCFA } from '../utils/pricing';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onOpenProductDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900">Mes Favoris</h2>
              <p className="text-xs text-neutral-500">{wishlist.length} article{wishlist.length > 1 ? 's' : ''} sauvegardé{wishlist.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-200 transition-colors"
            aria-label="Fermer les favoris"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <Heart className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">Aucun favori pour le moment</h3>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Cliquez sur le cœur sur n’importe quel article pour le garder en mémoire et surveiller son tarif grossiste.
              </p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-neutral-200 bg-white flex items-center gap-3 shadow-xs hover:border-neutral-300 transition-all text-xs"
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  onClick={() => {
                    onOpenProductDetail(item);
                    onClose();
                  }}
                  className="w-16 h-16 rounded-xl object-cover border border-neutral-200 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => {
                      onOpenProductDetail(item);
                      onClose();
                    }}
                    className="font-bold text-neutral-900 hover:text-red-600 line-clamp-1 cursor-pointer"
                  >
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-neutral-500">{item.universe} · {item.vendorName}</div>
                  <div className="font-black text-neutral-900 mt-1">
                    {formatFCFA(item.promoPrice || item.basePrice)}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddToCart(item)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-red-600 text-white transition-colors"
                    title="Ajouter au panier"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFromWishlist(item)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
