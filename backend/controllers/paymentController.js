const crypto = require('crypto');

// Initialize Razorpay only if credentials are available
let Razorpay;
let razorpay;
try {
  Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.log('Razorpay not configured');
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      // Return mock order for development without Razorpay
      return res.json({
        success: true,
        order: {
          id: 'order_mock_' + Date.now(),
          amount: req.body.amount * 100,
          currency: 'INR',
          mock: true
        },
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
      });
    }

    const { amount, currency = 'INR', notes } = req.body;
    const options = {
      amount: Math.round(amount * 100), // in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Mock payment for development
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      return res.json({ success: true, verified: true, mock: true });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      res.json({ success: true, verified: true });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRazorpayKey = async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock' });
};

exports.createQrCode = async (req, res) => {
  try {
    if (!razorpay) {
      // Mock QR for development — return a placeholder QR image URL
      const upiData = encodeURIComponent(`upi://pay?pa=buildmart@upi&pn=BuildMart&am=${req.body.amount}&cu=INR`);
      return res.json({
        success: true,
        qr: {
          id: 'qr_mock_' + Date.now(),
          image_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${upiData}`,
          mock: true,
        }
      });
    }

    const { amount } = req.body;
    const qr = await razorpay.qrCode.create({
      type: 'upi_qr',
      name: 'BuildMart',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: Math.round(amount * 100),
      description: 'BuildMart Order Payment',
      close_by: Math.floor(Date.now() / 1000) + 900, // 15 min expiry
    });

    res.json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
