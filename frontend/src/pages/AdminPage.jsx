import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp,
  Plus, RefreshCw, Edit, Trash2, Eye, Search, ChevronDown, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, productAPI, orderAPI } from '../utils/api';
import { PageLoader, StatusBadge, formatPrice } from '../components/common';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
];

const CATEGORIES = ['Cement', 'Steel', 'Tools', 'Sand & Aggregate', 'Bricks', 'Pipes & Fittings', 'Paint', 'Electrical'];
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', originalPrice: '', category: 'Cement',
    brand: '', stock: '', unit: 'bag', featured: false,
    images: [{ url: '', alt: '' }],
    specifications: [{ key: '', value: '' }]
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        try {
          const { data } = await adminAPI.getDashboard();
          setStats(data.stats || { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] });
        } catch { /* keep default stats */ }
      } else if (activeTab === 'products') {
        try {
          const { data } = await productAPI.getProducts({ limit: 200 });
          setProducts(Array.isArray(data?.products) ? data.products : []);
        } catch (err) {
          setProducts([]);
          toast.error(err.response?.data?.message || 'Unable to load products');
        }
      } else if (activeTab === 'orders') {
        try {
          const { data } = await orderAPI.getAllOrders({ limit: 100 });
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (err) {
          setOrders([]);
          toast.error(err.response?.data?.message || 'Unable to load orders');
        }
      } else if (activeTab === 'users') {
        try {
          const { data } = await adminAPI.getUsers();
          setUsers(Array.isArray(data?.users) ? data.users : []);
        } catch (err) {
          setUsers([]);
          toast.error(err.response?.data?.message || 'Unable to load users');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const seedProducts = async () => {
    const tid = toast.loading('Seeding products...');
    try {
      const { data } = await adminAPI.seedProducts();
      toast.dismiss(tid);
      toast.success(data.message || 'Products seeded!');
      loadData();
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.message || 'Failed to seed products');
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || 'Cement',
        brand: product.brand || '',
        stock: product.stock || '',
        unit: product.unit || 'bag',
        featured: product.featured || false,
        images: product.images?.length ? product.images : [{ url: '', alt: '' }],
        specifications: product.specifications?.length ? product.specifications : [{ key: '', value: '' }],
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '', description: '', price: '', originalPrice: '', category: 'Cement',
        brand: '', stock: '', unit: 'bag', featured: false,
        images: [{ url: '', alt: '' }],
        specifications: [{ key: '', value: '' }]
      });
    }
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.description) {
      toast.error('Name, price, stock and description are required');
      return;
    }
    try {
      const imageUrl = productForm.images[0]?.url?.trim();
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        images: imageUrl ? [{ url: imageUrl, alt: productForm.name }] : [],
        specifications: productForm.specifications.filter(s => s.key && s.value),
      };
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Product created!');
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.deleteProduct(id);
      toast.success('Product deleted');
      loadData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateOrderStatus(orderId, { status });
      toast.success('Order status updated');
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredProducts = (products || []).filter((p) => {
    const searchTerm = (productSearch || '').toLowerCase();
    const name = (p?.name || '').toLowerCase();
    const category = (p?.category || '').toLowerCase();
    return name.includes(searchTerm) || category.includes(searchTerm);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #f59e0b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <LayoutDashboard size={20} className="text-primary-400" />
              <span className="font-bold" style={{ color: '#1f2937' }}>BuildMart <span style={{ color: '#f59e0b' }}>Admin</span></span>
            </div>
            <Link to="/" className="text-sm transition-colors" style={{ color: '#6b7280' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >← Back to Store</Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500'
                    : 'border-transparent hover:text-steel-700'
                }`}
                style={{ color: activeTab === tab.id ? '#f59e0b' : '#6b7280' }}
              >
                <tab.icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? <PageLoader /> : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-500/10 border border-primary-500/20' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10 border border-blue-500/20' },
                    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
                    { label: 'Users', value: stats.totalUsers, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10 border border-green-500/20' },
                  ].map(stat => (
                    <div key={stat.label} className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-steel-500">{stat.label}</span>
                        <div className={`${stat.bg} p-2 rounded-lg`}>
                          <stat.icon size={18} className={stat.color} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-steel-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-steel-900">Recent Orders</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-500 hover:underline">View all</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-steel-500 border-b border-steel-700">
                          <th className="pb-3 font-medium">Order</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-steel-700">
                        {stats.recentOrders?.map(order => (
                          <tr key={order._id} className="hover:bg-steel-700/50">
                            <td className="py-3 font-medium text-steel-200">#{order.orderNumber}</td>
                            <td className="py-3 text-steel-400">{order.user?.name}</td>
                            <td className="py-3 font-medium text-primary-400">{formatPrice(order.totalAmount)}</td>
                            <td className="py-3"><StatusBadge status={order.orderStatus} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-5">
                  <h2 className="font-bold text-steel-900 mb-4">Quick Actions</h2>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => { setActiveTab('products'); setTimeout(openProductModal, 100); }} className="btn-primary flex items-center gap-2 text-sm">
                      <Plus size={16} /> Add Product
                    </button>
                    <button onClick={seedProducts} className="btn-secondary flex items-center gap-2 text-sm">
                      <RefreshCw size={16} /> Seed Sample Products
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="input-field pl-10"
                    />
                  </div>
                  <button onClick={() => openProductModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    <Plus size={16} /> Add Product
                  </button>
                  <button onClick={seedProducts} className="btn-secondary flex items-center gap-2 whitespace-nowrap text-sm">
                    <RefreshCw size={14} /> Seed Products
                  </button>
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-steel-900 border-b border-steel-700">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-semibold text-steel-300">Product</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Category</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Price</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Stock</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-steel-700">
                        {filteredProducts.map(product => (
                          <tr key={product._id} className="hover:bg-steel-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-steel-900 flex-shrink-0">
                                  <img
                                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&q=80'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&q=80'; }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-steel-100 truncate max-w-[200px]">{product.name}</p>
                                  <p className="text-xs text-steel-500">{product.brand}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-steel-400">{product.category}</td>
                            <td className="px-4 py-3 font-medium text-primary-400">{formatPrice(product.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`badge ${product.stock > 10 ? 'bg-green-900/40 text-green-400' : product.stock > 0 ? 'bg-amber-900/40 text-amber-400' : 'bg-red-900/40 text-red-400'}`}>
                                {product.stock} {product.unit}s
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Link to={`/products/${product._id}`} className="p-1.5 text-steel-500 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors">
                                  <Eye size={15} />
                                </Link>
                                <button onClick={() => openProductModal(product)} className="p-1.5 text-steel-500 hover:text-primary-400 hover:bg-primary-900/30 rounded-lg transition-colors">
                                  <Edit size={15} />
                                </button>
                                <button onClick={() => deleteProduct(product._id)} className="p-1.5 text-steel-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12 text-steel-500">
                        <Package size={40} className="mx-auto mb-3 text-steel-700" />
                        <p>No products found. <button onClick={seedProducts} className="text-primary-400 hover:underline">Seed sample products</button></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Filter bar */}
                <div className="flex flex-wrap gap-2">
                  {['All', ...ORDER_STATUSES].map(s => (
                    <button
                      key={s}
                      onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        orderFilter === s
                          ? 'bg-primary-500 text-black'
                          : 'bg-steel-800 text-steel-400 hover:text-white border border-steel-700'
                      }`}
                    >
                      {s} {s === 'All' ? `(${orders.length})` : `(${orders.filter(o => o.orderStatus === s).length})`}
                    </button>
                  ))}
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-steel-900 border-b border-steel-700">
                        <tr className="text-left">
                          <th className="px-4 py-3 font-semibold text-steel-300">Order #</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Customer</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Items</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Total</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Date</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Status</th>
                          <th className="px-4 py-3 font-semibold text-steel-300">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-steel-700">
                        {(orderFilter === 'All' ? orders : orders.filter(o => o.orderStatus === orderFilter)).map(order => (
                          <tr key={order._id} className="hover:bg-steel-700/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-steel-200">#{order.orderNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-steel-200">{order.user?.name}</p>
                              <p className="text-xs text-steel-500">{order.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-steel-400">{order.items?.length} items</td>
                            <td className="px-4 py-3 font-semibold text-primary-400">{formatPrice(order.totalAmount)}</td>
                            <td className="px-4 py-3 text-steel-500 text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
                            <td className="px-4 py-3">
                              <select
                                value={order.orderStatus}
                                onChange={e => updateOrderStatus(order._id, e.target.value)}
                                className="text-xs border border-steel-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-steel-800 text-steel-200"
                              >
                                {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-steel-800">{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="text-center py-12 text-steel-500">
                        <ShoppingBag size={40} className="mx-auto mb-3 text-steel-700" />
                        <p>No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-steel-700">
                  <h2 className="font-bold text-steel-900">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-steel-900 border-b border-steel-700">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-semibold text-steel-300">Name</th>
                        <th className="px-4 py-3 font-semibold text-steel-300">Email</th>
                        <th className="px-4 py-3 font-semibold text-steel-300">Phone</th>
                        <th className="px-4 py-3 font-semibold text-steel-300">Role</th>
                        <th className="px-4 py-3 font-semibold text-steel-300">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-700">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-steel-700/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="font-medium text-steel-200">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-steel-400">{user.email}</td>
                          <td className="px-4 py-3 text-steel-400">{user.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${user.role === 'admin' ? 'bg-purple-900/40 text-purple-400' : 'bg-steel-700 text-steel-400'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-steel-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-4 px-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-steel-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-steel-700">
            <div className="flex items-center justify-between p-6 border-b border-steel-700">
              <h2 className="text-lg font-bold text-steel-100">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-steel-700 rounded-lg transition-colors text-steel-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Product Name *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. UltraTech Cement OPC 53 Grade" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description *</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} placeholder="Describe the product — material, use case, key features..." />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Brand</label>
                  <input type="text" value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} className="input-field" placeholder="e.g. UltraTech" />
                </div>
                <div className="sm:col-span-2 rounded-xl border border-steel-700 bg-steel-900/40 p-4">
                  <div className="mb-3 text-sm font-semibold text-steel-200">Price & Stock</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Selling Price (₹) *</label>
                      <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} className="input-field" placeholder="0" />
                    </div>
                    <div>
                      <label className="label">Original Price (₹)</label>
                      <input type="number" value={productForm.originalPrice} onChange={e => setProductForm(p => ({ ...p, originalPrice: e.target.value }))} className="input-field" placeholder="For discount display" />
                    </div>
                    <div>
                      <label className="label">Stock *</label>
                      <input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} className="input-field" placeholder="0" />
                    </div>
                    <div>
                      <label className="label">Unit</label>
                      <select value={productForm.unit} onChange={e => setProductForm(p => ({ ...p, unit: e.target.value }))} className="input-field">
                        {['piece', 'bag', 'ton', 'meter', 'kg', 'liter', 'set', 'roll'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Image URL</label>
                  <input
                    type="url"
                    value={productForm.images[0]?.url || ''}
                    onChange={e => setProductForm(p => ({ ...p, images: [{ url: e.target.value, alt: p.name }] }))}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  {productForm.images[0]?.url && (
                    <img src={productForm.images[0].url} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg" onError={e => e.target.style.display='none'} />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={e => setProductForm(p => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 text-primary-500 border-steel-300 rounded focus:ring-primary-400"
                    />
                    <span className="text-sm font-medium text-steel-200">Mark as Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Specifications</label>
                  <button
                    type="button"
                    onClick={() => setProductForm(p => ({ ...p, specifications: [...p.specifications, { key: '', value: '' }] }))}
                    className="text-xs text-primary-400 hover:underline"
                  >
                    + Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {productForm.specifications.map((spec, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={e => {
                          const specs = [...productForm.specifications];
                          specs[i] = { ...specs[i], key: e.target.value };
                          setProductForm(p => ({ ...p, specifications: specs }));
                        }}
                        placeholder="Key (e.g. Grade)"
                        className="input-field text-sm py-2"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={e => {
                          const specs = [...productForm.specifications];
                          specs[i] = { ...specs[i], value: e.target.value };
                          setProductForm(p => ({ ...p, specifications: specs }));
                        }}
                        placeholder="Value (e.g. OPC 53)"
                        className="input-field text-sm py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-steel-700">
              <button onClick={() => setShowProductModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveProduct} className="btn-primary flex-1">{editingProduct ? 'Update Product' : 'Create Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
