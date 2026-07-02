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
      {
        name: 'UltraTech Cement OPC 53 Grade',
        description: 'Premium quality Ordinary Portland Cement for high-strength concrete structures. Ideal for RCC work, bridges, flyovers and industrial construction.',
        price: 380,
        originalPrice: 420,
        category: 'Cement',
        brand: 'UltraTech',
        stock: 500,
        unit: 'bag',
        rating: 4.5,
        numReviews: 234,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'UltraTech Cement' }],
        specifications: [{ key: 'Grade', value: 'OPC 53' }, { key: 'Weight', value: '50 kg' }, { key: 'Setting Time', value: '30 minutes' }]
      },
      {
        name: 'ACC Gold Water Shield Cement',
        description: 'Water-resistant cement with advanced additives. Perfect for foundations, basements, and water tanks. Provides excellent waterproofing.',
        price: 410,
        originalPrice: 450,
        category: 'Cement',
        brand: 'ACC',
        stock: 300,
        unit: 'bag',
        rating: 4.3,
        numReviews: 187,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'ACC Cement' }],
        specifications: [{ key: 'Grade', value: 'PPC' }, { key: 'Weight', value: '50 kg' }]
      },
      {
        name: 'TMT Steel Bar Fe-500D',
        description: 'High-strength TMT (Thermo-Mechanically Treated) steel bars for RCC construction. Superior ductility and weldability. Corrosion resistant.',
        price: 58000,
        originalPrice: 62000,
        category: 'Steel',
        brand: 'TATA Steel',
        stock: 50,
        unit: 'ton',
        rating: 4.7,
        numReviews: 156,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'TMT Steel' }],
        specifications: [{ key: 'Grade', value: 'Fe-500D' }, { key: 'Standard', value: 'IS 1786' }]
      },
      {
        name: 'SAIL TMT Steel Bar 12mm',
        description: 'SAIL (Steel Authority of India) TMT bars with high tensile strength. Ideal for construction of multi-storey buildings and bridges.',
        price: 56000,
        category: 'Steel',
        brand: 'SAIL',
        stock: 75,
        unit: 'ton',
        rating: 4.5,
        numReviews: 98,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'SAIL Steel' }],
        specifications: [{ key: 'Diameter', value: '12mm' }, { key: 'Grade', value: 'Fe-500' }]
      },
      {
        name: 'Professional Concrete Mixer',
        description: 'Heavy-duty electric concrete mixer with 350L drum capacity. Suitable for large construction sites. Durable steel drum with anti-rust coating.',
        price: 45000,
        originalPrice: 52000,
        category: 'Tools',
        brand: 'Bosch',
        stock: 15,
        unit: 'piece',
        rating: 4.4,
        numReviews: 67,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Concrete Mixer' }],
        specifications: [{ key: 'Capacity', value: '350L' }, { key: 'Motor', value: '1.5 HP' }, { key: 'Voltage', value: '220V' }]
      },
      {
        name: 'Heavy Duty Drilling Machine',
        description: 'Professional rotary hammer drill with SDS-plus chuck. Suitable for drilling in concrete, brick and masonry. Variable speed control.',
        price: 8500,
        originalPrice: 9800,
        category: 'Tools',
        brand: 'Bosch',
        stock: 30,
        unit: 'piece',
        rating: 4.6,
        numReviews: 112,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Drill Machine' }],
        specifications: [{ key: 'Chuck Size', value: 'SDS Plus' }, { key: 'Power', value: '800W' }]
      },
      {
        name: 'M-Sand (Manufactured Sand)',
        description: 'High-quality manufactured sand as a substitute for river sand. Consistent gradation, free from impurities. Ideal for plastering and concrete work.',
        price: 1200,
        category: 'Sand & Aggregate',
        brand: 'BuildMart',
        stock: 1000,
        unit: 'ton',
        rating: 4.2,
        numReviews: 89,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'M-Sand' }],
        specifications: [{ key: 'Grade', value: 'Zone II' }, { key: 'FM', value: '2.5-3.5' }]
      },
      {
        name: 'Red Clay Bricks',
        description: 'Premium quality first-class red clay bricks. High compressive strength, uniform size and color. Perfect for all masonry and construction work.',
        price: 8,
        originalPrice: 10,
        category: 'Bricks',
        brand: 'BuildMart',
        stock: 50000,
        unit: 'piece',
        rating: 4.3,
        numReviews: 203,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'Clay Bricks' }],
        specifications: [{ key: 'Size', value: '230x115x76mm' }, { key: 'Strength', value: '>10 MPa' }]
      },
      {
        name: 'UPVC Plumbing Pipe 4 inch',
        description: 'High-quality UPVC pipes for plumbing and sewage systems. UV resistant, lightweight and durable. Easy to install with solvent cement.',
        price: 450,
        category: 'Pipes & Fittings',
        brand: 'Finolex',
        stock: 200,
        unit: 'meter',
        rating: 4.4,
        numReviews: 76,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'UPVC Pipe' }],
        specifications: [{ key: 'Diameter', value: '4 inch' }, { key: 'Thickness', value: '3.2mm' }]
      },
      {
        name: 'Asian Paints Apex Exterior',
        description: 'Premium exterior emulsion paint with advanced weatherproof technology. Protects from rain, UV rays and algae. Available in 1500+ shades.',
        price: 2800,
        originalPrice: 3200,
        category: 'Paint',
        brand: 'Asian Paints',
        stock: 100,
        unit: 'liter',
        rating: 4.6,
        numReviews: 312,
        featured: true,
        images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', alt: 'Asian Paints' }],
        specifications: [{ key: 'Volume', value: '20L bucket' }, { key: 'Coverage', value: '120-140 sq.ft/L' }]
      },
      {
        name: 'Angle Grinder 4.5 inch',
        description: 'Professional angle grinder for cutting, grinding and polishing. Powerful motor with anti-vibration handle. Safety guard included.',
        price: 3200,
        originalPrice: 3800,
        category: 'Tools',
        brand: 'Makita',
        stock: 45,
        unit: 'piece',
        rating: 4.5,
        numReviews: 145,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', alt: 'Angle Grinder' }],
        specifications: [{ key: 'Disc Size', value: '4.5 inch' }, { key: 'Power', value: '850W' }]
      },
      {
        name: 'Ambuja Plus Cement PPC',
        description: 'Portland Pozzolana Cement with fly ash for energy-efficient construction. Provides better workability and reduces heat of hydration.',
        price: 370,
        category: 'Cement',
        brand: 'Ambuja',
        stock: 400,
        unit: 'bag',
        rating: 4.4,
        numReviews: 178,
        featured: false,
        images: [{ url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', alt: 'Ambuja Cement' }],
        specifications: [{ key: 'Type', value: 'PPC' }, { key: 'Weight', value: '50 kg' }]
      }
    ];

    await Product.deleteMany({});
    const products = await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `${products.length} products seeded`, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
