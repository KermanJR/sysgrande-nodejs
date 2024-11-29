const mongoose = require('mongoose');

const MunicipioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  codigo: {
    type: Number,
    unique: true,
    required: true
  },
  codigoRegional: {
    type: mongoose.Schema.Types.ObjectId,  // Relacionamento com a tabela de regionais
    ref: 'Regional', // Nome do modelo de Regional
    required: true, // Este campo é obrigatório
  }
});

module.exports = mongoose.model('Municipio', MunicipioSchema);
