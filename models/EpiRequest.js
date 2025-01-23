// models/Epi.js
const mongoose = require("mongoose");

const epiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Calçado", "Capacete", "Luva", "Óculos", "Uniforme", "Outros"]
  },
  sizes: [{
    type: String,
    required: true
  }],
  description: String,
  validity: {
    type: Number,  // Validity period in months
    required: true
  }
});

module.exports = mongoose.model("Epi", epiSchema);


const epiRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["Pendente", "Aprovado", "Entregue", "Cancelado"],
    default: "Pendente"
  },
  items: [{
    epi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epi",
      required: true
    },
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    reason: {
      type: String,
      required: true,
      enum: ["Primeira Entrega", "Substituição", "Danificado", "Extraviado"]
    }
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  deliveryDate: Date,
  observations: String,
  company: {
    type: String,
    required: true,
    enum: ["Sanegrande", "Enter Home"]
  },
  regional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Regional",
    required: true
  }
});

module.exports = mongoose.model("EpiRequest", epiRequestSchema);