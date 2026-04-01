'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UploadedImage {
  id?: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  display_order: number;
  file?: File;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  propertyId?: string;
}

export default function ImageUploader({ images, onChange, propertyId }: ImageUploaderProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const supabase = createClient();
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage
        .from('property-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(path);

      newImages.push({
        url: publicUrl,
        storage_path: path,
        is_primary: images.length === 0 && i === 0,
        display_order: images.length + i,
      });
    }

    onChange([...images, ...newImages]);
    setUploading(false);
    if (newImages.length > 0) toast.success(`${newImages.length} image(s) uploaded`);
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    const supabase = createClient();

    if (img.storage_path) {
      await supabase.storage.from('property-images').remove([img.storage_path]);
    }

    const updated = images.filter((_, i) => i !== index);
    if (img.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    onChange(updated.map((img, i) => ({ ...img, display_order: i })));
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div>
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          uploading
            ? 'border-brand-300 bg-brand-50'
            : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Upload className={cn('w-8 h-8 mx-auto mb-3', uploading ? 'text-brand-500 animate-pulse' : 'text-slate-400')} />
        <p className="text-sm font-medium text-slate-700">
          {uploading ? 'Uploading...' : 'Click or drag photos here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((img, i) => (
            <div key={i} className={cn(
              'relative aspect-[4/3] rounded-xl overflow-hidden group border-2',
              img.is_primary ? 'border-brand-500' : 'border-transparent'
            )}>
              <Image src={img.url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="200px" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setPrimary(i)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    img.is_primary ? 'bg-brand-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'
                  )}
                  title="Set as primary"
                >
                  <Star className={cn('w-4 h-4', img.is_primary && 'fill-current')} />
                </button>
                <button
                  onClick={() => removeImage(i)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {img.is_primary && (
                <span className="absolute top-2 left-2 badge bg-brand-600 text-white text-[10px]">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
