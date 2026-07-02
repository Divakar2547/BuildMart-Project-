import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, HardHat, LogOut, Package, LayoutDashboard, ChevronDown, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  return (
    <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #f59e0b' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#f59e0b' }}>
              <HardHat size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#1f2937' }}>
              Build<span style={{ color: '#f59e0b' }}>Mart</span>
            </span>
          </Link>

          {/* Back Button */}
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mr-1"
              style={{ color: '#4b5563', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#d97706'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#4b5563'; }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}

          {/* Nav Links — Desktop */}
          <div className="hidden md:flex items-center gap-1 mx-4">
            <Link to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: location.pathname === '/' ? '#f59e0b' : '#4b5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/' ? '#f59e0b' : '#4b5563'}
            >
              <Home size={15} /> Home
            </Link>
            <Link to="/products"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: location.pathname === '/products' ? '#f59e0b' : '#4b5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.color = location.pathname === '/products' ? '#f59e0b' : '#4b5563'}
            >
              Products
            </Link>
          </div>

          {/* Search — Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cement, steel, tools..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#1f2937' }}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 rounded-r-xl" style={{ backgroundColor: '#f59e0b' }}>
                <Search size={16} className="text-black" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2.5 rounded-xl transition-colors"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef3c7'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ShoppingCart size={22} style={{ color: '#4b5563' }} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-black text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  style={{ backgroundColor: '#f59e0b' }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef3c7'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black" style={{ backgroundColor: '#f59e0b' }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate" style={{ color: '#4b5563' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: '#9ca3af' }} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl py-1 overflow-hidden"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <p className="text-sm font-semibold" style={{ color: '#1f2937' }}>{user.name}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#4b5563' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.color = '#d97706'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563'; }}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#4b5563' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-red-500 transition-colors"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-black transition-all active:scale-95"
                style={{ backgroundColor: '#f59e0b' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Sign In
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl transition-colors"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {mobileOpen ? <X size={22} style={{ color: '#1f2937' }} /> : <Menu size={22} style={{ color: '#1f2937' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3" style={{ borderTop: '1px solid #f3f4f6' }}>
            <form onSubmit={handleSearch} className="pt-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-14 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#1f2937' }}
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 rounded-r-xl" style={{ backgroundColor: '#f59e0b' }}>
                  <Search size={16} className="text-black" />
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {[['Home', '/'], ['All Products', '/products'], ['Cement', '/products?category=Cement'], ['Steel', '/products?category=Steel'], ['Tools', '/products?category=Tools']].map(([label, path]) => (
                <Link key={label} to={path}
                  className="px-4 py-2.5 text-sm rounded-lg font-medium transition-colors"
                  style={{ color: '#4b5563' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.color = '#d97706'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563'; }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Bar */}
      <div className="hidden md:block" style={{ backgroundColor: '#fffbeb', borderTop: '1px solid #fde68a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-10 overflow-x-auto">
            {['All Products', 'Cement', 'Steel', 'Tools', 'Sand & Aggregate', 'Bricks', 'Pipes & Fittings', 'Paint', 'Electrical'].map(cat => (
              <Link key={cat}
                to={cat === 'All Products' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors"
                style={{ color: '#92400e' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#000000'; e.currentTarget.style.backgroundColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#92400e'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
