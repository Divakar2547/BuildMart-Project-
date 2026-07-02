require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const electricalProducts = [
  {
    name: 'Havells FRLS PVC Wire 1.5 sq mm',
    description: 'Flame Retardant Low Smoke PVC insulated copper wire. Ideal for household wiring, switchboards and light fittings. ISI marked for safety.',
    price: 850,
    originalPrice: 980,
    category: 'Electrical',
    brand: 'Havells',
    stock: 200,
    unit: 'roll',
    rating: 4.6,
    numReviews: 312,
    featured: true,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Havells Wire' }],
    specifications: [{ key: 'Cross Section', value: '1.5 sq mm' }, { key: 'Length', value: '90 meters' }, { key: 'Type', value: 'FRLS PVC' }]
  },
  {
    name: 'Finolex 4 sq mm Copper Wire',
    description: 'High conductivity copper wire with PVC insulation for power circuits and heavy appliances. Suitable for AC, refrigerator and motor connections.',
    price: 1650,
    originalPrice: 1900,
    category: 'Electrical',
    brand: 'Finolex',
    stock: 150,
    unit: 'roll',
    rating: 4.5,
    numReviews: 198,
    featured: false,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Finolex Wire' }],
    specifications: [{ key: 'Cross Section', value: '4 sq mm' }, { key: 'Length', value: '90 meters' }, { key: 'Standard', value: 'IS 694' }]
  },
  {
    name: 'Schneider Electric MCB 32A',
    description: 'Miniature Circuit Breaker for overload and short circuit protection. Single pole, 32A rating. Easy DIN rail mounting for distribution boards.',
    price: 320,
    originalPrice: 380,
    category: 'Electrical',
    brand: 'Schneider',
    stock: 500,
    unit: 'piece',
    rating: 4.7,
    numReviews: 245,
    featured: true,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'MCB' }],
    specifications: [{ key: 'Current Rating', value: '32A' }, { key: 'Poles', value: 'Single Pole' }, { key: 'Breaking Capacity', value: '10kA' }]
  },
  {
    name: 'Legrand Modular Switch 6A',
    description: 'Premium modular switch with smooth operation and long life. Suitable for all modular switch plates. Fire retardant polycarbonate body.',
    price: 85,
    originalPrice: 110,
    category: 'Electrical',
    brand: 'Legrand',
    stock: 1000,
    unit: 'piece',
    rating: 4.4,
    numReviews: 421,
    featured: false,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Modular Switch' }],
    specifications: [{ key: 'Rating', value: '6A 240V' }, { key: 'Type', value: '1 Way' }, { key: 'Material', value: 'Polycarbonate' }]
  },
  {
    name: 'Anchor Roma Switch Board 8 Module',
    description: 'Complete modular switch board with 8 module capacity. Includes plate, box and screws. Suitable for bedroom, hall and kitchen wiring.',
    price: 450,
    originalPrice: 520,
    category: 'Electrical',
    brand: 'Anchor',
    stock: 300,
    unit: 'set',
    rating: 4.3,
    numReviews: 167,
    featured: false,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Switch Board' }],
    specifications: [{ key: 'Modules', value: '8 Module' }, { key: 'Color', value: 'White' }, { key: 'Includes', value: 'Plate + Box' }]
  },
  {
    name: 'Polycab 2.5 sq mm House Wire',
    description: 'ISI certified PVC insulated copper conductor wire for general house wiring. Excellent flexibility and heat resistance up to 70°C.',
    price: 1200,
    originalPrice: 1400,
    category: 'Electrical',
    brand: 'Polycab',
    stock: 180,
    unit: 'roll',
    rating: 4.5,
    numReviews: 289,
    featured: true,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Polycab Wire' }],
    specifications: [{ key: 'Cross Section', value: '2.5 sq mm' }, { key: 'Length', value: '90 meters' }, { key: 'Temp Rating', value: '70°C' }]
  },
  {
    name: 'Havells 4-Way Extension Board',
    description: 'Heavy duty extension board with 4 universal sockets and master switch. 2 meter cord with surge protection. ISI approved.',
    price: 650,
    originalPrice: 750,
    category: 'Electrical',
    brand: 'Havells',
    stock: 120,
    unit: 'piece',
    rating: 4.4,
    numReviews: 534,
    featured: false,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'Extension Board' }],
    specifications: [{ key: 'Sockets', value: '4 Universal' }, { key: 'Cord Length', value: '2 meters' }, { key: 'Protection', value: 'Surge + Overload' }]
  },
  {
    name: 'Siemens 63A RCCB Double Pole',
    description: 'Residual Current Circuit Breaker for earth leakage protection. 63A 30mA sensitivity. Protects against electric shock and fire hazards.',
    price: 1850,
    originalPrice: 2100,
    category: 'Electrical',
    brand: 'Siemens',
    stock: 80,
    unit: 'piece',
    rating: 4.8,
    numReviews: 143,
    featured: true,
    isActive: true,
    images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80', alt: 'RCCB' }],
    specifications: [{ key: 'Current', value: '63A' }, { key: 'Sensitivity', value: '30mA' }, { key: 'Poles', value: 'Double Pole' }]
  }
];

async function seedElectrical() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmart');
    console.log('Connected to MongoDB');
    const result = await Product.insertMany(electricalProducts);
    console.log(`✅ ${result.length} Electrical products added successfully`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.disconnect();
  }
}

seedElectrical();
