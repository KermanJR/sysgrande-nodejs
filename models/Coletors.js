const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collectorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee",
    required: false 
  },
  mei: {
    type: String,
    required: true,
    unique: true,
  },
  registration: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    default: 'Motorola Moto G34',
  },
  status: {
    type: String,
    enum: ['Ativo', 'Inativo', 'Em Manutenção'],
    default: 'Inativo',
  },
  condition: {
    type: String,
    enum: ['Novo', 'Bom', 'Regular', 'Ruim'],
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  company: {
    type: String,
    required: true,
    enum: ['Sanegrande', 'Enter Home'],
  },
  lastMaintenance: {
    type: Date,
    required: false,
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: false,
    }
  }],
  deletedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('Collector', collectorSchema);