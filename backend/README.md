# Backend Django - G Marketplace API

Backend Django REST Framework pour la plateforme e-commerce multi-vendeurs avec moteur de tarification dégressive pour grossistes (Cahier des charges V1 & V2).

## 📁 Architecture des dossiers

```text
backend/
├── manage.py
├── requirements.txt
├── g_marketplace/          # Configuration centrale Django
│   ├── settings.py         # Paramètres, CORS (React:3000), DRF
│   ├── urls.py             # Routeur principal & Swagger OpenAPI
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── catalog/            # Produits, 10 univers, tarification dégressive de gros
│   │   ├── models.py
│   │   ├── services.py     # Moteur pur de tarification (+5% / 10 unités)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── vendors/            # Gestion des vendeurs, KYC, reversements Mobile Money
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── orders/             # Commandes splittees multi-vendeurs, sous-commandes
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   └── business/           # Espace B2B, devis pour grossistes & entreprises
│       ├── models.py
│       ├── serializers.py
│       └── views.py
└── tests/
    └── test_wholesale_pricing.py  # Tests unitaires de la tarification V2
```

## 🚀 Démarrage rapide (Local)

1. **Créer et activer un environnement virtuel Python** :
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # ou venv\Scripts\activate sous Windows
   ```

2. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

3. **Appliquer les migrations de base de données** :
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Créer un superutilisateur administrateur** :
   ```bash
   python manage.py createsuperuser
   ```

5. **Lancer le serveur de développement API** (Port 8000) :
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

## 🧪 Lancer la suite de tests

```bash
PYTHONPATH=backend python3 backend/tests/test_wholesale_pricing.py
```

## 📡 Points d'accès API REST principaux

- **Documentation Swagger / OpenAPI interactive** : `http://localhost:8000/api/docs/`
- **Schéma OpenAPI** : `http://localhost:8000/api/schema/`
- **Catalogue & Produits** : `http://localhost:8000/api/v1/catalog/products/`
- **Univers Commerciaux (10)** : `http://localhost:8000/api/v1/catalog/universes/`
- **Simulateur Tarification Grossiste** : `POST http://localhost:8000/api/v1/catalog/wholesale/calculate/`
- **Boutiques & Vendeurs** : `http://localhost:8000/api/v1/vendors/`
- **Commandes Découpées Multi-Vendeurs** : `POST http://localhost:8000/api/v1/orders/orders/`
- **Demandes de devis B2B** : `POST http://localhost:8000/api/v1/business/quotes/`

## 🧮 Règle de calcul de la tarification de gros (Cahier des charges V2)

```python
# Implémentée dans apps/catalog/services.py
tiers_count = quantity // 10
discount_pct = min(tiers_count * 5.0, max_discount_pct)
discounted_unit_price = round(base_price * (1.0 - (discount_pct / 100.0)))
total = discounted_unit_price * quantity
```
