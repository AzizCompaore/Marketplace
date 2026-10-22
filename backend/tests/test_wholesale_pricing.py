"""
Unit tests for the wholesale pricing calculation engine.
Cahier des charges V2 :
- 1-9 unités : 0%
- 10-19 unités : 5%
- 20-29 unités : 10%
- 30-39 unités : 15%
- Tranches de 10 unités avec plafonnement.
"""

import unittest
from apps.catalog.services import calculate_wholesale_tier, generate_wholesale_tiers_table

class TestWholesalePricingService(unittest.TestCase):
    def test_single_unit_no_discount(self):
        """1 à 9 unités ne reçoivent aucune réduction."""
        res = calculate_wholesale_tier(quantity=1, base_unit_price=10000)
        self.assertEqual(res['discount_percent'], 0.0)
        self.assertEqual(res['discounted_unit_price'], 10000)
        self.assertEqual(res['total_price'], 10000)
        self.assertEqual(res['total_savings'], 0)
        self.assertEqual(res['next_tier_quantity'], 10)
        self.assertEqual(res['units_to_next_tier'], 9)

        res9 = calculate_wholesale_tier(quantity=9, base_unit_price=10000)
        self.assertEqual(res9['discount_percent'], 0.0)
        self.assertEqual(res9['discounted_unit_price'], 10000)
        self.assertEqual(res9['total_price'], 90000)
        self.assertEqual(res9['units_to_next_tier'], 1)

    def test_tier_one_10_units(self):
        """10 à 19 unités reçoivent 5% de réduction."""
        res = calculate_wholesale_tier(quantity=10, base_unit_price=10000)
        self.assertEqual(res['discount_percent'], 5.0)
        self.assertEqual(res['discounted_unit_price'], 9500)
        self.assertEqual(res['total_price'], 95000)
        self.assertEqual(res['total_savings'], 5000)
        self.assertEqual(res['next_tier_quantity'], 20)
        self.assertEqual(res['units_to_next_tier'], 10)

    def test_tier_two_20_units(self):
        """20 à 29 unités reçoivent 10% de réduction."""
        res = calculate_wholesale_tier(quantity=20, base_unit_price=10000)
        self.assertEqual(res['discount_percent'], 10.0)
        self.assertEqual(res['discounted_unit_price'], 9000)
        self.assertEqual(res['total_price'], 180000)
        self.assertEqual(res['total_savings'], 20000)
        self.assertEqual(res['next_tier_quantity'], 30)
        self.assertEqual(res['units_to_next_tier'], 10)

    def test_tier_three_30_units(self):
        """30 à 39 unités reçoivent 15% de réduction."""
        res = calculate_wholesale_tier(quantity=30, base_unit_price=10000)
        self.assertEqual(res['discount_percent'], 15.0)
        self.assertEqual(res['discounted_unit_price'], 8500)
        self.assertEqual(res['total_price'], 255000)
        self.assertEqual(res['total_savings'], 45000)

    def test_capping_max_discount(self):
        """La remise est correctement plafonnée (ex: 50%)."""
        res = calculate_wholesale_tier(quantity=120, base_unit_price=10000, max_discount_pct=50.0)
        self.assertEqual(res['discount_percent'], 50.0)
        self.assertEqual(res['discounted_unit_price'], 5000)
        self.assertTrue(res['is_max_tier'])

    def test_tiers_table_generation(self):
        """Génération de la grille tarifaire complète."""
        table = generate_wholesale_tiers_table(base_unit_price=10000, max_units=30)
        self.assertEqual(len(table), 4) # 1-9, 10-19, 20-29, 30-39
        self.assertEqual(table[0]['discount_percent'], 0.0)
        self.assertEqual(table[1]['discount_percent'], 5.0)
        self.assertEqual(table[2]['discount_percent'], 10.0)
        self.assertEqual(table[3]['discount_percent'], 15.0)


if __name__ == '__main__':
    unittest.main()
