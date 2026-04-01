export type UserRole = 'buyer' | 'seller' | 'admin';
export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
export type PropertyStatus = 'for_sale' | 'for_rent';
export type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'sold' | 'rented';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: PropertyType;
  property_status: PropertyStatus;
  listing_status: ListingStatus;
  is_featured: boolean;
  featured_until?: string;
  year_built?: number;
  lot_size?: number;
  parking?: string;
  amenities?: string[];
  views_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  seller?: User;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  property_id?: string;
  stripe_payment_id: string;
  stripe_session_id?: string;
  amount: number;
  currency: string;
  payment_type: 'listing_publish' | 'listing_featured';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  // Joined
  user?: User;
  property?: Property;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: PropertyType;
  property_status?: PropertyStatus;
  is_featured?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  total_views: number;
  total_saves: number;
  total_revenue: number;
}
