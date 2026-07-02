 import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../utils/api';
import { PageLoader, StatusBadge, formatPrice } from '../components/common';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderAPI.getMyOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to fetch orders');
        toast.error(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      const { data } = await orderAPI.cancelOrder(orderId, { reason: 'Cancelled by customer' });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data.order : order)));
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel order', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={24} className="text-primary-500" />
        <h1 className="text-2xl font-bold text-steel-900">My Orders</h1>
        <span className="badge bg-steel-100 text-steel-600 ml-1">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={56} className="text-steel-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-steel-700 mb-2">No orders yet</h3>
          <p className="text-steel-500 mb-6">When you place orders, they'll appear here</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow group"
            >
              {/* Order thumbnail grid */}
              <div className="flex -space-x-2 flex-shrink-0">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white bg-steel-100" style={{ zIndex: 3 - i }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'; }}
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-xl border-2 border-white bg-steel-100 flex items-center justify-center text-xs font-bold text-steel-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-steel-900 text-sm">#{order.orderNumber}</span>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <p className="text-xs text-steel-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-steel-900">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-steel-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-sm text-steel-600 mt-2 line-clamp-1">
                  {order.items.map(i => i.name).join(', ')}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-primary-600 text-xs font-medium hover:underline flex items-center gap-1"
                  >
                    View details <ChevronRight size={14} />
                  </Link>
                  {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelOrder(order._id);
                      }}
                      disabled={cancellingOrderId === order._id}
                      className="btn-secondary text-xs px-3 py-1 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
