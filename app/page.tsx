import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import { Search, Home, TrendingUp, Shield, MapPin, ArrowRight, Building2, Trees, Building } from 'lucide-react';

export const revalidate = 60;

async function getFeaturedProperties() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('*, images:property_images(*), seller:users(full_name, avatar_url)')
    .eq('listing_status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

async function getRecentProperties() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('properties')
    .select('*, images:property_images(*), seller:users(full_name, avatar_url)')
    .eq('listing_status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);
  return data || [];
}

async function getStats() {
  const supabase = createServerSupabaseClient();
  const { count: totalProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('listing_status', 'active');
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  return { totalProperties: totalProperties || 0, totalUsers: totalUsers || 0 };
}

export default async function HomePage() {
  const [featured, recent, stats] = await Promise.all([
    getFeaturedProperties(),
    getRecentProperties(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-925 via-slate-900 to-brand-950 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-24 md:py-36 lg:py-44">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-soft" />
              <span className="text-sm text-brand-200 font-medium">
                {stats.totalProperties.toLocaleString()} properties available
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">
              Find your place
              <br />
              <span className="text-brand-400">in the world</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
              Discover exceptional properties curated for modern living. Your dream home is just a search away.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10 max-w-2xl">
              <form action="/properties" method="GET" className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Enter city, neighborhood, or address..."
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[15px]"
                  />
                </div>
                <button type="submit" className="btn-primary !py-4 !px-8 !rounded-xl whitespace-nowrap">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </form>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['Houses', 'Apartments', 'Condos', 'For Rent'].map((label) => (
                <Link
                  key={label}
                  href={`/properties?property_type=${label.toLowerCase().replace(' ', '_').replace('for_', '')}&property_status=${label === 'For Rent' ? 'for_rent' : ''}`}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Listings', value: stats.totalProperties.toLocaleString(), icon: Building2 },
              { label: 'Happy Users', value: stats.totalUsers.toLocaleString(), icon: Home },
              { label: 'Cities Covered', value: '50+', icon: MapPin },
              { label: 'Trusted Agents', value: '200+', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                <p className="font-display text-2xl md:text-3xl text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Curated Selection</span>
                <h2 className="section-title mt-2">Featured Properties</h2>
              </div>
              <Link href="/properties?featured=true" className="btn-ghost text-sm text-brand-600 hidden md:flex">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Property Types */}
      <section className="py-16 md:py-24 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Browse By Type</span>
            <h2 className="section-title mt-2">Explore Property Types</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Houses', icon: Home, type: 'house', color: 'bg-brand-50 text-brand-600 border-brand-100' },
              { label: 'Apartments', icon: Building2, type: 'apartment', color: 'bg-blue-50 text-blue-600 border-blue-100' },
              { label: 'Condos', icon: Building, type: 'condo', color: 'bg-purple-50 text-purple-600 border-purple-100' },
              { label: 'Townhouses', icon: Trees, type: 'townhouse', color: 'bg-amber-50 text-amber-600 border-amber-100' },
            ].map((item) => (
              <Link
                key={item.type}
                href={`/properties?property_type=${item.type}`}
                className={`p-6 rounded-2xl border ${item.color} hover:shadow-lg transition-all group text-center`}
              >
                <item.icon className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg">{item.label}</h3>
                <p className="text-sm opacity-75 mt-1">Browse {item.label.toLowerCase()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {recent.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Just Listed</span>
                <h2 className="section-title mt-2">Recent Properties</h2>
              </div>
              <Link href="/properties" className="btn-ghost text-sm text-brand-600 hidden md:flex">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-700 rounded-full blur-3xl opacity-50" />
        </div>
        <div className="page-container relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            Ready to list your property?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of sellers who trust Homestead to showcase their properties to qualified buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all shadow-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/properties" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-700/50 text-white font-semibold rounded-xl hover:bg-brand-700/70 transition-all border border-white/20">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
