# G-Marketplace — Frontend React

Application Web Frontend moderne construite avec React 19, TypeScript, Vite, Tailwind CSS et Three.js.

## Structure du Frontend
```
frontend/
├── src/
│   ├── components/         # Composants d'interface (Header, HomeSearch, ProductCard, 3DViewer...)
│   ├── data/               # Données de référence et mock (10 univers, grossistes, centres commerciaux...)
│   ├── types/              # Définitions TypeScript (Product, Vendor, Order, WholesaleTier...)
│   ├── utils/              # Moteur de tarification dégressive grossiste V2 et utilitaires monétaires
│   ├── App.tsx             # Application principale et routage des 5 espaces
│   ├── main.tsx            # Point d'entrée React 19
│   └── index.css           # Thème global Tailwind CSS
```

## Fonctionnalités
- Page d'accueil épurée inspirée d'un moteur de recherche centralisé
- Règle spéciale de routage du Logo officiel G (Accueil vers À Propos, autres vers Accueil)
- Visualiseur 3D interactif 360° en WebGL (Three.js)
- Moteur de calcul de remise grossiste V2 (+5% par tranche de 10 unités)
- 5 espaces commerciaux : Shopping, Supermarché, Galerie, Business, +18
- Portails Vendeur et Administration intégrés
