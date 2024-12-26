const mongoose = require('mongoose');
const Municipio = require('./Municipio'); // Importa o modelo de Município

const LocalSchema = new mongoose.Schema({
  localCode: { 
    type: Number, 
    required: true, 
  },
  name: { 
    type: String, 
    required: true 
  },
  codigoMunicipio: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Municipio', 
    required: true 
  }
});

module.exports = mongoose.model('Local', LocalSchema);

