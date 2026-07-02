require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'CPVC Hot & Cold Water Pipe 1 inch',
    description: 'Chlorinated PVC pipe for hot and cold water supply. Withstands temperatures up to 93°C. Ideal for bathroom, kitchen and solar water heater connections.',
    price: 320, originalPrice: 380, category: 'Pipes & Fittings', brand: 'Astral', stock: 300, unit: 'meter',
    rating: 4.6, numReviews: 189, featured: true, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'CPVC Pipe' }],
    specifications: [{ key: 'Diameter', value: '1 inch' }, { key: 'Temp Rating', value: '93°C' }, { key: 'Standard', value: 'IS 15778' }]
  },
  {
    name: 'GI Pipe Medium Class 2 inch',
    description: 'Galvanized Iron pipe for water supply and structural applications. Hot dip galvanized for superior corrosion resistance. Suitable for overhead tanks and mains.',
    price: 850, originalPrice: 950, category: 'Pipes & Fittings', brand: 'Tata Steel', stock: 150, unit: 'meter',
    rating: 4.5, numReviews: 134, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'GI Pipe' }],
    specifications: [{ key: 'Diameter', value: '2 inch' }, { key: 'Class', value: 'Medium' }, { key: 'Standard', value: 'IS 1239' }]
  },
  {
    name: 'UPVC Elbow 90 Degree 2 inch',
    description: 'High quality UPVC elbow fitting for plumbing and drainage systems. Smooth inner surface for unrestricted flow. Easy solvent cement jointing.',
    price: 45, originalPrice: 60, category: 'Pipes & Fittings', brand: 'Supreme', stock: 1000, unit: 'piece',
    rating: 4.3, numReviews: 267, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'UPVC Elbow' }],
    specifications: [{ key: 'Size', value: '2 inch' }, { key: 'Angle', value: '90 Degree' }, { key: 'Material', value: 'UPVC' }]
  },
  {
    name: 'SWR Drainage Pipe 6 inch',
    description: 'Soil Waste and Rain water pipe for drainage and sewage systems. UV stabilized for outdoor use. Lightweight and easy to install with rubber ring joints.',
    price: 680, originalPrice: 780, category: 'Pipes & Fittings', brand: 'Finolex', stock: 200, unit: 'meter',
    rating: 4.4, numReviews: 156, featured: false, isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'SWR Pipe' }],
    specifications: [{ key: 'Diameter', value: '6 inch' }, { key: 'Type', value: 'SWR' }, { key: 'Standard', value: 'IS 13592' }]
  }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart')
  .then(async () => {
    console.log('Connected to MongoDB');
    const result = await Product.insertMany(products);
    console.log(`✅ ${result.length} Pipes & Fittings products added:`);
    result.forEach(p => console.log(`  - ${p.name} (${p.brand})`));
    mongoose.disconnect();
  })
  .catch(err => { console.error('Error:', err.message); mongoose.disconnect(); });
