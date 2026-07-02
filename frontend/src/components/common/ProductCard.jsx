import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Package, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0
}).format(price);

const CATEGORY_IMAGES = {
  'Cement': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  'Steel': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&q=80',
  'Tools': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80',
  'Sand & Aggregate': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'Bricks': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'Paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
  'Pipes & Fittings': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
};

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useCart();
  const navigate = useNavigate();
  const imageUrl = product.images?.[0]?.url || CATEGORY_IMAGES[product.category] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80';
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleBuyNow = async () => {
    await addToCart(product._id);
    navigate('/checkout');
  };

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-200"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(245,158,11,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <Link to={`/products/${product._id}`} className="relative overflow-hidden aspect-[4/3]" style={{ backgroundColor: '#f9fafb' }}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = CATEGORY_IMAGES[product.category] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80'; }}
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 text-black text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#f59e0b' }}>
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <span className="font-semibold text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#1a1a1a', color: '#d1d5db', border: '1px solid #374151' }}>
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            {product.category}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#9ca3af' }}>
              <Star size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-sm mt-1 mb-1 line-clamp-2 leading-snug transition-colors hover:text-yellow-500" style={{ color: '#1f2937' }}>
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="text-xs mb-2" style={{ color: '#6b7280' }}>by {product.brand}</p>
        )}

        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-lg font-bold" style={{ color: '#f59e0b' }}>{formatPrice(product.price)}</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>/ {product.unit}</span>
          {product.originalPrice && (
            <span className="text-xs line-through ml-1" style={{ color: '#4b5563' }}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex items-center text-xs mb-3">
          <span className={`flex items-center gap-1 ${product.stock > 0 ? '' : ''}`}
            style={{ color: product.stock > 0 ? '#4ade80' : '#f87171' }}>
            <Package size={12} />
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0 || cartLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 mb-2"
          style={{
            backgroundColor: product.stock === 0 ? '#e5e7eb' : '#1f2937',
            color: product.stock === 0 ? '#9ca3af' : '#ffffff',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#374151'; }}
          onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#1f2937'; }}
        >
          <Zap size={15} />
          Buy Now
        </button>

        {/* Add to Cart */}
        <button
          onClick={() => addToCart(product._id)}
          disabled={product.stock === 0 || cartLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: product.stock === 0 ? '#e5e7eb' : '#f59e0b',
            color: product.stock === 0 ? '#9ca3af' : '#000000',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#fbbf24'; }}
          onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#f59e0b'; }}
        >
          <ShoppingCart size={15} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
