"""
Wholesale Pricing Service (Cahier des charges V2).

Règle stricte :
Pour chaque tranche complète de 10 unités achetées, une réduction de 5% s'applique
sur le prix unitaire de base de l'ensemble de la commande :
- 1 à 9 unités : 0%
- 10 à 19 unités : 5%
- 20 à 29 unités : 10%
- 30 à 39 unités : 15%
- 40 à 49 unités : 20%
- 50 à 59 unités : 25%
- etc. Plafonnable par produit (par défaut max 50%).
"""

import math
from typing import Dict, Any, List

def calculate_wholesale_tier(quantity: int, base_unit_price: float, max_discount_pct: float = 50.0) -> Dict[str, Any]:
    """
    Calcule le palier de réduction grossiste selon la règle stricte V2.
    
    :param quantity: Quantité commandée (entier >= 1)
    :param base_unit_price: Prix unitaire public (XOF)
    :param max_discount_pct: Pourcentage de réduction maximal autorisé (défaut 50%)
    :return: Dict avec détails du calcul, économies et prochain palier
    """
    qty = max(1, int(quantity))
    price = max(0.0, float(base_unit_price))

    # Nombre de tranches de 10 unités complètes
    tiers_count = qty // 10
    raw_discount_pct = tiers_count * 5.0
    discount_pct = min(raw_discount_pct, float(max_discount_pct))
    discount_rate = discount_pct / 100.0

    discounted_unit_price = round(price * (1.0 - discount_rate))
    total_price = discounted_unit_price * qty
    original_total = round(price * qty)
    total_savings = max(0, original_total - total_price)

    # Calcul du prochain palier avantageux
    next_tier_qty = (tiers_count + 1) * 10
    units_to_next_tier = next_tier_qty - qty
    next_discount_pct = min((tiers_count + 1) * 5.0, float(max_discount_pct))
    is_max_tier = raw_discount_pct >= max_discount_pct

    return {
        "quantity": qty,
        "base_unit_price": price,
        "discount_percent": discount_pct,
        "discount_rate": discount_rate,
        "discounted_unit_price": discounted_unit_price,
        "total_price": total_price,
        "original_total": original_total,
        "total_savings": total_savings,
        "tiers_count": tiers_count,
        "next_tier_quantity": next_tier_qty if not is_max_tier else None,
        "units_to_next_tier": units_to_next_tier if not is_max_tier else 0,
        "next_tier_discount_percent": next_discount_pct if not is_max_tier else discount_pct,
        "is_max_tier": is_max_tier,
    }


def generate_wholesale_tiers_table(base_unit_price: float, max_units: int = 60, step: int = 10, max_discount_pct: float = 50.0) -> List[Dict[str, Any]]:
    """
    Génère la grille tarifaire complète pour l'affichage fiche produit / devis B2B.
    """
    tiers = []
    # Palier 1-9
    tiers.append({
        "label": "1 - 9 unités",
        "min_qty": 1,
        "max_qty": 9,
        "discount_percent": 0.0,
        "unit_price": base_unit_price,
        "example_total": base_unit_price * 1,
    })

    current_qty = 10
    while current_qty <= max_units:
        tier_data = calculate_wholesale_tier(current_qty, base_unit_price, max_discount_pct)
        tiers.append({
            "label": f"{current_qty} à {current_qty + 9} unités",
            "min_qty": current_qty,
            "max_qty": current_qty + 9,
            "discount_percent": tier_data["discount_percent"],
            "unit_price": tier_data["discounted_unit_price"],
            "example_total": tier_data["total_price"],
        })
        current_qty += step

    return tiers
