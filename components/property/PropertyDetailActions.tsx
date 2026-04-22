'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase-browser';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  HeartIcon,
  PhoneIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HomesteadMark } from '@/components/ui/HomesteadMark';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Property, User as UserType } from '@/types';
import ContactAgentCta from '@/components/property/ContactAgentCta';

interface PropertyDetailActionsProps {
  property: Property;
  seller: UserType | null;
}

export default function PropertyDetailActions({ property, seller }: PropertyDetailActionsProps) {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  const brandName = (process.env.NEXT_PUBLIC_APP_NAME || 'Homestead').trim() || 'Homestead';
  const isImported = property.listing_origin === 'imported';

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
      <div className="hidden lg:block">
        <ContactAgentCta property={property} variant="sidebar" />
      </div>

      {/* Seller Card */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          {seller ? (
            <UserAvatar avatarUrl={seller.avatar_url} size="xl" />
          ) : (
            <HomesteadMark className="w-12 h-12" iconClassName="w-6 h-6" />
          )}
          <div>
            <p className="font-semibold text-slate-100">
              {seller?.full_name || (isImported ? brandName : 'Property owner')}
            </p>
            <p className="text-sm text-slate-400">
              {seller
                ? 'Seller'
                : isImported
                  ? [property.city, property.state].filter(Boolean).join(', ') || 'Imported listing'
                  : 'Listing'}
            </p>
          </div>
        </div>

        {isImported && !seller && (
          <p className="mb-4 text-sm text-slate-400">
            This {property.city ? `${property.city} ` : ''}listing is on {brandName} from public market data. Open{' '}
            <strong>Contact agent</strong> above to schedule a call first, then copy the agent email if you need it.
          </p>
        )}

        {seller?.bio && (
          <p className="mb-4 line-clamp-3 text-sm text-slate-400">{seller.bio}</p>
        )}

        {seller && (
          <button
            type="button"
            onClick={() => setShowContact(!showContact)}
            className="btn-primary w-full mb-3"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Contact Seller
          </button>
        )}

        {showContact && seller && (
          <div className="space-y-3 animate-fade-in">
            {seller.email && (
              <a
                href={`mailto:${seller.email}?subject=Inquiry about ${property.title}`}
                className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-brand-400"
              >
                <EnvelopeIcon className="h-4 w-4" />
                {seller.email}
              </a>
            )}
            {seller.phone && (
              <a href={`tel:${seller.phone}`} className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-brand-400">
                <PhoneIcon className="h-4 w-4" />
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
                href={`mailto:${seller.email}?subject=Inquiry about ${property.title}&body=${encodeURIComponent(message)}`}
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
            'btn-secondary gold-favorite-hover flex-1',
            saved && 'bg-red-50 border-red-200 text-red-600'
          )}
        >
          <HeartIcon className={cn('h-4 w-4', saved && 'fill-current')} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button onClick={handleShare} className="btn-secondary flex-1">
          <ShareIcon className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}
