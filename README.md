# G Marketplace - Plateforme E-Commerce Multi-Vendeurs & Vente en Gros

Plateforme e-commerce multi-vendeurs avec moteur de tarification dégressive pour grossistes, conçue selon les spécifications des **Cahier des charges V1 & V2** et intégrant l'identité visuelle officielle du logo **G**.

---

## 🏗️ Structure du Projet (Séparation Frontend / Backend)

Le projet est organisé selon une architecture bi-dossier propre :

```text
.
├── frontend/                     # Application Frontend React
│   ├── src/
│   │   ├── components/           # Composants React (Navbar, Hero, Modals, 3D, Dashboards...)
│   │   ├── data/                 # Données initiales (Univers, Produits, Vendeurs, Boutiques...)
│   │   ├── types/                # Types TypeScript stricts
│   │   ├── utils/                # Moteur de tarification dégressive (+5% / 10 unités)
│   │   ├── App.tsx               # Orchestration des 5 espaces, recherche & navigation
│   │   ├── main.tsx              # Point d'entrée React
│   │   └── index.css             # Styles globaux & Tailwind CSS v4
│   └── README.md                 # Documentation Frontend
│
├── backend/                      # Application Backend Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── g_marketplace/            # Configuration Django, CORS (React:3000), Swagger
│   ├── apps/
│   │   ├── catalog/              # Modèles 10 univers, produits, moteur pur de gros
│   │   ├── vendors/              # Profils vendeurs, KYC, reversements Mobile Money
│   │   ├── orders/               # Commandes découpées multi-vendeurs (SubOrders)
│   │   └── business/             # Espace Business & devis B2B
│   ├── tests/                    # Suite de tests unitaires Python
│   ├── Dockerfile
│   └── README.md                 # Documentation Backend
│
├── docker-compose.yml            # Orchestration globale Frontend + Backend
├── index.html                    # Point d'accès Vite pour AI Studio
├── package.json                  # Dépendances Node.js / React
├── tsconfig.json                 # Configuration TypeScript avec alias frontend
└── vite.config.ts                # Configuration Vite & Tailwind
```

---

## 🌟 Fonctionnalités Clés Implémentées

1. **5 Espaces Commerciaux Distincts** :
   - **Shopping** : Marketplace générale couvrant les 10 univers.
   - **Supermarché** : Vivriers, produits frais de Côte d'Ivoire, conditionnements au kilo/sac.
   - **Galerie** : Sélection exclusive & luxe, vue 3D interactive.
   - **Business** : Espace grossistes, demande de devis B2B, tarification par volume.
   - **+18** : Espace réservé avec vérification d'âge et avertissement de conformité.

2. **Moteur de Tarification Dégressive pour Grossistes (Cahier des charges V2)** :
   - Règle stricte : +5% de réduction par tranche complète de 10 unités achetées (1-9 : 0%, 10-19 : 5%, 20-29 : 10%, 30-39 : 15%, etc.).
   - Implémenté en TypeScript (`frontend/src/utils/pricing.ts`) et en Python (`backend/apps/catalog/services.py`).
   - Couvert par des tests unitaires automatisés dans les deux environnements.

3. **Multi-Vendeurs & Découpage des Commandes** :
   - Chaque commande est automatiquement découpée par boutique/vendeur (`SubOrder`).
   - Calcul des commissions plateforme et des reversements nets (Wave, Orange Money, MTN MoMo).
   - Espace Vendeur dédié (gestion de stock, suivi des sous-commandes, statistiques de vente).

4. **Identité Visuelle Officielle** :
   - Intégration du logo officiel « G » dans la barre de navigation, le hero, les fiches et le pied de page.
   - Règle de redirection spécifique : le clic sur le logo depuis l'accueil ouvre la modale "À propos" ; depuis toute autre page, il ramène à l'accueil.
   - **Aucune vidéo** sur le site (supprimées conformément aux directives).

---

## ⚡ Démarrage Rapide

### Frontend (React / Vite)
```bash
npm install
npm run dev
# L'application est servie sur http://localhost:3000
```

### Backend (Django REST Framework)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
# L'API et la documentation Swagger sont servies sur http://localhost:8000/api/docs/
```

### Avec Docker Compose
```bash
docker compose up --build
```
