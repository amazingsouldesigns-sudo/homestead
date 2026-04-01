/**
 * Seed script for Homestead demo data.
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local
 *   2. Run: node supabase/seed.js
 *
 * This creates a demo seller user and sample property listings.
 * NOTE: You must have already run the database migration first.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_PROPERTIES = [
  {
    title: 'Modern Beach House with Ocean View',
    description:
      'Stunning modern beach house featuring floor-to-ceiling windows, open concept living, a gourmet kitchen with marble countertops, and a wraparound deck overlooking the Pacific Ocean. Recently renovated with premium finishes throughout.',
    price: 1250000,
    address: '742 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    zip_code: '33139',
    latitude: 25.7826,
    longitude: -80.1341,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    property_type: 'house',
    property_status: 'for_sale',
    year_built: 2021,
    lot_size: 5500,
    parking: '2-car garage',
  },
  {
    title: 'Downtown Luxury Penthouse',
    description:
      'Exquisite penthouse in the heart of the city with 360-degree skyline views. Features a private rooftop terrace, smart home system, wine cellar, and concierge service. The epitome of urban luxury living.',
    price: 8500,
    address: '100 Brickell Ave',
    city: 'Miami',
    state: 'FL',
    zip_code: '33131',
    latitude: 25.7617,
    longitude: -80.1918,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    property_type: 'condo',
    property_status: 'for_rent',
    year_built: 2023,
    parking: 'Valet',
  },
  {
    title: 'Charming Craftsman Bungalow',
    description:
      'A beautifully restored 1920s Craftsman bungalow with original hardwood floors, a cozy fireplace, updated kitchen, and a lush backyard garden. Located in a tree-lined historic neighborhood.',
    price: 485000,
    address: '1234 Oak Street',
    city: 'Portland',
    state: 'OR',
    zip_code: '97201',
    latitude: 45.5152,
    longitude: -122.6784,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    property_type: 'house',
    property_status: 'for_sale',
    year_built: 1925,
    lot_size: 6000,
    parking: 'Driveway',
  },
  {
    title: 'Sleek Studio in Arts District',
    description:
      'Contemporary studio apartment in the vibrant Arts District. Polished concrete floors, exposed brick, oversized windows, in-unit washer/dryer, and rooftop access with city views. Steps from galleries and restaurants.',
    price: 2200,
    address: '456 Gallery Row',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90013',
    latitude: 34.0407,
    longitude: -118.2357,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    property_type: 'apartment',
    property_status: 'for_rent',
    year_built: 2019,
    parking: '1 assigned spot',
  },
  {
    title: 'Mountain Retreat with Panoramic Views',
    description:
      'Escape to this luxurious mountain home featuring vaulted ceilings, a stone fireplace, chef\'s kitchen, and a wraparound porch with breathtaking mountain views. Perfect for those who love nature and privacy.',
    price: 975000,
    address: '89 Summit Ridge',
    city: 'Aspen',
    state: 'CO',
    zip_code: '81611',
    latitude: 39.1911,
    longitude: -106.8175,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4500,
    property_type: 'house',
    property_status: 'for_sale',
    year_built: 2018,
    lot_size: 12000,
    parking: '3-car garage',
  },
  {
    title: 'Waterfront Townhouse',
    description:
      'Elegant three-story townhouse on the waterfront with a private dock. Features a gourmet kitchen, rooftop terrace, two balconies, and stunning sunset views over the harbor.',
    price: 725000,
    address: '22 Harbor Walk',
    city: 'Charleston',
    state: 'SC',
    zip_code: '29401',
    latitude: 32.7765,
    longitude: -79.9311,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2400,
    property_type: 'townhouse',
    property_status: 'for_sale',
    year_built: 2020,
    parking: 'Attached garage',
  },
];

function createSlug(title, city) {
  return `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

async function seed() {
  console.log('🌱 Seeding Homestead database...\n');

  // Check if demo properties already exist
  const { count } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    console.log(`Database already has ${count} properties. Skipping seed.`);
    console.log('To re-seed, delete existing properties first.');
    return;
  }

  // We need at least one user to be the seller.
  // Fetch the first user or instruct the admin to create one.
  const { data: users } = await supabase.from('users').select('id').limit(1);

  if (!users || users.length === 0) {
    console.log('⚠️  No users found. Please sign up at least one user first, then re-run this script.');
    return;
  }

  const sellerId = users[0].id;

  // Update the user to seller role
  await supabase.from('users').update({ role: 'seller' }).eq('id', sellerId);
  console.log(`✓ Set user ${sellerId} as seller\n`);

  // Insert properties
  for (const prop of DEMO_PROPERTIES) {
    const slug = createSlug(prop.title, prop.city);
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...prop,
        seller_id: sellerId,
        slug,
        listing_status: 'active',
        is_featured: Math.random() > 0.5,
      })
      .select()
      .single();

    if (error) {
      console.error(`✗ Failed to create "${prop.title}":`, error.message);
    } else {
      console.log(`✓ Created: ${prop.title} (${slug})`);
    }
  }

  console.log('\n✅ Seed complete! You can now browse properties at http://localhost:3000/properties');
}

seed().catch(console.error);
