import React from 'react';
import { AlertCircle, Loader } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`animate-spin rounded-full border-2 border-steel-300 border-t-primary-500 ${sizes[size]} ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-sm" style={{ color: '#6b7280' }}>Loading...</p>
    </div>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
      <p className="text-steel-600 mb-4">{message || 'Something went wrong'}</p>
      {onRetry && <button onClick={onRetry} className="btn-primary">Try Again</button>}
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center max-w-sm">
      {Icon && <Icon size={56} className="text-steel-300 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-steel-700 mb-2">{title}</h3>
      <p className="text-steel-500 mb-6">{description}</p>
      {action}
    </div>
  </div>
);

export const StatusBadge = ({ status }) => {
  const styles = {
    Pending:    'bg-amber-100 text-amber-700 border border-amber-200',
    Confirmed:  'bg-blue-100 text-blue-700 border border-blue-200',
    Processing: 'bg-purple-100 text-purple-700 border border-purple-200',
    Shipped:    'bg-indigo-100 text-indigo-700 border border-indigo-200',
    Delivered:  'bg-green-100 text-green-700 border border-green-200',
    Cancelled:  'bg-red-100 text-red-700 border border-red-200',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-steel-100 text-steel-600'}`}>{status}</span>
  );
};

export const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0
}).format(price);
