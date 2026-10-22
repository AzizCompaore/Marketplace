import React, { useState } from 'react';
import { MainNavSpace, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ShieldAlert,
  Store,
  Settings,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentSpace: MainNavSpace;
  onNavigate: (space: MainNavSpace) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  currentUserRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onOpenVendorDashboard: () => void;
  onOpenAdminDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSpace,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  currentUserRole,
  onChangeUserRole,
  onOpenVendorDashboard,
  onOpenAdminDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks: { id: MainNavSpace; label: string; badge?: string }[] = [
    { id: 'shopping', label: 'Shopping' },
    { id: 'supermarche', label: 'Supermarché', badge: 'Vivrier' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'business', label: 'Business', badge: 'B2B' },
    { id: 'plus18', label: '+18', badge: 'Adulte' },
  ];

  const handleNavClick = (id: MainNavSpace) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'visitor':
        return 'Visiteur';
      case 'client':
        return 'Client Acheteur';
      case 'vendor_standard':
        return 'Vendeur Standard';
      case 'vendor_wholesale':
        return 'Vendeur Grossiste';
      case 'admin':
        return 'Administrateur';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Official Brand Logo with Nav Rule */}
          <BrandLogo currentSpace={currentSpace} onNavigate={onNavigate} />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const isActive = currentSpace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  type="button"
                  className={`relative px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-red-600 bg-red-50/60'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                        item.id === 'plus18'
                          ? 'bg-neutral-900 text-white'
                          : item.id === 'supermarche'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher, Dashboards, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Quick Vendor / Admin Access Buttons if applicable */}
            {(currentUserRole === 'vendor_standard' || currentUserRole === 'vendor_wholesale') && (
              <button
                type="button"
                onClick={onOpenVendorDashboard}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-red-400" />
                <span>Espace Vendeur</span>
              </button>
            )}

            {currentUserRole === 'admin' && (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Administration</span>
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-semibold bg-neutral-50 transition-colors"
                title="Changer de rôle pour tester la plateforme"
              >
                <User className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden sm:inline">{getRoleLabel(currentUserRole)}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-neutral-400 border-b border-neutral-100">
                    Mode d’accès / Test des rôles
                  </div>
                  {(
                    [
                      'visitor',
                      'client',
                      'vendor_standard',
                      'vendor_wholesale',
                      'admin',
                    ] as UserRole[]
                  ).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        onChangeUserRole(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-100 transition-colors ${
                        currentUserRole === role ? 'font-bold text-red-600 bg-red-50/50' : 'text-neutral-700'
                      }`}
                    >
                      <span>{getRoleLabel(role)}</span>
                      {currentUserRole === role && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </button>
                  ))}

                  {/* Contextual links inside role menu */}
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenVendorDashboard();
                      }}
                      className="w-full text-left px-3 py-1.5 text-neutral-800 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-neutral-500" />
                      Tableau de bord Vendeur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onOpenAdminDashboard();
                      }}
                      className="w-full text-left px-3 py-1.5 text-neutral-800 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-500" />
                      Portail Administrateur
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-neutral-100 transition-colors"
              title="Mes favoris"
              aria-label="Voir mes favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold">
                  {cartCount}
                </span>
              ) : (
                <span className="text-neutral-400 text-xs">0</span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Ouvrir le menu mobile"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3">
            Espaces Commerciaux
          </div>
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                currentSpace === item.id
                  ? 'bg-red-50 text-red-600'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('apropos');
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              À propos de G-Marketplace
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVendorDashboard();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold bg-neutral-900 text-white rounded-xl"
            >
              <Store className="w-4 h-4 text-red-400" />
              Espace Vendeur Multi-Vendeurs
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminDashboard();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl"
            >
              <Settings className="w-4 h-4" />
              Administration & Paramétrage
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
