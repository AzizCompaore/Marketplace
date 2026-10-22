import React, { useState } from 'react';
import { ShieldAlert, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onConfirm,
  onReject,
}) => {
  if (!isOpen) return null;

  const [birthYear, setBirthYear] = useState<string>('2000');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);

    if (isNaN(age) || age < 18) {
      setErrorMessage('Accès refusé : vous devez avoir au moins 18 ans révolus pour accéder à cet espace.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Vous devez attester sur l’honneur de votre majorité légale.');
      return;
    }

    setErrorMessage('');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* 18+ Badge */}
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mb-4">
            <span className="text-2xl font-black tracking-tight">18+</span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            Espace Réglementé Réservé aux Adultes
          </h2>

          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Cet univers présente des produits d’exception (vins fins, spiritueux de prestige, accessoires de cave) dont l’accès et la vente sont strictement réservés aux personnes majeures selon la législation en vigueur en République de Côte d’Ivoire.
          </p>

          <form onSubmit={handleVerify} className="w-full mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Année de naissance
              </label>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:border-red-500 focus:outline-none"
              >
                {Array.from({ length: 70 }, (_, i) => 2012 - i).map((year) => (
                  <option key={year} value={year.toString()}>
                    {year} ({new Date().getFullYear() - year} ans)
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-400">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-600 focus:ring-red-500"
              />
              <span>
                J’atteste sur l’honneur avoir au moins 18 ans et j’accepte les conditions d’accès et la politique de modération de la plateforme.
              </span>
            </label>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Débloquer l’accès +18</span>
              </button>

              <button
                type="button"
                onClick={onReject}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white transition-colors text-center"
              >
                Je suis mineur / Retourner à l’accueil
              </button>
            </div>
          </form>

          <div className="mt-4 text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-3">
            L’abus d’alcool est dangereux pour la santé. À consommer avec modération.
          </div>
        </div>
      </div>
    </div>
  );
};
