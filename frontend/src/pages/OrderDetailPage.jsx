import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, CheckCircle, Truck, Clock, ShoppingBag, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../utils/api';
import { PageLoader, StatusBadge, formatPrice } from '../components/common';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Processing: Package,
  Shipped: Truck,
  Delivered: ShoppingBag,
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getOrder(id);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to fetch order');
        toast.error(err.response?.data?.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <Package size={48} className="text-steel-300 mx-auto mb-4" />
      <h2 className="text-xl text-steel-700 mb-4">Order not found</h2>
      <Link to="/orders" className="btn-primary">My Orders</Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancelOrder(id, { reason: 'Cancelled by customer' });
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel order', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="p-2 rounded-lg hover:bg-steel-100 transition-colors text-steel-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-steel-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-steel-500">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Success Banner */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              {order.orderStatus === 'Delivered' ? 'Order Delivered!' : 'Order Confirmed!'}
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              {order.orderStatus === 'Delivered'
                ? 'Your order has been delivered successfully.'
                : 'Your order has been placed and payment received.'}
            </p>
          </div>
        </div>
      )}

      {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="btn-secondary ml-auto px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}

      {/* Order Status Tracker */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="card p-6 mb-5">
          <h2 className="font-bold text-steel-800 mb-6">Order Status</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-steel-200">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between relative">
              {STATUS_STEPS.map((status, i) => {
                const Icon = STATUS_ICONS[status];
                const isDone = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={status} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                      isDone ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-steel-100 text-steel-400'
                    } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-xs font-medium text-center ${isDone ? 'text-primary-600' : 'text-steel-400'}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Delivery Address */}
        <div className="card p-5">
          <h2 className="font-bold text-steel-800 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-primary-500" /> Delivery Address
          </h2>
          <div className="text-sm text-steel-600 space-y-1">
            <p className="font-semibold text-steel-800">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>PIN: {order.shippingAddress.pincode}</p>
            <p className="text-steel-500">📞 {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="card p-5">
          <h2 className="font-bold text-steel-800 mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-primary-500" /> Payment Info
          </h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-steel-600">
              <span>Status</span>
              <span className={`font-medium ${order.paymentInfo?.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                {order.paymentInfo?.status === 'completed' ? '✓ Paid' : 'Pending'}
              </span>
            </div>
            {order.paymentInfo?.razorpayPaymentId && (
              <div className="flex justify-between text-steel-600">
                <span>Transaction ID</span>
                <span className="text-xs text-steel-500 font-mono truncate max-w-[140px]">{order.paymentInfo.razorpayPaymentId}</span>
              </div>
            )}
            <div className="border-t border-steel-100 pt-2 space-y-1">
              <div className="flex justify-between text-steel-600 text-xs">
                <span>Items</span><span>{formatPrice(order.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-steel-600 text-xs">
                <span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-steel-600 text-xs">
                <span>GST</span><span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-steel-900">
                <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-bold text-steel-800 mb-4 flex items-center gap-2">
          <Package size={16} className="text-primary-500" /> Order Items ({order.items.length})
        </h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-steel-100 last:border-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-steel-50 flex-shrink-0">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-steel-800 text-sm line-clamp-2">{item.name}</p>
                <p className="text-xs text-steel-500 mt-0.5">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-steel-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-steel-800 mb-4">Activity Log</h2>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-primary-500' : 'bg-steel-300'}`} />
                <div>
                  <span className="font-medium text-steel-800">{entry.status}</span>
                  {entry.note && <p className="text-steel-500 text-xs mt-0.5">{entry.note}</p>}
                  <p className="text-xs text-steel-400">
                    {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Link to="/orders" className="btn-secondary flex-1 flex items-center justify-center">
          All Orders
        </Link>
        <Link to="/products" className="btn-primary flex-1 flex items-center justify-center">
          Shop Again
        </Link>
      </div>
    </div>
  );
}
