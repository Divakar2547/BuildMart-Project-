const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: false,
    default: 0
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

cartSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total, item) => {
    const rawPrice = (item.price !== undefined && item.price !== null) ? item.price : (item.product && item.product.price) || 0;
    const price = Number(rawPrice);
    const qty = Number(item.quantity) || 0;
    const line = (Number.isNaN(price) ? 0 : price) * (Number.isNaN(qty) ? 0 : qty);
    return total + line;
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
