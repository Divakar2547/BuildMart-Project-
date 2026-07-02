const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, seedProducts } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/seed-products', seedProducts);

module.exports = router;
