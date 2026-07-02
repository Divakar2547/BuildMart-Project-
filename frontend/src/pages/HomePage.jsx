import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ArrowRight, Shield, Truck, HeadphonesIcon, Award, HardHat, ChevronRight } from 'lucide-react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { PageLoader } from '../components/common';

const CATEGORIES = [
  { name: 'Cement',          img: 'https://i.pinimg.com/474x/bf/bb/6c/bfbb6c1ef4bd7b7ccc00500458673b7e.jpg?w=300&q=80' },
  { name: 'Steel',           img: 'https://icon2.cleanpng.com/20180424/yqe/avtb5q5w8.webp?w=300&q=80' },
  { name: 'Tools',           img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRniG172LrZjYjqBiz0-R0hwo-IzlKmhOGTqorHc1QOGWAplJzmyerYCA&s=10?w=300&q=80' },
  { name: 'Sand & Aggregate',img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTepmoMdj6oSdDGGrpTNj5rQ7kkgOnfLJ3HVRX4QXR3zKldDRazUSxIUio&s=10?w=300&q=80' },
  { name: 'Bricks',          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXwweTB_bNKqKColJXWLI96qMR3hgls6lTxyPzYRR0WhnDaolYkjfwnnA&s=10?w=300&q=80' },
  { name: 'Paint',           img: 'https://www.badarihardwares.com/cdn/shop/files/AsianPaintsRoyaleLuxuryEmulsionWallPaint-White.jpg?v=1772711427?w=300&q=80' },
  { name: 'Pipes & Fittings',img: 'https://www.tmtplus.co.in/wp-content/uploads/2024/04/cpvc-pipe.jpg?w=300&q=80' },
  { name: 'Electrical',      img: 'https://5.imimg.com/data5/SELLER/Default/2020/8/TJ/KE/CI/35340405/electrical-cable.png?w=300&q=80' },
];

const FEATURES = [
  { icon: Truck,          title: 'Free Delivery',   desc: 'On orders above ₹5,000' },
  { icon: Shield,         title: 'Quality Assured', desc: 'ISI Certified Products' },
  { icon: HeadphonesIcon, title: '24/7 Support',    desc: 'Expert construction advice' },
  { icon: Award,          title: 'Best Prices',     desc: 'Price match guarantee' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productAPI.getProducts({ featured: true, limit: 8 });
        if (data.products?.length > 0) {
          setFeaturedProducts(data.products);
        } else {
          // fallback: show any products
          const { data: all } = await productAPI.getProducts({ limit: 8 });
          setFeaturedProducts(all.products);
        }
      } catch (err) {
        try {
          const { data } = await productAPI.getProducts({ limit: 8 });
          setFeaturedProducts(data.products);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>

      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={{
        backgroundImage: 'url(/images3.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 100%)' }} />
        {/* Bottom gold glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="max-w-2xl flex-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <HardHat size={14} />
              India's #1 Construction Materials Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              Build Strong,{' '}
              <span style={{ color: '#f59e0b' }}>One Block</span>
              <br />at a Time
            </h1>

            {/* Category links */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['All Products','Cement','Steel','Tools','Sand & Aggregate','Bricks','Pipes & Fittings','Paint','Electrical'].map(cat => (
                <Link
                  key={cat}
                  to={cat === 'All Products' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                  className="text-sm font-medium px-3 py-1 rounded-full transition-all"
                  style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.25)'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#fbbf24'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#ffffff'; }}
                >
                  {cat}
                </Link>
              ))}
            </div>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#d1d5db' }}>
              Shop premium construction materials — cement, steel, tools, and more.
              Direct from manufacturers, delivered to your site.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg active:scale-95 text-black"
                style={{ backgroundColor: '#f59e0b' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Explore Materials <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-white"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              >
                View Deals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-10 text-sm" style={{ color: '#6b7280' }}>
              <span><span className="font-bold" style={{ color: '#f59e0b' }}>500+</span> Products</span>
              <span className="w-px h-4" style={{ backgroundColor: '#374151' }} />
              <span><span className="font-bold" style={{ color: '#f59e0b' }}>10k+</span> Orders Delivered</span>
              <span className="w-px h-4" style={{ backgroundColor: '#374151' }} />
              <span><span className="font-bold" style={{ color: '#f59e0b' }}>50+</span> Brands</span>
            </div>
          </div>

          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section style={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}>
                  <Icon size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs" style={{ color: '#d1d5db' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>Shop by Category</h2>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Find the right materials for your project</p>
            </div>
            <Link to="/products"
              className="text-sm font-medium flex items-center gap-1 transition-colors"
              style={{ color: '#f59e0b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
              onMouseLeave={e => e.currentTarget.style.color = '#f59e0b'}
            >
              All categories <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-200"
                style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 16px rgba(245,158,11,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs font-medium leading-tight transition-colors group-hover:text-yellow-600" style={{ color: '#4b5563' }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>Featured Products</h2>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Top picks from our collection</p>
            </div>
            <Link to="/products"
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: '#f59e0b' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
              onMouseLeave={e => e.currentTarget.style.color = '#f59e0b'}
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <PageLoader />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              <p style={{ color: '#4b5563' }}>No products available yet.</p>
              <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Visit the admin panel to seed sample products.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)',
        borderTop: '3px solid #f59e0b',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Start Building Today</h2>
          <p className="text-lg mb-8" style={{ color: '#d1d5db' }}>
            Get the best construction materials at wholesale prices
          </p>
          <Link to="/products"
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 text-black shadow-lg"
            style={{ backgroundColor: '#f59e0b', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbbf24'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            Browse All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
