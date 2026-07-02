import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { PageLoader } from '../components/common';

const CATEGORIES = ['All', 'Cement', 'Steel', 'Tools', 'Sand & Aggregate', 'Bricks', 'Pipes & Fittings', 'Paint', 'Electrical'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'name', label: 'Name A-Z' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await productAPI.getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== 'newest') params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
          {search ? `Results for "${search}"` : category !== 'All' ? category : 'All Products'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{total} products found</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-40 bg-steel-900 p-6' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0 lg:w-56 lg:flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-semibold text-white">Filters</h2>
            <button onClick={() => setFiltersOpen(false)} className="text-steel-300"><X size={20} /></button>
          </div>

          <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: '#374151' }}>Category</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { updateParam('category', cat); setFiltersOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    (category === cat || (cat === 'All' && !searchParams.get('category')))
                      ? 'font-medium'
                      : ''
                  }`}
                  style={{
                    backgroundColor: (category === cat || (cat === 'All' && !searchParams.get('category'))) ? '#fef3c7' : 'transparent',
                    color: (category === cat || (cat === 'All' && !searchParams.get('category'))) ? '#d97706' : '#4b5563',
                    border: (category === cat || (cat === 'All' && !searchParams.get('category'))) ? '1px solid #fde68a' : '1px solid transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 rounded-xl border px-4 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <button onClick={() => setFiltersOpen(true)} className="lg:hidden flex items-center gap-2 text-sm" style={{ color: '#4b5563' }}>
              <Filter size={16} /> Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal size={16} style={{ color: '#9ca3af' }} />
              <span className="text-sm hidden sm:inline" style={{ color: '#6b7280' }}>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm border-none focus:outline-none font-medium bg-transparent"
                style={{ color: '#1f2937' }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p > 1 ? String(p) : '')}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-500 text-black'
                          : 'bg-steel-800 border border-steel-600 text-steel-300 hover:border-primary-500/50 hover:text-primary-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 rounded-xl border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#374151' }}>No products found</h3>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Try different filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
