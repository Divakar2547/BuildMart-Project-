import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Package, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { PageLoader, formatPrice } from '../components/common';

const CATEGORY_IMAGES = {
  'Cement': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
  'Steel': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&q=80',
  'Tools': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80',
  'Sand & Aggregate': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Bricks': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
  'Paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80',
};

const getDeliveryRange = () => {
  const today = new Date();
  const addBusinessDays = (date, days) => {
    let d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  };
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(addBusinessDays(today, 3))} – ${fmt(addBusinessDays(today, 6))}`;
};

const getDeliveryCharge = (amount) => {
  if (amount >= 5000) return 0;
  if (amount >= 2000) return 149;
  if (amount >= 500) return 299;
  return 399;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productAPI.getProduct(id);
        setProduct(data.product);
      } catch (err) {
        console.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product._id, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl text-steel-600">Product not found</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">Back to Products</Link>
    </div>
  );

  const imageUrl = product.images?.[0]?.url || CATEGORY_IMAGES[product.category] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80';
  const priceValue = Number(product?.price ?? 0);
  const originalPriceValue = Number(product?.originalPrice ?? 0);
  const displayPrice = Number.isFinite(priceValue) && priceValue > 0 ? priceValue : (Number.isFinite(originalPriceValue) && originalPriceValue > 0 ? originalPriceValue : 0);
  const discount = originalPriceValue > 0 && displayPrice > 0 && displayPrice < originalPriceValue ? Math.round((1 - displayPrice / originalPriceValue) * 100) : 0;
  const deliveryRange = getDeliveryRange();
  const deliveryCharge = getDeliveryCharge(displayPrice);
  const descriptionText = product.description || `Premium ${product.name} by ${product.brand || 'BuildMart'} with reliable quality for construction and home improvement needs.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-steel-500 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-steel-700 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-steel-50 rounded-2xl overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = CATEGORY_IMAGES[product.category] || imageUrl; }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">{product.category}</span>
              {product.featured && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">⭐ Featured</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-steel-900 mb-1">{product.name}</h1>
            {product.brand && <p className="text-steel-500 text-sm">by <span className="font-medium text-steel-700">{product.brand}</span></p>}
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className={i <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-steel-200'} />
                ))}
              </div>
              <span className="text-sm font-medium text-steel-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-steel-400">({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="bg-steel-50 rounded-xl p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-steel-900">{formatPrice(displayPrice)}</span>
              <span className="text-steel-500">/ {product.unit}</span>
              {originalPriceValue > 0 && (
                <>
                  <span className="text-steel-400 line-through text-lg">{formatPrice(originalPriceValue)}</span>
                  <span className="text-green-600 font-semibold text-sm">{discount}% off</span>
                </>
              )}
            </div>
            <p className="text-xs text-steel-500 mt-1">Price shown in Indian Rupees (₹). GST will be added at checkout.</p>
          </div>

          {/* Delivery Details */}
          <div className="rounded-xl border border-steel-200 bg-amber-50/70 p-4">
            <h3 className="font-semibold text-steel-800 mb-2">Delivery Details</h3>
            <div className="space-y-2 text-sm text-steel-700">
              <div className="flex items-center justify-between gap-2">
                <span>Estimated delivery</span>
                <span className="font-medium text-steel-900">{deliveryRange}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Delivery charge</span>
                <span className="font-medium text-steel-900">{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
              </div>
              <p className="text-xs text-steel-500">Free delivery on orders above ₹5,000.</p>
            </div>
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            <Package size={16} />
            {product.stock > 0 ? `${product.stock} units in stock` : 'Currently out of stock'}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-steel-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-steel-50 transition-colors text-steel-600"
                >
                  <Minus size={16} />
                </button>
                <span className="px-6 py-3 font-semibold text-steel-800 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 hover:bg-steel-50 transition-colors text-steel-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white active:scale-95'
                }`}
              >
                <ShoppingCart size={18} />
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Info Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Fast Delivery' },
              { icon: Shield, text: 'Quality Assured' },
              { icon: Package, text: 'Bulk Available' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-steel-50 rounded-xl text-center">
                <Icon size={18} className="text-primary-500" />
                <span className="text-xs text-steel-600 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-steel-600 text-sm leading-relaxed">{descriptionText}</p>
          </div>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div>
              <h3 className="font-semibold text-steel-800 mb-3">Specifications</h3>
              <div className="border border-steel-200 rounded-xl overflow-hidden">
                {product.specifications.map((spec, i) => (
                  <div key={i} className={`flex items-center text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-steel-50'}`}>
                    <span className="w-40 px-4 py-3 font-medium text-steel-700 border-r border-steel-200">{spec.key}</span>
                    <span className="px-4 py-3 text-steel-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
