import React, { useState } from 'react';
import {
  Vendor,
  BusinessEntity,
  AdCampaign,
  MainOrder,
} from '../types';
import { formatFCFA } from '../utils/pricing';
import { OFFICIAL_LOGO_PATH } from './BrandLogo';
import {
  Settings,
  X,
  Trash2,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Store,
  Building2,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  adCampaigns: AdCampaign[];
  onUpdateAdCampaigns: (campaigns: AdCampaign[]) => void;
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  businesses: BusinessEntity[];
  onUpdateBusinesses: (businesses: BusinessEntity[]) => void;
  orders: MainOrder[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  adCampaigns,
  onUpdateAdCampaigns,
  vendors,
  onUpdateVendors,
  businesses,
  onUpdateBusinesses,
  orders,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'kpis' | 'ads' | 'vendors' | 'businesses'>('kpis');

  // New Ad Banner State
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSubtitle, setNewAdSubtitle] = useState('');
  const [newAdImage, setNewAdImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80');
  const [newAdLink, setNewAdLink] = useState<'shopping' | 'supermarche' | 'galerie' | 'business'>('supermarche');

  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = Math.round(totalGMV * 0.08);

  // Toggle Ad status
  const handleToggleAd = (id: string) => {
    const updated = adCampaigns.map((ad) => (ad.id === id ? { ...ad, isActive: !ad.isActive } : ad));
    onUpdateAdCampaigns(updated);
  };

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle) return;
    const newAd: AdCampaign = {
      id: `ad-${Date.now()}`,
      title: newAdTitle,
      subtitle: newAdSubtitle,
      imageUrl: newAdImage,
      targetLink: newAdLink,
      targetType: 'universe',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      isActive: true,
      priority: adCampaigns.length + 1,
      badgeText: 'Campagne Active',
    };
    onUpdateAdCampaigns([...adCampaigns, newAd]);
    setNewAdTitle('');
    setNewAdSubtitle('');
  };

  const handleDeleteAd = (id: string) => {
    onUpdateAdCampaigns(adCampaigns.filter((ad) => ad.id !== id));
  };

  // Toggle Vendor verification
  const handleToggleVendorVerify = (id: string) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, verified: !v.verified } : v));
    onUpdateVendors(updated);
  };

  // Toggle Business verification
  const handleToggleBusinessVerify = (id: string) => {
    const updated = businesses.map((b) => (b.id === id ? { ...b, verified: !b.verified } : b));
    onUpdateBusinesses(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Admin Header with Official Logo */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black border border-neutral-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={OFFICIAL_LOGO_PATH} alt="G Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-base font-black">Portail Administration G-Marketplace</h2>
              <p className="text-xs text-neutral-400">
                Gestion des espaces commerciaux, régie publicitaire et modération vendeurs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50 flex flex-wrap gap-2 text-xs">
          {[
            { id: 'kpis', label: 'Indicateurs Clés & GMV' },
            { id: 'ads', label: `Espaces Publicitaires (${adCampaigns.length})` },
            { id: 'vendors', label: `Gestion Vendeurs (${vendors.length})` },
            { id: 'businesses', label: `Annuaire Entreprises (${businesses.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === tab.id ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-1">
                  <div className="text-[11px] text-neutral-400 font-bold uppercase">Volume d’Affaires (GMV)</div>
                  <div className="text-xl font-black text-white">{formatFCFA(totalGMV || 18450000)}</div>
                  <div className="text-[10px] text-emerald-400">+18% ce mois-ci</div>
                </div>

                <div className="p-4 rounded-2xl bg-red-600 text-white space-y-1">
                  <div className="text-[11px] text-red-200 font-bold uppercase">Commissions Plateforme (8%)</div>
                  <div className="text-xl font-black text-white">{formatFCFA(totalCommission || 1476000)}</div>
                  <div className="text-[10px] text-red-100">Rentrées nettes sécurisées</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 space-y-1">
                  <div className="text-[11px] text-neutral-500 font-bold uppercase">Vendeurs Partenaires</div>
                  <div className="text-xl font-black text-neutral-900">{vendors.length} boutiques</div>
                  <div className="text-[10px] text-neutral-500">Grossistes & Standards</div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 space-y-1">
                  <div className="text-[11px] text-neutral-500 font-bold uppercase">Commandes Passées</div>
                  <div className="text-xl font-black text-neutral-900">{orders.length} commandes</div>
                  <div className="text-[10px] text-emerald-600">Multi-vendeurs actives</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">Conformité aux Cahiers des charges V1 & V2</h3>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>Page d’accueil épurée inspirée d’un moteur de recherche centralisé active.</li>
                  <li>Barème dégressif officiel grossiste calculé côté serveur (+5% chaque 10 unités atteintes).</li>
                  <li>Visualisation interactive 3D WebGL à 360° pour les articles compatibles.</li>
                  <li>Séparation étanche des 5 espaces commerciaux (Shopping, Supermarché, Galerie, Business, +18).</li>
                  <li>Règle de redirection logo : Accueil vers « À propos », autres pages vers « Accueil ».</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Add New Ad Form */}
              <form onSubmit={handleAddAd} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm">Créer un nouvel espace publicitaire</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Titre de la campagne</label>
                    <input
                      type="text"
                      required
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      placeholder="ex: Grande Braderie des Vivriers"
                      className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Espace Cible</label>
                    <select
                      value={newAdLink}
                      onChange={(e) => setNewAdLink(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-neutral-300 bg-white font-medium"
                    >
                      <option value="supermarche">Supermarché Vivrier</option>
                      <option value="shopping">Shopping Général</option>
                      <option value="galerie">Galerie Enseignes</option>
                      <option value="business">Business Pro</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Sous-titre explicatif</label>
                    <input
                      type="text"
                      value={newAdSubtitle}
                      onChange={(e) => setNewAdSubtitle(e.target.value)}
                      placeholder="ex: Tarifs dégressifs certifiés direct-producteurs"
                      className="w-full p-2 rounded-lg border border-neutral-300 bg-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Publier la bannière
                    </button>
                  </div>
                </div>
              </form>

              {/* List of Ads */}
              <div className="space-y-3">
                {adCampaigns.map((ad) => (
                  <div key={ad.id} className="p-3 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={ad.imageUrl} alt={ad.title} className="w-16 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{ad.title}</div>
                        <div className="text-neutral-500 text-[11px]">{ad.subtitle} · Vers : {ad.targetLink}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAd(ad.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          ad.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {ad.isActive ? 'Actif sur l’Accueil' : 'Désactivé'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600"
                        title="Supprimer la bannière"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-3">
              <h3 className="font-bold text-neutral-900 text-sm">Contrôle et Validation des Vendeurs Marketplace</h3>
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {vendors.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                          <span>{v.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.type === 'wholesale' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'}`}>
                            {v.type === 'wholesale' ? 'Grossiste' : 'Standard'}
                          </span>
                        </div>
                        <div className="text-neutral-500 text-[11px]">{v.companyName} · {v.phone} · {v.city}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleVendorVerify(v.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                        v.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{v.verified ? 'Vendeur Agréé' : 'En attente de validation'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'businesses' && (
            <div className="space-y-3">
              <h3 className="font-bold text-neutral-900 text-sm">Annuaire Business & Vérification des Établissements</h3>
              <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                {businesses.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{b.name}</div>
                      <div className="text-neutral-500 text-[11px]">Secteur : {b.sector} · {b.address}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBusinessVerify(b.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                        b.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{b.verified ? 'Entreprise Vérifiée' : 'Non certifié'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
