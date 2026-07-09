require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // ── CEMENT (need 2 more) ──────────────────────────────────────────
  {
    name: 'Dalmia DSP Cement 53 Grade',
    description: 'High performance cement with superior strength and durability. Ideal for RCC structures, precast elements and high-rise buildings.',
    price: 390, originalPrice: 430, category: 'Cement', brand: 'Dalmia', stock: 350, unit: 'bag',
    rating: 4.4, numReviews: 156, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', alt: 'Dalmia Cement' }],
    specifications: [{ key: 'Grade', value: 'OPC 53' }, { key: 'Weight', value: '50 kg' }, { key: 'Setting Time', value: '30 min' }]
  },
  {
    name: 'Shree Ultra Cement PPC',
    description: 'Portland Pozzolana Cement with superior workability and reduced heat of hydration. Best for mass concrete and plastering work.',
    price: 365, originalPrice: 400, category: 'Cement', brand: 'Shree Cement', stock: 420, unit: 'bag',
    rating: 4.3, numReviews: 134, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', alt: 'Shree Cement' }],
    specifications: [{ key: 'Type', value: 'PPC' }, { key: 'Weight', value: '50 kg' }, { key: 'Fly Ash', value: '15-35%' }]
  },

  // ── STEEL (need 3 more) ───────────────────────────────────────────
  {
    name: 'JSW Neosteel TMT Bar 8mm',
    description: 'High strength TMT bars with superior ductility and earthquake resistance. Ideal for residential and commercial construction.',
    price: 54000, originalPrice: 58000, category: 'Steel', brand: 'JSW', stock: 60, unit: 'ton',
    rating: 4.6, numReviews: 112, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80', alt: 'JSW Steel' }],
    specifications: [{ key: 'Diameter', value: '8mm' }, { key: 'Grade', value: 'Fe-500D' }, { key: 'Standard', value: 'IS 1786' }]
  },
  {
    name: 'Vizag Steel TMT Bar 16mm',
    description: 'RINL Vizag Steel TMT bars with high tensile strength and corrosion resistance. Suitable for bridges and heavy structures.',
    price: 57000, category: 'Steel', brand: 'Vizag Steel', stock: 45, unit: 'ton',
    rating: 4.5, numReviews: 89, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80', alt: 'Vizag Steel' }],
    specifications: [{ key: 'Diameter', value: '16mm' }, { key: 'Grade', value: 'Fe-500' }, { key: 'Length', value: '12 meters' }]
  },
  {
    name: 'Kamdhenu TMT Bar Fe-550',
    description: 'Super high strength Fe-550 grade TMT bars for critical structures. Enhanced weldability and superior bonding with concrete.',
    price: 60000, originalPrice: 65000, category: 'Steel', brand: 'Kamdhenu', stock: 35, unit: 'ton',
    rating: 4.4, numReviews: 67, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80', alt: 'Kamdhenu Steel' }],
    specifications: [{ key: 'Grade', value: 'Fe-550' }, { key: 'Diameter', value: '10-32mm' }, { key: 'Elongation', value: '>14.5%' }]
  },

  // ── TOOLS (need 2 more) ───────────────────────────────────────────
  {
    name: 'Dewalt 20V Cordless Drill',
    description: 'Brushless cordless drill with 2-speed transmission. Compact and lightweight for overhead and tight space drilling. Includes 2 batteries.',
    price: 12500, originalPrice: 14000, category: 'Tools', brand: 'Dewalt', stock: 25, unit: 'piece',
    rating: 4.7, numReviews: 203, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80', alt: 'Dewalt Drill' }],
    specifications: [{ key: 'Voltage', value: '20V' }, { key: 'Speed', value: '0-2000 RPM' }, { key: 'Chuck', value: '13mm' }]
  },
  {
    name: 'Stanley Hand Saw 20 inch',
    description: 'Professional grade hand saw with hardened teeth for fast and accurate cutting. Ergonomic handle reduces fatigue. Suitable for wood and PVC.',
    price: 650, originalPrice: 780, category: 'Tools', brand: 'Stanley', stock: 80, unit: 'piece',
    rating: 4.3, numReviews: 145, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80', alt: 'Stanley Saw' }],
    specifications: [{ key: 'Blade Length', value: '20 inch' }, { key: 'TPI', value: '8' }, { key: 'Material', value: 'Hardened Steel' }]
  },

  // ── SAND & AGGREGATE (need 4 more) ───────────────────────────────
  {
    name: 'River Sand (Fine Grade)',
    description: 'Natural river sand with uniform grain size. Ideal for plastering, masonry mortar and concrete mixing. Free from clay and organic matter.',
    price: 1500, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 800, unit: 'ton',
    rating: 4.3, numReviews: 98, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'River Sand' }],
    specifications: [{ key: 'Grade', value: 'Fine' }, { key: 'FM', value: '1.5-2.5' }, { key: 'Silt Content', value: '<3%' }]
  },
  {
    name: '20mm Crushed Stone Aggregate',
    description: 'Machine crushed granite aggregate for concrete work. Uniform size and shape for consistent concrete mix. High compressive strength.',
    price: 1800, originalPrice: 2000, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 600, unit: 'ton',
    rating: 4.4, numReviews: 76, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Crushed Stone' }],
    specifications: [{ key: 'Size', value: '20mm' }, { key: 'Type', value: 'Crushed Granite' }, { key: 'Flakiness', value: '<25%' }]
  },
  {
    name: '40mm Coarse Aggregate',
    description: 'Coarse aggregate for mass concrete, foundations and road base. Sourced from quality quarries with consistent gradation.',
    price: 1600, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 500, unit: 'ton',
    rating: 4.2, numReviews: 54, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Coarse Aggregate' }],
    specifications: [{ key: 'Size', value: '40mm' }, { key: 'Use', value: 'Mass Concrete' }, { key: 'Standard', value: 'IS 383' }]
  },
  {
    name: 'Robo Sand (Manufactured Sand)',
    description: 'Eco-friendly manufactured sand as a complete substitute for river sand. Consistent quality, zero silt and ideal gradation for all concrete work.',
    price: 1100, originalPrice: 1300, category: 'Sand & Aggregate', brand: 'Robo Silicon', stock: 900, unit: 'ton',
    rating: 4.5, numReviews: 167, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Robo Sand' }],
    specifications: [{ key: 'Grade', value: 'Zone II' }, { key: 'Silt', value: '0%' }, { key: 'FM', value: '2.6-3.1' }]
  },

  // ── BRICKS (need 4 more) ──────────────────────────────────────────
  {
    name: 'Fly Ash Bricks (AAC)',
    description: 'Lightweight Autoclaved Aerated Concrete bricks with excellent thermal insulation. Reduces dead load on structure and saves cement in plastering.',
    price: 45, originalPrice: 55, category: 'Bricks', brand: 'Siporex', stock: 20000, unit: 'piece',
    rating: 4.5, numReviews: 234, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', alt: 'AAC Blocks' }],
    specifications: [{ key: 'Size', value: '600x200x200mm' }, { key: 'Density', value: '550-650 kg/m³' }, { key: 'Strength', value: '3-4 MPa' }]
  },
  {
    name: 'Hollow Concrete Blocks 6 inch',
    description: 'Machine made hollow concrete blocks for partition walls and boundary walls. Uniform size, high strength and excellent sound insulation.',
    price: 35, category: 'Bricks', brand: 'BuildMart', stock: 15000, unit: 'piece',
    rating: 4.2, numReviews: 112, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', alt: 'Hollow Blocks' }],
    specifications: [{ key: 'Size', value: '400x200x150mm' }, { key: 'Strength', value: '>5 MPa' }, { key: 'Type', value: 'Hollow' }]
  },
  {
    name: 'Wire Cut Bricks (First Class)',
    description: 'Machine made wire cut bricks with sharp edges and uniform dimensions. Superior strength and water absorption. Ideal for exposed brickwork.',
    price: 12, originalPrice: 14, category: 'Bricks', brand: 'Wienerberger', stock: 30000, unit: 'piece',
    rating: 4.6, numReviews: 189, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', alt: 'Wire Cut Bricks' }],
    specifications: [{ key: 'Size', value: '230x110x70mm' }, { key: 'Strength', value: '>17.5 MPa' }, { key: 'Water Absorption', value: '<12%' }]
  },
  {
    name: 'Solid Concrete Blocks 4 inch',
    description: 'Dense solid concrete blocks for load bearing walls and compound walls. High compressive strength and weather resistance.',
    price: 28, category: 'Bricks', brand: 'BuildMart', stock: 25000, unit: 'piece',
    rating: 4.3, numReviews: 98, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', alt: 'Solid Blocks' }],
    specifications: [{ key: 'Size', value: '400x200x100mm' }, { key: 'Strength', value: '>7 MPa' }, { key: 'Type', value: 'Solid' }]
  },

  // ── PAINT (need 4 more) ───────────────────────────────────────────
  {
    name: 'Berger WeatherCoat All Guard',
    description: 'Advanced exterior emulsion with 10-year warranty. Superior protection against rain, UV and algae. Self-cleaning technology keeps walls fresh.',
    price: 3200, originalPrice: 3600, category: 'Paint', brand: 'Berger', stock: 80, unit: 'liter',
    rating: 4.5, numReviews: 267, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80', alt: 'Berger Paint' }],
    specifications: [{ key: 'Volume', value: '20L' }, { key: 'Coverage', value: '130-150 sq.ft/L' }, { key: 'Finish', value: 'Smooth Matt' }]
  },
  {
    name: 'Nerolac Impressions HD Interior',
    description: 'Premium interior emulsion with high definition finish. Washable, stain resistant and low VOC. Available in 2000+ shades.',
    price: 2400, originalPrice: 2800, category: 'Paint', brand: 'Nerolac', stock: 120, unit: 'liter',
    rating: 4.4, numReviews: 198, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80', alt: 'Nerolac Paint' }],
    specifications: [{ key: 'Volume', value: '20L' }, { key: 'Finish', value: 'Sheen' }, { key: 'Dry Time', value: '2 hours' }]
  },
  {
    name: 'Dulux Weathershield Exterior',
    description: 'Akzo Nobel Dulux exterior paint with 7-year protection. Dirt resistant, anti-fungal and UV resistant formula for long lasting colour.',
    price: 3500, originalPrice: 3900, category: 'Paint', brand: 'Dulux', stock: 90, unit: 'liter',
    rating: 4.6, numReviews: 312, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80', alt: 'Dulux Paint' }],
    specifications: [{ key: 'Volume', value: '20L' }, { key: 'Coverage', value: '140-160 sq.ft/L' }, { key: 'Protection', value: '7 years' }]
  },
  {
    name: 'Asian Paints TruCare Wall Primer',
    description: 'High quality wall primer for interior and exterior surfaces. Excellent adhesion, alkali resistance and sealing properties. Reduces paint consumption.',
    price: 1200, originalPrice: 1400, category: 'Paint', brand: 'Asian Paints', stock: 200, unit: 'liter',
    rating: 4.3, numReviews: 145, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80', alt: 'Wall Primer' }],
    specifications: [{ key: 'Volume', value: '20L' }, { key: 'Type', value: 'Acrylic Primer' }, { key: 'Coverage', value: '180-200 sq.ft/L' }]
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart');
    console.log('Connected to MongoDB');
    const result = await Product.insertMany(products);
    console.log(`✅ ${result.length} products added`);

    // Summary
    const cats = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    console.log('\nCategory counts:');
    cats.forEach(c => console.log(`  ${c._id}: ${c.count}`));
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.disconnect();
  }
}

seed();
