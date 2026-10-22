import React from 'react';

export const OFFICIAL_LOGO_PATH = '/assets/aistudio/WhatsApp_Image_2026-09-29_at_16.28.24_ae632a15.jpeg';

interface BrandLogoProps {
  currentSpace: string;
  onNavigate: (space: 'home' | 'shopping' | 'supermarche' | 'galerie' | 'business' | 'plus18' | 'apropos') => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  currentSpace,
  onNavigate,
  size = 'md',
  showText = true,
}) => {
  // Navigation Rule per specifications:
  // - On Home page -> clicking logo navigates to "À propos"
  // - On any other page -> clicking logo navigates back to Home with central search bar
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentSpace === 'home') {
      onNavigate('apropos');
    } else {
      onNavigate('home');
    }
  };

  const dim =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-14 h-14'
      : size === 'xl'
      ? 'w-20 h-20'
      : 'w-10 h-10';

  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-lg';

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl p-1 transition-transform active:scale-95"
      title={currentSpace === 'home' ? 'Vers la page À propos' : 'Retour à l’accueil'}
      aria-label={currentSpace === 'home' ? 'Logo G - Ouvrir la page À propos' : 'Logo G - Retourner à l’accueil'}
    >
      {/* Official Emblem: Directly rendering the user's uploaded official logo asset */}
      <div
        className={`${dim} relative bg-black rounded-xl flex items-center justify-center p-0.5 shadow-md border border-neutral-800 transition-all group-hover:border-neutral-600 group-hover:shadow-lg overflow-hidden flex-shrink-0`}
      >
        <img
          src={OFFICIAL_LOGO_PATH}
          alt="Logo Officiel G-Marketplace"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {showText && (
        <div className="flex flex-col whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${textSize} font-black tracking-tight text-neutral-900 group-hover:text-black whitespace-nowrap`}>
              G-MARKET
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 animate-pulse"></span>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500 whitespace-nowrap mt-0.5">
            {currentSpace === 'home' ? 'Info · À propos ↗' : 'Côte d’Ivoire'}
          </span>
        </div>
      )}
    </button>
  );
};
