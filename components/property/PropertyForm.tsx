'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { useAuthStore } from '@/lib/store';
import { createSlug } from '@/lib/utils';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';
import type { Property } from '@/types';
import { Save, Loader2 } from 'lucide-react';

interface PropertyFormProps {
  property?: Property;
  mode: 'create' | 'edit';
}

export default function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<any[]>(
    property?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      storage_path: img.storage_path,
      is_primary: img.is_primary,
      display_order: img.display_order,
    })) || []
  );

  const [form, setForm] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price?.toString() || '',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zip_code: property?.zip_code || '',
    bedrooms: property?.bedrooms?.toString() || '0',
    bathrooms: property?.bathrooms?.toString() || '0',
    sqft: property?.sqft?.toString() || '',
    property_type: property?.property_type || 'house',
    property_status: property?.property_status || 'for_sale',
    year_built: property?.year_built?.toString() || '',
    lot_size: property?.lot_size?.toString() || '',
    parking: property?.parking || '',
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.price || !form.address || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const propertyData = {
      seller_id: user.id,
      title: form.title,
      slug: createSlug(form.title, form.city) + '-' + Date.now().toString(36),
      description: form.description,
      price: parseFloat(form.price),
      address: form.address,
      city: form.city,
      state: form.state,
      zip_code: form.zip_code,
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      sqft: parseInt(form.sqft) || 0,
      property_type: form.property_type,
      property_status: form.property_status,
      listing_status: 'draft' as const,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      lot_size: form.lot_size ? parseFloat(form.lot_size) : null,
      parking: form.parking || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };

    try {
      let propertyId: string;

      if (mode === 'edit' && property) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
        if (error) throw error;
        propertyId = property.id;

        // Delete old images not in current list
        const existingIds = images.filter((i) => i.id).map((i) => i.id);
        if (property.images) {
          const toDelete = property.images.filter((i) => !existingIds.includes(i.id));
          if (toDelete.length > 0) {
            await supabase.from('property_images').delete().in('id', toDelete.map((i) => i.id));
          }
        }
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();
        if (error) throw error;
        propertyId = data.id;
      }

      // Save images
      const newImages = images.filter((i) => !i.id);
      if (newImages.length > 0) {
        const imageRows = newImages.map((img) => ({
          property_id: propertyId,
          url: img.url,
          storage_path: img.storage_path,
          is_primary: img.is_primary,
          display_order: img.display_order,
        }));
        await supabase.from('property_images').insert(imageRows);
      }

      // Update existing image primary status
      for (const img of images.filter((i) => i.id)) {
        await supabase.from('property_images').update({
          is_primary: img.is_primary,
          display_order: img.display_order,
        }).eq('id', img.id);
      }

      toast.success(mode === 'create' ? 'Property created!' : 'Property updated!');
      router.push('/dashboard/listings');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="e.g. Modern Beach House with Ocean View" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Price *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field" placeholder="e.g. 450000" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Property Type</label>
            <select name="property_type" value={form.property_type} onChange={handleChange} className="input-field">
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</label>
            <select name="property_status" value={form.property_status} onChange={handleChange} className="input-field">
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bedrooms</label>
            <select name="bedrooms" value={form.bedrooms} onChange={handleChange} className="input-field">
              {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bathrooms</label>
            <select name="bathrooms" value={form.bathrooms} onChange={handleChange} className="input-field">
              {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Square Footage</label>
            <input name="sqft" type="number" value={form.sqft} onChange={handleChange} className="input-field" placeholder="e.g. 2400" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Year Built</label>
            <input name="year_built" type="number" value={form.year_built} onChange={handleChange} className="input-field" placeholder="e.g. 2020" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Parking</label>
            <input name="parking" value={form.parking} onChange={handleChange} className="input-field" placeholder="e.g. 2-car garage" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[120px] resize-y" placeholder="Describe your property..." />
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Address *</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="Street address" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">City *</label>
            <input name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="City" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">State</label>
            <input name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="State" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">ZIP Code</label>
            <input name="zip_code" value={form.zip_code} onChange={handleChange} className="input-field" placeholder="ZIP" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Latitude</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} className="input-field" placeholder="e.g. 37.7749" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Longitude</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} className="input-field" placeholder="e.g. -122.4194" />
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Photos</h3>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === 'create' ? 'Create Listing' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
