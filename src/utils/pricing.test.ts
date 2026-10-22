import test from 'node:test';
import assert from 'node:assert/strict';
import { getWholesaleDiscountRate, calculateLinePricing, formatFCFA, calculateCartBreakdown } from './pricing';
import { Product, CartItem } from '../types';

test('Wholesale discount rates strictly match Cahier des charges V2 specifications', () => {
  // 1 to 9 units: 0%
  assert.equal(getWholesaleDiscountRate(1, true), 0);
  assert.equal(getWholesaleDiscountRate(8, true), 0);
  assert.equal(getWholesaleDiscountRate(9, true), 0);

  // 10 to 19 units: 5%
  assert.equal(getWholesaleDiscountRate(10, true), 0.05);
  assert.equal(getWholesaleDiscountRate(14, true), 0.05);
  assert.equal(getWholesaleDiscountRate(19, true), 0.05);

  // 20 to 29 units: 10%
  assert.equal(getWholesaleDiscountRate(20, true), 0.10);
  assert.equal(getWholesaleDiscountRate(29, true), 0.10);

  // 30 to 39 units: 15%
  assert.equal(getWholesaleDiscountRate(30, true), 0.15);
  assert.equal(getWholesaleDiscountRate(39, true), 0.15);

  // 40 to 49 units: 20%
  assert.equal(getWholesaleDiscountRate(40, true), 0.20);

  // 50 to 59 units: 25%
  assert.equal(getWholesaleDiscountRate(50, true), 0.25);

  // 60 to 69 units: 30%
  assert.equal(getWholesaleDiscountRate(60, true), 0.30);

  // Non-eligible products must always be 0%
  assert.equal(getWholesaleDiscountRate(30, false), 0);
  assert.equal(getWholesaleDiscountRate(100, false), 0);
});

test('Exact calculation example from Cahier des charges V2 page 2', () => {
  // Base price = 10 000 FCFA
  const mockProduct: Product = {
    id: 'prod-test-1',
    name: 'Sac de Riz Parfumé 25kg',
    sku: 'RIZ-25KG-01',
    description: 'Riz de qualité supérieure',
    universe: 'Supermarché',
    category: 'Céréales & Grains',
    basePrice: 10000,
    stock: 500,
    vendorId: 'vendor-grossiste-1',
    vendorName: 'Comptoir Agro Ivoire',
    vendorType: 'wholesale',
    isWholesaleEligible: true,
    images: [],
    specifications: {},
    rating: 4.8,
    reviewCount: 42,
    status: 'published',
    createdAt: '2025-01-01',
  };

  // For 8 units: 0% discount
  const res8 = calculateLinePricing(mockProduct, 8);
  assert.equal(res8.discountPercent, 0);
  assert.equal(res8.unitPriceAfterDiscount, 10000);
  assert.equal(res8.lineSubtotal, 80000);

  // For 10 units: 5% discount -> 9 500 FCFA/unit
  const res10 = calculateLinePricing(mockProduct, 10);
  assert.equal(res10.discountPercent, 5);
  assert.equal(res10.unitPriceAfterDiscount, 9500);
  assert.equal(res10.lineSubtotal, 95000);

  // For 20 units: 10% discount -> 9 000 FCFA/unit
  const res20 = calculateLinePricing(mockProduct, 20);
  assert.equal(res20.discountPercent, 10);
  assert.equal(res20.unitPriceAfterDiscount, 9000);
  assert.equal(res20.lineSubtotal, 180000);

  // For 30 units: 15% discount
  // 30 * 10 000 = 300 000 FCFA ; remise 15% = 45 000 FCFA ; total = 255 000 FCFA
  const res30 = calculateLinePricing(mockProduct, 30);
  assert.equal(res30.discountPercent, 15);
  assert.equal(res30.unitPriceAfterDiscount, 8500);
  assert.equal(res30.totalBaseAmount, 300000);
  assert.equal(res30.totalDiscountAmount, 45000);
  assert.equal(res30.lineSubtotal, 255000);
});

test('Multi-vendor cart breakdown divides orders accurately by vendor', () => {
  const p1: Product = {
    id: 'p1',
    name: 'Huile de Palme 20L',
    sku: 'HUILE-20L',
    description: 'Bidon 20 litres',
    universe: 'Supermarché',
    category: 'Huiles',
    basePrice: 15000,
    stock: 100,
    vendorId: 'vendor-agro',
    vendorName: 'Agro Ivoire Grossiste',
    vendorType: 'wholesale',
    isWholesaleEligible: true,
    images: [],
    specifications: {},
    rating: 4.7,
    reviewCount: 12,
    status: 'published',
    createdAt: '2025-01-01',
  };

  const p2: Product = {
    id: 'p2',
    name: 'Chemise Bazin Brodé',
    sku: 'MODE-BAZIN-01',
    description: 'Vêtement traditionnel',
    universe: 'Mode',
    category: 'Vêtements Homme',
    basePrice: 25000,
    stock: 20,
    vendorId: 'vendor-couture',
    vendorName: 'Atelier Abidjan Couture',
    vendorType: 'standard',
    isWholesaleEligible: false,
    images: [],
    specifications: {},
    rating: 4.9,
    reviewCount: 30,
    status: 'published',
    createdAt: '2025-01-01',
  };

  const cartItems: CartItem[] = [
    {
      product: p1,
      quantity: 10, // 5% discount on 15,000 = 750 FCFA discount per unit => 14,250 unit => 142,500 total
      calculatedUnitPrice: 14250,
      calculatedDiscountPercent: 5,
      calculatedDiscountAmount: 7500,
      calculatedSubtotal: 142500,
    },
    {
      product: p2,
      quantity: 2, // Standard vendor: 25,000 * 2 = 50,000
      calculatedUnitPrice: 25000,
      calculatedDiscountPercent: 0,
      calculatedDiscountAmount: 0,
      calculatedSubtotal: 50000,
    },
  ];

  const breakdown = calculateCartBreakdown(cartItems, 'standard');
  assert.equal(breakdown.vendorCount, 2);
  assert.equal(breakdown.totalBaseAmount, 150000 + 50000);
  assert.equal(breakdown.totalWholesaleSavings, 7500);
  assert.equal(breakdown.itemsSubtotal, 142500 + 50000);
  assert.equal(breakdown.vendorSubOrders.length, 2);

  const vendorAgro = breakdown.vendorSubOrders.find((v) => v.vendorId === 'vendor-agro')!;
  assert.equal(vendorAgro.subtotal, 142500);

  const vendorCouture = breakdown.vendorSubOrders.find((v) => v.vendorId === 'vendor-couture')!;
  assert.equal(vendorCouture.subtotal, 50000);
});

test('FCFA currency formatting outputs correct space separators and suffix', () => {
  assert.equal(formatFCFA(10000), '10 000 FCFA');
  assert.equal(formatFCFA(255000), '255 000 FCFA');
  assert.equal(formatFCFA(1500), '1 500 FCFA');
  assert.equal(formatFCFA(0), '0 FCFA');
});
