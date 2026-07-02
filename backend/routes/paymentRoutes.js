const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, getRazorpayKey, createQrCode } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/key', protect, getRazorpayKey);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/qr-code', protect, createQrCode);

module.exports = router;
