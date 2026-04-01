'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import { Heart, MessageCircle, Phone, Mail, Share2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Property, User as UserType } from '@/types';

interface PropertyDetailActionsProps {
  property: Property;
  seller: UserType;
}

export default function PropertyDetailActions({ property, seller }: PropertyDetailActionsProps) {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }
    const supabase = createClient();
    if (saved) {
      await supabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', property.id);
      setSaved(false);
      toast.success('Removed from saved');
    } else {
      await supabase.from('saved_properties').insert({ user_id: user.id, property_id: property.id });
      setSaved(true);
      toast.success('Property saved!');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Seller Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
            {seller?.full_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{seller?.full_name || 'Property Owner'}</p>
            <p className="text-sm text-slate-500">Seller</p>
          </div>
        </div>

        {seller?.bio && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">{seller.bio}</p>
        )}

        <button
          onClick={() => setShowContact(!showContact)}
          className="btn-primary w-full mb-3"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Seller
        </button>

        {showContact && (
          <div className="space-y-3 animate-fade-in">
            {seller?.email && (
              <a href={`mailto:${seller.email}?subject=Inquiry about ${property.title}`} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-brand-600">
                <Mail className="w-4 h-4" />
                {seller.email}
              </a>
            )}
            {seller?.phone && (
              <a href={`tel:${seller.phone}`} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-brand-600">
                <Phone className="w-4 h-4" />
                {seller.phone}
              </a>
            )}
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi, I'm interested in ${property.title}...`}
                className="input-field text-sm min-h-[100px] resize-y"
              />
              <a
                href={`mailto:${seller?.email}?subject=Inquiry about ${property.title}&body=${encodeURIComponent(message)}`}
                className="btn-secondary w-full mt-2 text-sm"
              >
                Send Message
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className={cn(
            'btn-secondary flex-1',
            saved && 'bg-red-50 border-red-200 text-red-600'
          )}
        >
          <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button onClick={handleShare} className="btn-secondary flex-1">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
