import React, { useState } from 'react';
import { CartItem, MainOrder } from '../types';
import { formatFCFA, calculateCartBreakdown } from '../utils/pricing';
import {
  X,
  CheckCircle,
  Truck,
  CreditCard,
  ShieldCheck,
  Building,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  Printer,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: MainOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [customerName, setCustomerName] = useState('Amadou Koné');
  const [customerPhone, setCustomerPhone] = useState('+225 07 58 92 11 04');
  const [customerEmail, setCustomerEmail] = useState('amadou.kone@gmail.com');
  const [shippingAddress, setShippingAddress] = useState('Rue des Jardins, Immeuble Horizon Apt 4B');
  const [shippingCity, setShippingCity] = useState('Abidjan - Cocody');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'abidjan_express' | 'point_relais'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'card' | 'cod'>('wave');
  const [customerNotes, setCustomerNotes] = useState('');
  const [createdOrder, setCreatedOrder] = useState<MainOrder | null>(null);

  const summary = calculateCartBreakdown(items, shippingMethod);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = `G-CMD-${Date.now().toString().slice(-6)}`;
    const newOrder: MainOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      totalBaseAmount: summary.totalBaseAmount,
      totalWholesaleSavings: summary.totalWholesaleSavings,
      shippingTotal: summary.shippingTotal,
      totalAmount: summary.totalAmount,
      status: 'confirmed',
      vendorSubOrders: summary.vendorSubOrders,
      customerNotes,
    };

    setCreatedOrder(newOrder);
    setStep('confirmation');
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <h2 className="text-base font-black text-neutral-900">
              {step === 'details' ? 'Finaliser la commande' : 'Confirmation de Commande'}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleConfirmOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Wholesale discount notice */}
            {summary.totalWholesaleSavings > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>
                  Barème Vente en Gros V2 appliqué : <strong>{formatFCFA(summary.totalWholesaleSavings)}</strong> de remise calculée côté serveur.
                </span>
              </div>
            )}

            {/* Recipient Coordinates */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Coordonnées du destinataire
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Nom & Prénoms</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                    placeholder="ex: Amadou Koné"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Téléphone de contact</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                    placeholder="+225 07..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Adresse de livraison en Côte d’Ivoire
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Commune / Ville</label>
                  <select
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none bg-white font-medium"
                  >
                    <option value="Abidjan - Cocody">Abidjan - Cocody</option>
                    <option value="Abidjan - Plateau">Abidjan - Plateau</option>
                    <option value="Abidjan - Marcory">Abidjan - Marcory</option>
                    <option value="Abidjan - Yopougon">Abidjan - Yopougon</option>
                    <option value="Abidjan - Treichville">Abidjan - Treichville</option>
                    <option value="Abidjan - Deux Plateaux">Abidjan - Deux Plateaux</option>
                    <option value="Intérieur - Bouaké">Intérieur - Bouaké</option>
                    <option value="Intérieur - San-Pédro">Intérieur - San-Pédro</option>
                    <option value="Intérieur - Yamoussoukro">Intérieur - Yamoussoukro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Option de livraison</label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none bg-white font-medium"
                  >
                    <option value="standard">Standard (24h-48h) · 1 500 FCFA</option>
                    <option value="abidjan_express">Express Prioritaire (&lt;4h) · 2 500 FCFA</option>
                    <option value="point_relais">Point Relais Partenaire · 1 000 FCFA</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Précisions d’adresse / Repère</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                    placeholder="ex: Rue des Jardins, face pharmacie, Immeuble..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Moyen de paiement sécurisé
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: 'wave', name: 'Wave Côte d’Ivoire', tag: '0% de frais' },
                  { id: 'orange_money', name: 'Orange Money', tag: 'OM CI' },
                  { id: 'mtn_momo', name: 'MTN Mobile Money', tag: 'MoMo' },
                  { id: 'moov_money', name: 'Moov Money Flooz', tag: 'Moov' },
                  { id: 'card', name: 'Carte Visa / Mastercard', tag: 'Bancaire' },
                  { id: 'cod', name: 'Paiement à la livraison', tag: 'Espèces' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === pm.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm ring-2 ring-red-500'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{pm.name}</div>
                    <div className={`text-[10px] mt-0.5 ${paymentMethod === pm.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {pm.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Final Order Recap Table */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Total brut catalogue</span>
                <span>{formatFCFA(summary.totalBaseAmount)}</span>
              </div>
              {summary.totalWholesaleSavings > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Économie dégressive grossiste</span>
                  <span>-{formatFCFA(summary.totalWholesaleSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Frais logistiques & livraison ({summary.vendorCount} vendeur{summary.vendorCount > 1 ? 's' : ''})</span>
                <span>{formatFCFA(summary.shippingTotal)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-950">
                <span>Total Net TTC</span>
                <span className="text-xl text-red-600">{formatFCFA(summary.totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirmer la commande · {formatFCFA(summary.totalAmount)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Commande Enregistrée avec Succès
              </span>
              <h3 className="text-2xl font-black text-neutral-900 mt-1">
                {createdOrder?.orderNumber}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Un récapitulatif a été transmis à {createdOrder?.customerEmail} et à vos vendeurs partenaires.
              </p>
            </div>

            {/* Order breakdown per vendor */}
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-left space-y-3 text-xs">
              <div className="font-bold text-neutral-800 border-b border-neutral-200 pb-2 flex justify-between">
                <span>Détail par Vendeur ({createdOrder?.vendorSubOrders.length})</span>
                <span>Statut : {createdOrder?.paymentStatus === 'paid' ? 'Payé' : 'À la livraison'}</span>
              </div>

              {createdOrder?.vendorSubOrders.map((sub, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-neutral-100 space-y-1">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>{sub.vendorName}</span>
                    <span className="text-red-600">{formatFCFA(sub.subtotal)}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {sub.items.map((it) => `${it.quantity}x ${it.productName} (-${it.discountPercentApplied}%)`).join(', ')}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-neutral-200 flex justify-between font-black text-sm text-neutral-900">
                <span>Total Réglé</span>
                <span>{formatFCFA(createdOrder?.totalAmount || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
              >
                Retour aux achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
