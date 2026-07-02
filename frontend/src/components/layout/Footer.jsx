import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#1f2937', borderTop: '3px solid #f59e0b' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#f59e0b' }}>
                <HardHat size={20} className="text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                Build<span style={{ color: '#f59e0b' }}>Mart</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>
              Your trusted partner for quality construction materials. Building India's future, one project at a time.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#fbbf24' }}>Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Cement', 'Steel', 'Tools', 'Sand & Aggregate', 'Bricks', 'Paint'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`}
                    className="transition-colors"
                    style={{ color: '#d1d5db' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                  >{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#fbbf24' }}>Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[['Home', '/'], ['Products', '/products'], ['My Orders', '/orders'], ['My Cart', '/cart']].map(([label, path]) => (
                <li key={label}>
                  <Link to={path}
                    className="transition-colors"
                    style={{ color: '#d1d5db' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#fbbf24' }}>Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} style={{ color: '#f59e0b' }} />
                <span style={{ color: '#d1d5db' }}>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} style={{ color: '#f59e0b' }} />
                <span style={{ color: '#d1d5db' }}>support@buildmart.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} style={{ color: '#f59e0b', marginTop: '2px' }} />
                <span style={{ color: '#d1d5db' }}>Coimbatore</span>
              </li>
            </ul>
          </div>
        </div>


      </div>
    </footer>
  );
}
