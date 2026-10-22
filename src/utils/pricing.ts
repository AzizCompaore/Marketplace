import { Product, WholesaleTier, CartItem, VendorSubOrder, OrderItemRecord } from '../types';

/**
 * Calculates wholesale discount rate per official Cahier des charges V2:
 * - 1 to 9 units: 0%
 * - 10 to 19 units: 5%
 * - 20 to 29 units: 10%
 * - 30 to 39 units: 15%
 * - 40 to 49 units: 20%
 * - 50 to 59 units: 25%
 * - 60 to 69 units: 30%
 * - Each additional 10 units completed adds +5% (0.05)
 * Capped at 70% maximum safety ceiling as required in Section 8.6.
 */
export function getWholesaleDiscountRate(quantity: number, isEligible: boolean): number {
  if (!isEligible || quantity < 10) {
    return 0;
  }
  const completeDozens = Math.floor(quantity / 10);
  const calculatedRate = (completeDozens * 5) / 100;
  // Use precise decimal representation avoiding float artifacts
  const roundedRate = Math.round(calculatedRate * 10000) / 10000;
  return Math.min(roundedRate, 0.70);
}

/**
 * Generates the preview tiers for a product to display on the product sheet.
 */
export function generateWholesaleTiers(basePrice: number): WholesaleTier[] {
  const steps = [
    { min: 1, max: 9, rate: 0 },
    { min: 10, max: 19, rate: 0.05 },
    { min: 20, max: 29, rate: 0.10 },
    { min: 30, max: 39, rate: 0.15 },
    { min: 40, max: 49, rate: 0.20 },
    { min: 50, max: 59, rate: 0.25 },
    { min: 60, max: 69, rate: 0.30 },
    { min: 70, max: null, rate: 0.35 },
  ];

  return steps.map((step) => {
    const unitDiscount = Math.round(basePrice * step.rate);
    const unitPrice = basePrice - unitDiscount;
    return {
      minQty: step.min,
      maxQty: step.max,
      discountPercent: Math.round(step.rate * 100),
      unitPrice,
    };
  });
}

/**
 * Calculates detailed line pricing for a product and given quantity.
 */
export function calculateLinePricing(product: Product, quantity: number) {
  const safeQty = Math.max(1, Math.floor(quantity));
  const basePrice = product.basePrice;
  const isEligible = Boolean(product.isWholesaleEligible);
  const discountRate = getWholesaleDiscountRate(safeQty, isEligible);
  const discountPercent = Math.round(discountRate * 100);

  const discountAmountPerUnit = Math.round(basePrice * discountRate);
  const unitPriceAfterDiscount = basePrice - discountAmountPerUnit;
  const totalBaseAmount = basePrice * safeQty;
  const totalDiscountAmount = discountAmountPerUnit * safeQty;
  const lineSubtotal = totalBaseAmount - totalDiscountAmount;

  let tierDescription = 'Tarif standard';
  if (isEligible) {
    if (discountPercent > 0) {
      tierDescription = `Palier Grossiste (${safeQty} unités) : -${discountPercent}%`;
    } else {
      tierDescription = 'Palier Grossiste : 1 à 9 unités (0%) - Dès 10 unités : -5%';
    }
  }

  // Next tier incentive calculation
  let nextTierIncentive: { unitsNeeded: number; nextDiscountPercent: number; nextSavingsPerUnit: number } | null = null;
  if (isEligible) {
    const nextTierQty = (Math.floor(safeQty / 10) + 1) * 10;
    const nextRate = getWholesaleDiscountRate(nextTierQty, true);
    if (nextRate > discountRate) {
      nextTierIncentive = {
        unitsNeeded: nextTierQty - safeQty,
        nextDiscountPercent: Math.round(nextRate * 100),
        nextSavingsPerUnit: Math.round(basePrice * nextRate),
      };
    }
  }

  return {
    quantity: safeQty,
    baseUnitPrice: basePrice,
    discountRate,
    discountPercent,
    discountAmountPerUnit,
    unitPriceAfterDiscount,
    totalBaseAmount,
    totalDiscountAmount,
    lineSubtotal,
    tierDescription,
    nextTierIncentive,
  };
}

/**
 * Calculates overall cart summary and groups items into vendor sub-orders.
 */
export function calculateCartBreakdown(items: CartItem[], shippingMethod: 'abidjan_express' | 'standard' | 'point_relais' = 'standard') {
  let totalBaseAmount = 0;
  let totalWholesaleSavings = 0;
  let itemsSubtotal = 0;

  // Group by vendor
  const vendorMap = new Map<string, { vendorName: string; items: OrderItemRecord[]; subtotal: number }>();

  items.forEach((item) => {
    const pricing = calculateLinePricing(item.product, item.quantity);
    totalBaseAmount += pricing.totalBaseAmount;
    totalWholesaleSavings += pricing.totalDiscountAmount;
    itemsSubtotal += pricing.lineSubtotal;

    const record: OrderItemRecord = {
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      vendorId: item.product.vendorId,
      vendorName: item.product.vendorName,
      quantity: item.quantity,
      baseUnitPrice: pricing.baseUnitPrice,
      discountPercentApplied: pricing.discountPercent,
      unitPriceAfterDiscount: pricing.unitPriceAfterDiscount,
      discountAmountPerUnit: pricing.discountAmountPerUnit,
      totalDiscountAmount: pricing.totalDiscountAmount,
      lineSubtotal: pricing.lineSubtotal,
      tierDescription: pricing.tierDescription,
    };

    if (!vendorMap.has(item.product.vendorId)) {
      vendorMap.set(item.product.vendorId, {
        vendorName: item.product.vendorName,
        items: [],
        subtotal: 0,
      });
    }

    const vData = vendorMap.get(item.product.vendorId)!;
    vData.items.push(record);
    vData.subtotal += pricing.lineSubtotal;
  });

  const vendorCount = vendorMap.size;
  // Shipping calculation logic:
  // Base delivery in Abidjan: 1500 FCFA for first vendor, +500 FCFA per additional vendor if multi-vendor.
  // Express adds 1500 FCFA, Point relais is 1000 FCFA base.
  let baseShippingRate = 1500;
  if (shippingMethod === 'abidjan_express') baseShippingRate = 2500;
  if (shippingMethod === 'point_relais') baseShippingRate = 1000;

  const shippingTotal = items.length === 0 ? 0 : baseShippingRate + Math.max(0, (vendorCount - 1) * 500);

  const vendorSubOrders: VendorSubOrder[] = [];
  vendorMap.forEach((val, vendorId) => {
    // 8% platform marketplace commission
    const commission = Math.round(val.subtotal * 0.08);
    const allocatedShipping = Math.round(shippingTotal / vendorCount);
    vendorSubOrders.push({
      vendorId,
      vendorName: val.vendorName,
      items: val.items,
      subtotal: val.subtotal,
      vendorCommission: commission,
      vendorNetPayout: val.subtotal - commission,
      shippingFee: allocatedShipping,
      fulfillmentStatus: 'processing',
    });
  });

  const totalAmount = itemsSubtotal + shippingTotal;

  return {
    itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
    totalBaseAmount,
    totalWholesaleSavings,
    itemsSubtotal,
    shippingTotal,
    totalAmount,
    vendorCount,
    vendorSubOrders,
  };
}

/**
 * Format currency in FCFA (franc CFA BCEAO)
 * e.g. 10000 -> "10 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 FCFA';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}
