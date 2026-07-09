const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: { $ne: false } }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'paymentInfo.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedProducts = async (req, res) => {
  try {
    const sampleProducts = [
      // Cement
      {
        name: 'UltraTech Cement OPC 53 Grade',
        description: 'Premium quality Ordinary Portland Cement for high-strength concrete structures. Ideal for RCC work, bridges, flyovers and industrial construction.',
        price: 395, originalPrice: 430, category: 'Cement', brand: 'UltraTech', stock: 500, unit: 'bag',
        rating: 4.5, numReviews: 234, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'UltraTech Cement' }],
        specifications: [{ key: 'Grade', value: 'OPC 53' }, { key: 'Weight', value: '50 kg' }, { key: 'Setting Time', value: '30 minutes' }]
      },
      {
        name: 'ACC Gold Water Shield Cement',
        description: 'Water-resistant cement with advanced additives. Perfect for foundations, basements, and water tanks. Provides excellent waterproofing.',
        price: 420, originalPrice: 460, category: 'Cement', brand: 'ACC', stock: 300, unit: 'bag',
        rating: 4.3, numReviews: 187, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'ACC Cement' }],
        specifications: [{ key: 'Grade', value: 'PPC' }, { key: 'Weight', value: '50 kg' }]
      },
      {
        name: 'Ambuja Plus Cement PPC',
        description: 'Portland Pozzolana Cement with fly ash for energy-efficient construction. Provides better workability and reduces heat of hydration.',
        price: 385, originalPrice: 415, category: 'Cement', brand: 'Ambuja', stock: 400, unit: 'bag',
        rating: 4.4, numReviews: 178, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'Ambuja Cement' }],
        specifications: [{ key: 'Type', value: 'PPC' }, { key: 'Weight', value: '50 kg' }]
      },
      // Steel
      {
        name: 'TMT Steel Bar Fe-500D',
        description: 'High-strength TMT (Thermo-Mechanically Treated) steel bars for RCC construction. Superior ductility and weldability. Corrosion resistant.',
        price: 62000, originalPrice: 67000, category: 'Steel', brand: 'TATA Steel', stock: 50, unit: 'ton',
        rating: 4.7, numReviews: 156, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400', alt: 'TMT Steel' }],
        specifications: [{ key: 'Grade', value: 'Fe-500D' }, { key: 'Standard', value: 'IS 1786' }]
      },
      {
        name: 'SAIL TMT Steel Bar 12mm',
        description: 'SAIL (Steel Authority of India) TMT bars with high tensile strength. Ideal for construction of multi-storey buildings and bridges.',
        price: 60500, originalPrice: 64000, category: 'Steel', brand: 'SAIL', stock: 75, unit: 'ton',
        rating: 4.5, numReviews: 98, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400', alt: 'SAIL Steel' }],
        specifications: [{ key: 'Diameter', value: '12mm' }, { key: 'Grade', value: 'Fe-500' }]
      },
      // Tools
      {
        name: 'Professional Concrete Mixer',
        description: 'Heavy-duty electric concrete mixer with 350L drum capacity. Suitable for large construction sites. Durable steel drum with anti-rust coating.',
        price: 48500, originalPrice: 55000, category: 'Tools', brand: 'Bosch', stock: 15, unit: 'piece',
        rating: 4.4, numReviews: 67, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Concrete Mixer' }],
        specifications: [{ key: 'Capacity', value: '350L' }, { key: 'Motor', value: '1.5 HP' }, { key: 'Voltage', value: '220V' }]
      },
      {
        name: 'Heavy Duty Drilling Machine',
        description: 'Professional rotary hammer drill with SDS-plus chuck. Suitable for drilling in concrete, brick and masonry. Variable speed control.',
        price: 9200, originalPrice: 10500, category: 'Tools', brand: 'Bosch', stock: 30, unit: 'piece',
        rating: 4.6, numReviews: 112, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Drill Machine' }],
        specifications: [{ key: 'Chuck Size', value: 'SDS Plus' }, { key: 'Power', value: '800W' }]
      },
      {
        name: 'Angle Grinder 4.5 inch',
        description: 'Professional angle grinder for cutting, grinding and polishing. Powerful motor with anti-vibration handle. Safety guard included.',
        price: 3800, originalPrice: 4400, category: 'Tools', brand: 'Makita', stock: 45, unit: 'piece',
        rating: 4.5, numReviews: 145, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Angle Grinder' }],
        specifications: [{ key: 'Disc Size', value: '4.5 inch' }, { key: 'Power', value: '850W' }]
      },
      // Sand & Aggregate
      {
        name: 'M-Sand (Manufactured Sand)',
        description: 'High-quality manufactured sand as a substitute for river sand. Consistent gradation, free from impurities. Ideal for plastering and concrete work.',
        price: 1450, originalPrice: 1600, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 1000, unit: 'ton',
        rating: 4.2, numReviews: 89, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'M-Sand' }],
        specifications: [{ key: 'Grade', value: 'Zone II' }, { key: 'FM', value: '2.5-3.5' }]
      },
      {
        name: 'River Sand (Fine Aggregate)',
        description: 'Natural river sand for plastering and masonry work. Well graded with low silt content. Ideal for smooth finish plastering.',
        price: 1800, originalPrice: 2000, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 800, unit: 'ton',
        rating: 4.1, numReviews: 112, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'River Sand' }],
        specifications: [{ key: 'Grade', value: 'Zone III' }, { key: 'Silt Content', value: '<3%' }]
      },
      {
        name: '20mm Crushed Stone Aggregate',
        description: 'Crushed granite aggregate for concrete mix. Uniform size and shape for consistent concrete strength. Washed and graded.',
        price: 1650, originalPrice: 1850, category: 'Sand & Aggregate', brand: 'BuildMart', stock: 600, unit: 'ton',
        rating: 4.3, numReviews: 94, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'Stone Aggregate' }],
        specifications: [{ key: 'Size', value: '20mm' }, { key: 'Type', value: 'Crushed Granite' }]
      },
      // Bricks
      {
        name: 'Red Clay Bricks',
        description: 'Premium quality first-class red clay bricks. High compressive strength, uniform size and color. Perfect for all masonry and construction work.',
        price: 9, originalPrice: 11, category: 'Bricks', brand: 'BuildMart', stock: 50000, unit: 'piece',
        rating: 4.3, numReviews: 203, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Clay Bricks' }],
        specifications: [{ key: 'Size', value: '230x115x76mm' }, { key: 'Strength', value: '>10 MPa' }]
      },
      {
        name: 'Fly Ash Bricks',
        description: 'Eco-friendly fly ash bricks with high compressive strength. Uniform size, less water absorption. Reduces dead load on structure.',
        price: 7, originalPrice: 9, category: 'Bricks', brand: 'BuildMart', stock: 80000, unit: 'piece',
        rating: 4.4, numReviews: 321, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Fly Ash Bricks' }],
        specifications: [{ key: 'Size', value: '230x110x75mm' }, { key: 'Strength', value: '>7.5 MPa' }]
      },
      {
        name: 'AAC Blocks 600x200x150mm',
        description: 'Autoclaved Aerated Concrete blocks — lightweight, thermally insulating and fire resistant. Reduces construction time significantly.',
        price: 55, originalPrice: 65, category: 'Bricks', brand: 'Siporex', stock: 20000, unit: 'piece',
        rating: 4.5, numReviews: 198, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'AAC Blocks' }],
        specifications: [{ key: 'Size', value: '600x200x150mm' }, { key: 'Density', value: '550-650 kg/m³' }]
      },
      // Pipes & Fittings
      {
        name: 'UPVC Plumbing Pipe 4 inch',
        description: 'High-quality UPVC pipes for plumbing and sewage systems. UV resistant, lightweight and durable. Easy to install with solvent cement.',
        price: 520, originalPrice: 580, category: 'Pipes & Fittings', brand: 'Finolex', stock: 200, unit: 'meter',
        rating: 4.4, numReviews: 76, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'UPVC Pipe' }],
        specifications: [{ key: 'Diameter', value: '4 inch' }, { key: 'Thickness', value: '3.2mm' }]
      },
      {
        name: 'CPVC Hot & Cold Water Pipe 1 inch',
        description: 'Chlorinated PVC pipe for hot and cold water supply. Withstands temperatures up to 93°C. Ideal for bathroom, kitchen and solar water heater connections.',
        price: 320, originalPrice: 380, category: 'Pipes & Fittings', brand: 'Astral', stock: 300, unit: 'meter',
        rating: 4.6, numReviews: 189, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'CPVC Pipe' }],
        specifications: [{ key: 'Diameter', value: '1 inch' }, { key: 'Temp Rating', value: '93°C' }]
      },
      {
        name: 'GI Pipe Medium Class 2 inch',
        description: 'Galvanized Iron pipe for water supply and structural applications. Hot dip galvanized for superior corrosion resistance.',
        price: 850, originalPrice: 950, category: 'Pipes & Fittings', brand: 'Tata Steel', stock: 150, unit: 'meter',
        rating: 4.5, numReviews: 134, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'GI Pipe' }],
        specifications: [{ key: 'Diameter', value: '2 inch' }, { key: 'Class', value: 'Medium' }]
      },
      {
        name: 'SWR Drainage Pipe 6 inch',
        description: 'Soil Waste and Rain water pipe for drainage and sewage systems. UV stabilized for outdoor use.',
        price: 680, originalPrice: 780, category: 'Pipes & Fittings', brand: 'Finolex', stock: 200, unit: 'meter',
        rating: 4.4, numReviews: 156, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'SWR Pipe' }],
        specifications: [{ key: 'Diameter', value: '6 inch' }, { key: 'Type', value: 'SWR' }]
      },
      // Paint
      {
        name: 'Asian Paints Apex Exterior',
        description: 'Premium exterior emulsion paint with advanced weatherproof technology. Protects from rain, UV rays and algae. Available in 1500+ shades.',
        price: 3150, originalPrice: 3600, category: 'Paint', brand: 'Asian Paints', stock: 100, unit: 'liter',
        rating: 4.6, numReviews: 312, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', alt: 'Asian Paints' }],
        specifications: [{ key: 'Volume', value: '20L bucket' }, { key: 'Coverage', value: '120-140 sq.ft/L' }]
      },
      {
        name: 'Berger WeatherCoat Anti Dust',
        description: 'Advanced exterior paint with anti-dust technology. Repels dust and dirt, stays cleaner longer. Excellent UV and weather resistance.',
        price: 2850, originalPrice: 3200, category: 'Paint', brand: 'Berger', stock: 80, unit: 'liter',
        rating: 4.4, numReviews: 267, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', alt: 'Berger Paint' }],
        specifications: [{ key: 'Volume', value: '20L' }, { key: 'Coverage', value: '110-130 sq.ft/L' }]
      },
      {
        name: 'Dulux Weathershield Primer',
        description: 'Exterior wall primer for better adhesion and coverage. Alkali resistant formula. Seals porous surfaces before topcoat application.',
        price: 980, originalPrice: 1150, category: 'Paint', brand: 'Dulux', stock: 150, unit: 'liter',
        rating: 4.3, numReviews: 143, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', alt: 'Wall Primer' }],
        specifications: [{ key: 'Volume', value: '10L' }, { key: 'Type', value: 'Alkali Resistant' }]
      },
      // Electrical
      {
        name: 'Havells FR PVC Wire 2.5 sq mm',
        description: 'Flame retardant PVC insulated copper wire for household and industrial wiring. Superior conductivity and heat resistance.',
        price: 1850, originalPrice: 2100, category: 'Electrical', brand: 'Havells', stock: 500, unit: 'roll',
        rating: 4.7, numReviews: 342, featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400', alt: 'Electrical Wire' }],
        specifications: [{ key: 'Size', value: '2.5 sq mm' }, { key: 'Length', value: '90m roll' }, { key: 'Type', value: 'FR PVC' }]
      },
      {
        name: 'Legrand Modular Switch 6A',
        description: 'Premium modular switches with smooth operation and long life. Suitable for all standard modular plates. Fire retardant material.',
        price: 185, originalPrice: 220, category: 'Electrical', brand: 'Legrand', stock: 800, unit: 'piece',
        rating: 4.5, numReviews: 215, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400', alt: 'Modular Switch' }],
        specifications: [{ key: 'Rating', value: '6A 240V' }, { key: 'Type', value: 'One-way' }]
      },
      {
        name: 'Schneider MCB 32A Single Pole',
        description: 'Miniature Circuit Breaker for overload and short circuit protection. Quick trip mechanism for safety. DIN rail mounting.',
        price: 420, originalPrice: 490, category: 'Electrical', brand: 'Schneider', stock: 300, unit: 'piece',
        rating: 4.6, numReviews: 178, featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400', alt: 'MCB' }],
        specifications: [{ key: 'Current', value: '32A' }, { key: 'Poles', value: 'Single' }, { key: 'Breaking Capacity', value: '10kA' }]
      }
    ];

    let seeded = 0;
    for (const p of sampleProducts) {
      await Product.findOneAndUpdate(
        { name: p.name },
        { $setOnInsert: p },
        { upsert: true, new: true }
      );
      seeded++;
    }
    const total = await Product.countDocuments({ isActive: { $ne: false } });
    res.json({ success: true, message: `${seeded} products seeded. Total in DB: ${total}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
