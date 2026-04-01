import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { Property, PropertyFilters } from '@/types';

interface UsePropertiesResult {
  properties: Property[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProperties(filters: PropertyFilters): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      let query = supabase
        .from('properties')
        .select('*, images:property_images(*), seller:users(full_name, avatar_url)', { count: 'exact' })
        .eq('listing_status', 'active');

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,city.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
        );
      }
      if (filters.property_type) query = query.eq('property_type', filters.property_type);
      if (filters.property_status) query = query.eq('property_status', filters.property_status);
      if (filters.min_price) query = query.gte('price', filters.min_price);
      if (filters.max_price) query = query.lte('price', filters.max_price);
      if (filters.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
      if (filters.bathrooms) query = query.gte('bathrooms', filters.bathrooms);
      if (filters.is_featured) query = query.eq('is_featured', true);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);

      switch (filters.sort_by) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });
      }

      const page = filters.page || 1;
      const limit = filters.limit || 24;
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, count, error: queryError } = await query;

      if (queryError) throw queryError;

      setProperties(data || []);
      setTotal(count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
      setTotal(0);
    }

    setLoading(false);
  }, [
    filters.search,
    filters.property_type,
    filters.property_status,
    filters.min_price,
    filters.max_price,
    filters.bedrooms,
    filters.bathrooms,
    filters.is_featured,
    filters.city,
    filters.sort_by,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, total, loading, error, refetch: fetchProperties };
}

export function useSavedProperties(userId: string | undefined) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', userId);

      setSavedIds(new Set((data || []).map((s) => s.property_id)));
      setLoading(false);
    };

    fetchSaved();
  }, [userId]);

  const toggleSave = async (propertyId: string) => {
    if (!userId) return false;
    const supabase = createClient();

    if (savedIds.has(propertyId)) {
      await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
      return false;
    } else {
      await supabase
        .from('saved_properties')
        .insert({ user_id: userId, property_id: propertyId });
      setSavedIds((prev) => new Set(prev).add(propertyId));
      return true;
    }
  };

  return { savedIds, loading, toggleSave, isSaved: (id: string) => savedIds.has(id) };
}
