export type CommercialUniverse =
  | 'Supermarché'
  | 'Mode'
  | 'Téléphonie'
  | 'Électronique'
  | 'Informatique'
  | 'Maison & Bureau'
  | 'Santé & Beauté'
  | 'Bébés & Jouets'
  | 'Articles de Sport'
  | 'Automobile';

export type MainNavSpace = 'home' | 'shopping' | 'supermarche' | 'galerie' | 'business' | 'plus18' | 'apropos';

export type UserRole = 'visitor' | 'client' | 'vendor_standard' | 'vendor_wholesale' | 'admin';

export interface WholesaleTier {
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  unitPrice: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  additionalPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  universe: CommercialUniverse;
  category: string;
  subCategory?: string;
  basePrice: number; // in FCFA
  promoPrice?: number; // optional promo in FCFA
  stock: number;
  vendorId: string;
  vendorName: string;
  vendorType: 'standard' | 'wholesale';
  isWholesaleEligible: boolean; // Enables the +5% per 10 units rule from Cahier des charges V2
  brand?: string;
  images: string[];
  has3DModel?: boolean;
  model3DType?: 'phone' | 'sneaker' | 'produce' | 'bottle' | 'furniture';
  unitLabel?: string; // e.g. "Sac 25kg", "Kg", "Carton de 12", "Pièce"
  isFresh?: boolean;
  freshnessGuarantee?: string;
  storageConditions?: string;
  specifications: Record<string, string>;
  isPlus18?: boolean;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  calculatedUnitPrice: number;
  calculatedDiscountPercent: number;
  calculatedDiscountAmount: number;
  calculatedSubtotal: number;
}

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  type: 'standard' | 'wholesale';
  verified: boolean;
  rating: number;
  totalSales: number;
  commissionRate: number; // e.g. 0.08 for 8%
  avatar: string;
  description: string;
  joinedDate: string;
}

export interface BusinessEntity {
  id: string;
  name: string;
  logo: string;
  coverImage?: string;
  sector:
    | 'Finance'
    | 'Comptabilité'
    | 'Contrôle de gestion'
    | 'Immobilier'
    | 'Mécanique'
    | 'Menuiserie'
    | 'Voyage'
    | 'Informatique'
    | 'Transport & Logistique'
    | 'Services aux entreprises';
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  verified: boolean;
  services: string[];
  website?: string;
  gallery: string[];
}

export interface MallPartner {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  description: string;
  location: string;
  city: string;
  openingHours: string;
  storeCount: number;
  productCategories: string[];
  featuredBrands: string[];
}

export interface AdCampaign {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetLink: string;
  targetType: 'universe' | 'product' | 'mall' | 'business' | 'wholesale';
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  badgeText?: string;
}


export interface OrderItemRecord {
  productId: string;
  productName: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  baseUnitPrice: number;
  discountPercentApplied: number;
  unitPriceAfterDiscount: number;
  discountAmountPerUnit: number;
  totalDiscountAmount: number;
  lineSubtotal: number;
  tierDescription: string;
}

export interface VendorSubOrder {
  vendorId: string;
  vendorName: string;
  items: OrderItemRecord[];
  subtotal: number;
  vendorCommission: number;
  vendorNetPayout: number;
  shippingFee: number;
  fulfillmentStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface MainOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingMethod: 'abidjan_express' | 'standard' | 'point_relais';
  paymentMethod: 'orange_money' | 'wave' | 'mtn_momo' | 'moov_money' | 'card' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalBaseAmount: number;
  totalWholesaleSavings: number;
  shippingTotal: number;
  totalAmount: number; // in FCFA
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  vendorSubOrders: VendorSubOrder[];
  customerNotes?: string;
}
