import React, { useState, useRef, useEffect } from 'react';
import { Product, BusinessEntity, MallPartner } from '../types';
import { Search, X, Sparkles, Building2, Store, ArrowUpRight, History } from 'lucide-react';
import { formatFCFA } from '../utils/pricing';

interface HomeSearchProps {
  products: Product[];
  businesses: BusinessEntity[];
  malls: MallPartner[];
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
  onNavigateSpace: (space: 'home' | 'shopping' | 'supermarche' | 'galerie' | 'business' | 'plus18') => void;
}

export const HomeSearch: React.FC<HomeSearchProps> = ({
  products,
  businesses,
  malls,
  onSelectProduct,
  onSearchSubmit,
  onNavigateSpace,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Riz parfumé 25kg',
    'Grossiste',
    'Smartphones 5G',
    'Banane plantain',
    'Comptable Abidjan',
  ]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();

  // Search filtered results across categories
  const matchedProducts = trimmed
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.universe.toLowerCase().includes(trimmed) ||
          p.vendorName.toLowerCase().includes(trimmed) ||
          (p.brand && p.brand.toLowerCase().includes(trimmed))
      ).slice(0, 5)
    : [];

  const matchedVendors = trimmed
    ? Array.from(
        new Set(
          products
            .filter((p) => p.vendorName.toLowerCase().includes(trimmed))
            .map((p) => ({ id: p.vendorId, name: p.vendorName, type: p.vendorType }))
        )
      ).slice(0, 3)
    : [];

  const matchedBusinesses = trimmed
    ? businesses.filter(
        (b) =>
          b.name.toLowerCase().includes(trimmed) ||
          b.sector.toLowerCase().includes(trimmed) ||
          b.services.some((s) => s.toLowerCase().includes(trimmed))
      ).slice(0, 3)
    : [];

  const matchedMalls = trimmed
    ? malls.filter(
        (m) =>
          m.name.toLowerCase().includes(trimmed) ||
          m.location.toLowerCase().includes(trimmed) ||
          m.featuredBrands.some((fb) => fb.toLowerCase().includes(trimmed))
      ).slice(0, 2)
    : [];

  const totalMatches =
    matchedProducts.length + matchedVendors.length + matchedBusinesses.length + matchedMalls.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (!recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 5)]);
    }
    setIsOpen(false);
    onSearchSubmit(query.trim());
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    onSearchSubmit(term);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Central Search Form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full relative flex items-center bg-white rounded-full border transition-all duration-200 shadow-md ${
          isOpen ? 'border-neutral-900 ring-4 ring-neutral-100 shadow-xl' : 'border-neutral-300 hover:border-neutral-400'
        }`}
      >
        <div className="pl-5 text-neutral-400 flex items-center justify-center">
          <Search className="w-5 h-5 text-neutral-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un produit, grossiste, marque, enseigne, secteur business..."
          className="w-full py-4 px-3.5 text-base text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
          aria-label="Recherche centrale"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1.5 mr-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="mr-2 px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <span>Trouver</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </form>

      {/* Autocomplete / Instant Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-40 max-h-[460px] overflow-y-auto">
          {trimmed.length === 0 ? (
            /* Recent Searches & Quick Suggestions */
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-2">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Recherches fréquentes
                </span>
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectRecent(term)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-6 text-center text-neutral-500">
              <p className="text-sm">Aucun résultat immédiat pour « {query} »</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 text-xs font-bold text-red-600 hover:underline"
              >
                Lancer la recherche globale dans tout le catalogue →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Matched Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-2">
                    Articles & Produits ({matchedProducts.length})
                  </div>
                  <div className="flex flex-col gap-1">
                    {matchedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-neutral-900 hover:text-red-600 line-clamp-1">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                              <span>{prod.universe}</span>
                              <span>·</span>
                              <span>{prod.vendorName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs font-extrabold text-neutral-900">
                            {formatFCFA(prod.promoPrice || prod.basePrice)}
                          </span>
                          {prod.isWholesaleEligible && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                              Grossiste
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Malls / Galeries */}
              {matchedMalls.length > 0 && (
                <div className="border-t border-neutral-100 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-2 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" /> Enseignes & Galeries
                  </div>
                  <div className="flex flex-col gap-1">
                    {matchedMalls.map((mall) => (
                      <div
                        key={mall.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigateSpace('galerie');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={mall.logo}
                            alt={mall.name}
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-200"
                          />
                          <div>
                            <div className="text-xs font-bold text-neutral-900">{mall.name}</div>
                            <div className="text-[10px] text-neutral-500">{mall.location}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-red-600">Ouvrir l’enseigne →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Businesses */}
              {matchedBusinesses.length > 0 && (
                <div className="border-t border-neutral-100 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 px-2 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Annuaire Business & Entreprises
                  </div>
                  <div className="flex flex-col gap-1">
                    {matchedBusinesses.map((biz) => (
                      <div
                        key={biz.id}
                        onClick={() => {
                          setIsOpen(false);
                          onNavigateSpace('business');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-neutral-900">{biz.name}</div>
                          <div className="text-[10px] text-neutral-500">
                            Secteur : {biz.sector} · {biz.city}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-neutral-600">Voir fiche pro →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Access Shortcut Pills Below Search Bar */}
      <div className="flex items-center flex-wrap justify-center gap-2 mt-4 text-xs">
        <button
          type="button"
          onClick={() => onNavigateSpace('supermarche')}
          className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Supermarché & Vivriers
        </button>

        <button
          type="button"
          onClick={() => onNavigateSpace('shopping')}
          className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold border border-neutral-300 transition-colors"
        >
          Tous les 10 Univers
        </button>

        <button
          type="button"
          onClick={() => onSearchSubmit('grossiste')}
          className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          Tarifs Grossistes (-5% / 10u)
        </button>

        <button
          type="button"
          onClick={() => onNavigateSpace('galerie')}
          className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold border border-neutral-300 transition-colors"
        >
          Grandes Galeries (Prima, Cap Nord)
        </button>

        <button
          type="button"
          onClick={() => onNavigateSpace('business')}
          className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold border border-neutral-300 transition-colors"
        >
          Annuaire Pro B2B
        </button>
      </div>
    </div>
  );
};
