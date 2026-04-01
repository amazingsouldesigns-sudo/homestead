'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import PropertyCard from '@/components/property/PropertyCard';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SavedPage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('saved_properties')
      .select('*, property:properties(*, images:property_images(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSaved(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Saved Properties</h1>
        <p className="text-slate-500 text-sm mt-1">{saved.length} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20 card-elevated">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-xl font-semibold text-slate-600 mb-2">No saved properties</p>
          <p className="text-slate-400 mb-6">Browse properties and save the ones you love</p>
          <Link href="/properties" className="btn-primary">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((s: any) => (
            <PropertyCard
              key={s.id}
              property={s.property}
              saved
              onUnsave={fetchSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
