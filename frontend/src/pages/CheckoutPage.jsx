import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, Check, Truck, Calendar, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, orderAPI } from '../utils/api';
import { formatPrice } from '../components/common';

const STEPS = [
  { id: 1, label: 'Delivery', icon: MapPin },
  { id: 2, label: 'Review', icon: Package },
  { id: 3, label: 'Payment', icon: CreditCard },
];

function getDeliveryRange() {
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
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return { from: fmt(addBusinessDays(today, 3)), to: fmt(addBusinessDays(today, 6)) };
}

function getShipping(total) {
  if (total >= 5000) return 0;
  if (total >= 2000) return 149;
  if (total >= 500) return 299;
  return 399;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('online');

  const items = cart.items || [];
  const shipping = getShipping(cart.totalAmount);
  const delivery = getDeliveryRange();
  const tax = Math.round(cart.totalAmount * 0.18);
  const grandTotal = cart.totalAmount + shipping + tax;

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    const required = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please enter ${field.replace('_', ' ')}`);
        return false;
      }
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const [qrModal, setQrModal] = useState(null); // { imageUrl, orderId }

  const handleQrPayment = async () => {
    setProcessing(true);
    try {
      const { data } = await paymentAPI.createQrCode({ amount: grandTotal });
      setQrModal({ imageUrl: data.qr.image_url, qrId: data.qr.id, mock: data.qr.mock });
    } catch (err) {
      toast.error('Failed to generate QR code');
    } finally {
      setProcessing(false);
    }
  };

  const handleQrConfirm = async () => {
    const orderItems = items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      image: item.product.images?.[0]?.url,
    }));
    try {
      const { data: orderData } = await orderAPI.createOrder({
        items: orderItems,
        shippingAddress: address,
        paymentInfo: {
          razorpayOrderId: qrModal.qrId,
          razorpayPaymentId: 'pay_qr_' + Date.now(),
          method: 'UPI QR Code',
          status: 'completed',
        },
        itemsTotal: cart.totalAmount,
        shippingCost: shipping,
        tax,
        totalAmount: grandTotal,
      });
      clearCart();
      setQrModal(null);
      toast.success('Order placed successfully!');
      navigate(`/orders/${orderData.order._id}`);
    } catch (err) {
      toast.error('Failed to place order');
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'qr') return handleQrPayment();
    setProcessing(true);
    try {
      // Cash on Delivery
      if (paymentMethod === 'cod') {
        const orderItems = items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url,
        }));
        const { data: orderData } = await orderAPI.createOrder({
          items: orderItems,
          shippingAddress: address,
          paymentInfo: { method: 'Cash on Delivery', status: 'pending' },
          itemsTotal: cart.totalAmount,
          shippingCost: shipping,
          tax,
          totalAmount: grandTotal,
        });
        clearCart();
        toast.success('Order placed! Pay on delivery.');
        navigate(`/orders/${orderData.order._id}`);
        return;
      }

      // EMI
      if (paymentMethod === 'emi') {
        const orderItems = items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url,
        }));
        const { data: orderData } = await orderAPI.createOrder({
          items: orderItems,
          shippingAddress: address,
          paymentInfo: { method: 'EMI', status: 'pending' },
          itemsTotal: cart.totalAmount,
          shippingCost: shipping,
          tax,
          totalAmount: grandTotal,
        });
        clearCart();
        toast.success('EMI order placed! Bank will contact you.');
        navigate(`/orders/${orderData.order._id}`);
        return;
      }

      // Create Razorpay order
      const { data: paymentData } = await paymentAPI.createOrder({ amount: grandTotal, currency: 'INR' });

      if (paymentData.order.mock) {
        // Mock payment for development
        const orderItems = items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images?.[0]?.url,
        }));

        const { data: orderData } = await orderAPI.createOrder({
          items: orderItems,
          shippingAddress: address,
          paymentInfo: {
            razorpayOrderId: paymentData.order.id,
            razorpayPaymentId: 'pay_mock_' + Date.now(),
            method: 'Mock (Development)',
            status: 'completed'
          },
          itemsTotal: cart.totalAmount,
          shippingCost: shipping,
          tax,
          totalAmount: grandTotal,
        });

        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderData.order._id}`);
        return;
      }

      // Real Razorpay
      const options = {
        key: paymentData.key,
        amount: paymentData.order.amount,
        currency: 'INR',
        name: 'BuildMart',
        description: `Order for ${items.length} item(s)`,
        order_id: paymentData.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: { color: '#f97316' },
        handler: async (response) => {
          try {
            const { data: verifyData } = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.verified) {
              const orderItems = items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                price: item.price,
                quantity: item.quantity,
                image: item.product.images?.[0]?.url,
              }));

              const { data: orderData } = await orderAPI.createOrder({
                items: orderItems,
                shippingAddress: address,
                paymentInfo: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  status: 'completed',
                },
                itemsTotal: cart.totalAmount,
                shippingCost: shipping,
                tax,
                totalAmount: grandTotal,
              });

              clearCart();
              toast.success('Payment successful! Order placed.');
              navigate(`/orders/${orderData.order._id}`);
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => { setProcessing(false); toast.error('Payment cancelled'); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-steel-700 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-steel-900 mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 ${step >= s.id ? 'text-primary-600' : 'text-steel-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > s.id ? 'bg-primary-500 text-white' :
                step === s.id ? 'bg-primary-500 text-white' :
                'bg-steel-100 text-steel-500'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${step > s.id ? 'bg-primary-400' : 'bg-steel-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-bold text-steel-800 mb-5 flex items-center gap-2"><MapPin size={18} className="text-primary-500" /> Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'name', label: 'Full Name', placeholder: 'Your full name', span: 'sm:col-span-2' },
                  { name: 'phone', label: 'Phone Number', placeholder: '10-digit mobile number', span: '' },
                  { name: 'street', label: 'Street Address', placeholder: 'House no, Street, Area', span: 'sm:col-span-2' },
                  { name: 'city', label: 'City', placeholder: 'City', span: '' },
                  { name: 'state', label: 'State', placeholder: 'State', span: '' },
                  { name: 'pincode', label: 'Pincode', placeholder: '6-digit PIN', span: '' },
                ].map(field => (
                  <div key={field.name} className={field.span}>
                    <label className="label">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={address[field.name]}
                      onChange={handleAddressChange}
                      placeholder={field.placeholder}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => { if (validateAddress()) setStep(2); }}
                className="btn-primary w-full mt-6"
              >
                Continue to Review
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold text-steel-800 mb-5 flex items-center gap-2"><Package size={18} className="text-primary-500" /> Order Review</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 py-3 border-b border-steel-100 last:border-0">
                    <div className="w-14 h-14 bg-steel-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&q=80'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-steel-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-steel-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-semibold text-steel-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-steel-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-steel-700 mb-1">Delivery to:</p>
                <p className="text-sm text-steel-600">{address.name} • {address.phone}</p>
                <p className="text-sm text-steel-600">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Edit Address</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-bold text-steel-800 mb-5 flex items-center gap-2"><CreditCard size={18} className="text-primary-500" /> Choose Payment Method</h2>

              {/* QR Code Modal */}
              {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-steel-800 flex items-center gap-2"><QrCode size={18} className="text-primary-500" /> Scan & Pay</h3>
                      <button onClick={() => { setQrModal(null); setProcessing(false); }} className="text-steel-400 hover:text-steel-600"><X size={20} /></button>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <img src={qrModal.imageUrl} alt="UPI QR Code" className="w-52 h-52 rounded-xl border border-steel-200" />
                      <p className="text-sm text-steel-600 text-center">Scan with any UPI app<br /><span className="font-semibold text-steel-800">{formatPrice(grandTotal)}</span></p>
                      {qrModal.mock && <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Development mode — click confirm to place order</p>}
                      <div className="flex gap-3 w-full mt-1">
                        <button onClick={() => { setQrModal(null); setProcessing(false); }} className="btn-secondary flex-1 text-sm">Cancel</button>
                        <button onClick={handleQrConfirm} className="btn-primary flex-1 text-sm">I've Paid ✓</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">

                {/* Online Payment */}
                <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50' : 'border-steel-200 hover:border-steel-300'
                }`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 accent-yellow-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-steel-800 flex items-center gap-2"><CreditCard size={16} className="text-yellow-500" /> Online Payment</p>
                    <p className="text-xs text-steel-500 mt-0.5">UPI, Debit/Credit Cards, Net Banking, Wallets via Razorpay</p>
                    {paymentMethod === 'online' && (
                      <div className="flex items-center gap-2 mt-2">
                        {['UPI', 'Visa', 'Mastercard', 'NetBanking'].map(m => (
                          <span key={m} className="text-xs bg-white border border-steel-200 text-steel-600 px-2 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                {/* EMI — only if grandTotal >= 10000 */}
                {grandTotal >= 10000 && (
                  <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    paymentMethod === 'emi' ? 'border-yellow-400 bg-yellow-50' : 'border-steel-200 hover:border-steel-300'
                  }`}>
                    <input type="radio" name="payment" value="emi" checked={paymentMethod === 'emi'} onChange={() => setPaymentMethod('emi')} className="mt-1 accent-yellow-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-steel-800 flex items-center gap-2">
                        <span className="text-base">📅</span> EMI
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>Available above ₹10,000</span>
                      </p>
                      <p className="text-xs text-steel-500 mt-0.5">3, 6, 9, 12 month EMI options via your bank</p>
                      {paymentMethod === 'emi' && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {['3 months', '6 months', '9 months', '12 months'].map(e => (
                            <div key={e} className="text-center text-xs border border-steel-200 rounded-lg py-1.5 px-1 bg-white">
                              <p className="font-semibold text-steel-700">{e}</p>
                              <p className="text-steel-500">₹{Math.round(grandTotal / parseInt(e))/1}×{parseInt(e)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                )}

                {/* QR Code Payment */}
                <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  paymentMethod === 'qr' ? 'border-yellow-400 bg-yellow-50' : 'border-steel-200 hover:border-steel-300'
                }`}>
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="mt-1 accent-yellow-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-steel-800 flex items-center gap-2"><QrCode size={16} className="text-yellow-500" /> Pay via QR Code</p>
                    <p className="text-xs text-steel-500 mt-0.5">Scan with any UPI app — GPay, PhonePe, Paytm, BHIM</p>
                    {paymentMethod === 'qr' && (
                      <div className="flex items-center gap-2 mt-2">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(m => (
                          <span key={m} className="text-xs bg-white border border-steel-200 text-steel-600 px-2 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50' : 'border-steel-200 hover:border-steel-300'
                }`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 accent-yellow-500" />
                  <div>
                    <p className="font-semibold text-steel-800 flex items-center gap-2"><span className="text-base">💵</span> Cash on Delivery</p>
                    <p className="text-xs text-steel-500 mt-0.5">Pay in cash when your order arrives at your doorstep</p>
                  </div>
                </label>

              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <><div className="spinner" /> Processing...</>
                  ) : paymentMethod === 'cod' ? (
                    <>💵 Place Order (COD)</>
                  ) : paymentMethod === 'emi' ? (
                    <>📅 Confirm EMI Order</>
                  ) : paymentMethod === 'qr' ? (
                    <><QrCode size={16} /> Generate QR Code</>
                  ) : (
                    <><CreditCard size={16} /> Pay {formatPrice(grandTotal)}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-bold text-steel-800 mb-4">Price Details</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-steel-600">
              <span>Price ({items.length} items)</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-steel-600">
              <span>Delivery Charge</span>
              {shipping === 0
                ? <span className="text-green-600 font-medium">FREE</span>
                : <span className="text-red-500 font-medium">+{formatPrice(shipping)}</span>}
            </div>
            <div className="flex justify-between text-steel-600">
              <span>GST (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-steel-200 pt-2.5 flex justify-between font-bold text-steel-900">
              <span>Total Amount</span>
              <span className="text-base" style={{ color: '#f59e0b' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Delivery Charge Breakdown */}
          <div className="mt-4 rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-3 py-2" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#374151' }}>
                <Truck size={13} /> Delivery Charge Details
              </p>
            </div>
            <div className="px-3 py-2 space-y-1.5 text-xs">
              {[
                { label: 'Below ₹500', charge: '₹399', active: cart.totalAmount < 500 },
                { label: '₹500 – ₹1,999', charge: '₹299', active: cart.totalAmount >= 500 && cart.totalAmount < 2000 },
                { label: '₹2,000 – ₹4,999', charge: '₹149', active: cart.totalAmount >= 2000 && cart.totalAmount < 5000 },
                { label: '₹5,000 & above', charge: 'FREE', active: cart.totalAmount >= 5000 },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-0.5 px-1 rounded"
                  style={row.active ? { backgroundColor: '#fef3c7' } : {}}>
                  <span style={{ color: row.active ? '#d97706' : '#6b7280', fontWeight: row.active ? 600 : 400 }}>
                    {row.active ? '▶ ' : ''}{row.label}
                  </span>
                  <span style={{ color: row.active ? '#d97706' : '#9ca3af', fontWeight: row.active ? 700 : 400 }}>
                    {row.charge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="mt-3 p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
            <Calendar size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: '#d97706' }}>Estimated Delivery</p>
              <p className="text-xs text-steel-600">{delivery.from} – {delivery.to}</p>
              <p className="text-xs text-steel-500 mt-0.5">3–6 business days</p>
            </div>
          </div>

          {cart.totalAmount < 5000 && (
            <p className="text-xs mt-3 flex items-center gap-1" style={{ color: '#6b7280' }}>
              <Truck size={12} /> Add {formatPrice(5000 - cart.totalAmount)} more for <span className="text-green-600 font-medium ml-1">FREE shipping</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
