import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export const LISTING_PRICES = {
  publish: {
    amount: 2999, // $29.99
    label: 'Publish Listing',
    description: 'Publish your property listing on Homestead',
  },
  featured: {
    amount: 9999, // $99.99
    label: 'Featured Listing',
    description: 'Promote your listing as featured for 30 days',
  },
};
