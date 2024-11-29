const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs únicos

const employeeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4, // Gerar um UUID único para cada funcionário
  },
  name: {
    type: String,
    required: true, // Nome do funcionário
  },
  
  codigoRegional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regional', // Referência para o modelo Regional
    required: true
  },
  codigoMunicipio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipio', // Referência para o modelo Equipe
    required: true
  },
  company: {
    type: String,
    required: true,
    enum: ['Sanegrande', 'Enterhome'], // Limita os valores possíveis para evitar erros
},
codigoLocal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Local',
    required: true
  },
  codigoEquipe: {
    type: Number,
    required: true
  },
deletedAt: {
    type: Date, // Campo para armazenar a data de exclusão
    default: null,
  },
}, { timestamps: true });

// Você pode adicionar métodos no schema conforme necessário, como uma função de busca
employeeSchema.methods.getEmployeeInfo = function () {
  return `${this.name} - Regional: ${this.codigoRegional}, Equipe: ${this.codigoEquipe}`;
};

module.exports = mongoose.model('Employee', employeeSchema);
