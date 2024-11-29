const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const despesaSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,  // Gera um ID único para a despesa
      },
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Despesa', despesaSchema);
