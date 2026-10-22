import React, { useState } from 'react';
import { CartItem, ProductVariant } from '../types';
import { formatFCFA, calculateCartBreakdown } from '../utils/pricing';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Store,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'abidjan_express' | 'point_relais'>('standard');
  const summary = calculateCartBreakdown(items, shippingMethod);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900">Mon Panier</h2>
              <p className="text-xs text-neutral-500">
                {summary.itemCount} article{summary.itemCount > 1 ? 's' : ''} · {summary.vendorCount} vendeur{summary.vendorCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-neutral-400 hover:text-red-600 transition-colors p-1"
                title="Vider le panier"
              >
                Vider
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-200 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <ShoppingBag className="w-10 h-10 stroke-1 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">Votre panier est vide</h3>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Explorez le Supermarché, la Galerie ou les 10 univers Shopping pour ajouter des produits à tarif individuel ou grossiste.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Commencer mes achats
              </button>
            </div>
          ) : (
            <>
              {/* Wholesale Savings Banner */}
              {summary.totalWholesaleSavings > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-900 font-semibold shadow-xs">
                  <Sparkles className="w-4 h-4 text-red-600 flex-shrink-0 animate-pulse" />
                  <div>
                    Économie dégressive grossiste active :{' '}
                    <strong className="text-red-700 font-black">
                      {formatFCFA(summary.totalWholesaleSavings)} économisés
                    </strong>{' '}
                    sur votre commande !
                  </div>
                </div>
              )}

              {/* Grouped by Vendor Sub-orders */}
              {summary.vendorSubOrders.map((vGroup) => (
                <div
                  key={vGroup.vendorId}
                  className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-xs"
                >
                  {/* Vendor Banner */}
                  <div className="px-4 py-2.5 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-800">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-red-600" />
                      Vendeur : {vGroup.vendorName}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-normal">
                      Sous-total : {formatFCFA(vGroup.subtotal)}
                    </span>
                  </div>

                  {/* Vendor Items */}
                  <div className="divide-y divide-neutral-100">
                    {vGroup.items.map((line) => {
                      return (
                        <div key={line.productId} className="p-3.5 flex gap-3 text-xs">
                          {/* Item Thumbnail */}
                          {(() => {
                            const originalItem = items.find((it) => it.product.id === line.productId);
                            const imgUrl = originalItem?.product.images[0] || '';
                            return (
                              <img
                                src={imgUrl}
                                alt={line.productName}
                                className="w-16 h-16 rounded-xl object-cover bg-neutral-100 border border-neutral-200 flex-shrink-0"
                              />
                            );
                          })()}

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-neutral-900 leading-snug line-clamp-1">
                                  {line.productName}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => onRemoveItem(line.productId)}
                                  className="text-neutral-400 hover:text-red-600 transition-colors p-0.5"
                                  title="Supprimer la ligne"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Applied Discount Tag */}
                              <div className="text-[10px] text-neutral-500 mt-0.5">
                                {line.discountPercentApplied > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                                    Palier -{line.discountPercentApplied}% grossiste appliqué
                                  </span>
                                ) : (
                                  <span>Prix unitaire régulier : {formatFCFA(line.baseUnitPrice)}</span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls & Line Subtotal */}
                            <div className="flex items-center justify-between mt-2 pt-1">
                              <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(line.productId, line.quantity - 1)}
                                  className="w-6 h-6 rounded bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-xs"
                                  aria-label="Diminuer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-8 text-center font-bold text-xs text-neutral-900">
                                  {line.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(line.productId, line.quantity + 1)}
                                  className="w-6 h-6 rounded bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-xs"
                                  aria-label="Augmenter"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-black text-neutral-950">
                                  {formatFCFA(line.lineSubtotal)}
                                </div>
                                {line.discountPercentApplied > 0 && (
                                  <div className="text-[10px] text-neutral-400 line-through">
                                    {formatFCFA(line.baseUnitPrice * line.quantity)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Delivery Option Selector */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-neutral-600" /> Mode de livraison
                  </span>
                  <span className="text-[11px] text-neutral-500">Abidjan & Banlieue</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('standard')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-neutral-900 bg-white font-bold text-neutral-900 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <div>Standard (24h)</div>
                    <div className="text-red-600 font-bold mt-0.5">1 500 FCFA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('abidjan_express')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      shippingMethod === 'abidjan_express'
                        ? 'border-neutral-900 bg-white font-bold text-neutral-900 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <div>Express (&lt;4h)</div>
                    <div className="text-red-600 font-bold mt-0.5">2 500 FCFA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('point_relais')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      shippingMethod === 'point_relais'
                        ? 'border-neutral-900 bg-white font-bold text-neutral-900 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <div>Point Relais</div>
                    <div className="text-red-600 font-bold mt-0.5">1 000 FCFA</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer / Checkout summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Sous-total articles bruts</span>
                <span>{formatFCFA(summary.totalBaseAmount)}</span>
              </div>

              {summary.totalWholesaleSavings > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Remises grossistes dégressives</span>
                  <span>-{formatFCFA(summary.totalWholesaleSavings)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frais de livraison ({summary.vendorCount} expéditeur{summary.vendorCount > 1 ? 's' : ''})</span>
                <span>{formatFCFA(summary.shippingTotal)}</span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-950">
                <span>Total à régler</span>
                <span className="text-xl text-red-600">{formatFCFA(summary.totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Valider la commande</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paiement sécurisé Mobile Money (Wave, Orange, MTN, Moov) & Cash</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
