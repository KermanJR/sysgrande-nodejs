const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Usar UUID para criar IDs únicos

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Garante que o id seja único
    default: uuidv4, // Define o UUID como valor padrão para o campo id
  },
  name: { type: String, required: true },  // Nome do objeto
  quantity: { type: Number, required: false },  // Quantidade
  description: { type: String, required: false },  // Descrição do objeto
  serialNumber: { type: String, required: false },  // Número de série
  patrimonyNumber: { type: String, required: false },  // Número de patrimônio
  brand: { type: String, required: false },  // Marca do objeto
  model: { type: String, required: false },  // Modelo do objeto
  condition: { type: String, required: false },  // Estado de conservação (e.g., Novo, Usado, Danificado)
  location: { type: String, required: false },  // Localização (e.g., Matriz, Funcionário)
  regionalCode: { type: Number, required: true },  // Código da regional (e.g., 22 para Três Lagoas)
  observations: { type: String },  // Observações adicionais (opcional)
  createdAt: { type: Date, default: Date.now }  // Data de criação do item
});

module.exports = mongoose.model('Item', itemSchema);
