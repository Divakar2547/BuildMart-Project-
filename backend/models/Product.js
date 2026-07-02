const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Cement', 'Steel', 'Tools', 'Sand & Aggregate', 'Bricks', 'Pipes & Fittings', 'Paint', 'Electrical']
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'bag', 'ton', 'meter', 'kg', 'liter', 'set', 'roll']
  },
  images: [{
    url: String,
    alt: String
  }],
  specifications: [{
    key: String,
    value: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
