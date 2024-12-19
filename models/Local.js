const mongoose = require('mongoose');
const Municipio = require('./Municipio'); // Importa o modelo de Município

const LocalSchema = new mongoose.Schema({
  localCode: { 
    type: Number, 
    required: true, 
    unique: true 
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

const Local = mongoose.model('Local', LocalSchema);
module.exports = Local;
