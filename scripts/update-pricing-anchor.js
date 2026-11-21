// =====================================================================
// ONZNATURAL — Update Catalogue Pricing Anchor Strategy
// MRP is set to higher anchor price (crossed out)
// discount_price is set to the owner's REAL LAST SELLING PRICE
// =====================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fyhacouitykpbvylxwtz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGFjb3VpdHlrcGJ2eWx4d3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzAwOTcsImV4cCI6MjExMDY0NjA5N30.HMdp_onPpqgkuWAvg1DHgV3VuHdYDlMe47VPERoi3dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const UPDATES = [
  // Soaps: Anchor MRP ₹149, Real Selling Price ₹99
  { id: 'neem-tulsi-soap', mrp: 149, discount_price: 99 },
  { id: 'kesuda-palash-soap', mrp: 149, discount_price: 99 },
  { id: 'hibiscus-soap', mrp: 149, discount_price: 99 },
  { id: 'ubtan-soap', mrp: 149, discount_price: 99 },
  { id: 'charcoal-rice-soap', mrp: 149, discount_price: 99 },

  // Body Lotions: Anchor MRP ₹399, Real Selling Price ₹299
  { id: 'aparajita-body-lotion', mrp: 399, discount_price: 299 },
  { id: 'lavender-body-lotion', mrp: 399, discount_price: 299 },
  { id: 'honey-almond-body-lotion', mrp: 399, discount_price: 299 },
  { id: 'kesuda-body-lotion', mrp: 399, discount_price: 299 },

  // Body Creams: Anchor MRP ₹349, Real Selling Price ₹249
  { id: 'aparajita-body-cream', mrp: 349, discount_price: 249 },
  { id: 'kesuda-palash-body-cream', mrp: 349, discount_price: 249 },
  { id: 'honey-almond-body-cream', mrp: 349, discount_price: 249 },

  // Face & Body Washes: Anchor MRP ₹349, Real Selling Price ₹249
  { id: 'face-body-wash-neem-tulsi', mrp: 349, discount_price: 249 },
  { id: 'face-body-wash-kesuda', mrp: 349, discount_price: 249 },

  // Hand Wash: Anchor MRP ₹199, Real Selling Price ₹149
  { id: 'hand-wash-lemon', mrp: 199, discount_price: 149 },

  // Face Cream: Anchor MRP ₹349, Real Selling Price ₹249
  { id: 'rice-aloe-face-cream', mrp: 349, discount_price: 249 },

  // Lip Balm: Anchor MRP ₹129, Real Selling Price ₹89
  { id: 'lip-balm', mrp: 129, discount_price: 89 },
];

async function updatePricing() {
  console.log('Updating pricing in Supabase public.products...');
  for (const item of UPDATES) {
    const { error } = await supabase
      .from('products')
      .update({
        mrp: item.mrp,
        discount_price: item.discount_price,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (error) {
      console.error(`Failed to update ${item.id}:`, error.message);
    } else {
      console.log(`Updated ${item.id}: MRP ₹${item.mrp} (crossed out) -> Real Price ₹${item.discount_price}`);
    }
  }

  const { data } = await supabase
    .from('products')
    .select('id, name, mrp, discount_price')
    .order('id');
  
  console.log('\nVerified Supabase Products Table:');
  console.table(data);
}

updatePricing();
