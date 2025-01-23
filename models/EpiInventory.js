// models/EpiInventory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const epiInventorySchema = new mongoose.Schema({
  epi: {
    type: String,
    ref: 'Epi',
    enum: ['Botinas', 'Uniforme', 'Protetor Solar'],
    required: true
  },
  company: {
    type: String,
    required: true,
    enum: ['Sanegrande', 'Enter Home']
  },
 
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
 
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: false,
    min: 0
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Fornecedor é obrigatório']
  },
  notes: String,
  transactions: [{
    type: {
      type: String,
      enum: ['entrada', 'saida'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EpiRequest'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
epiInventorySchema.index({ epi: 1, company: 1, regional: 1, size: 1 });

module.exports = mongoose.model('EpiInventory', epiInventorySchema);