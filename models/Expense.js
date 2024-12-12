const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseBaseOptions = {
  discriminatorKey: 'type', // Define o campo discriminador
  collection: 'expenses', // Armazena todos no mesmo collection
};

const expenseBaseSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: require('uuid').v4,
  },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: false },
  paymentDate: { type: Date, required: false },
  status: { type: String, enum: ['Pendente', 'Paga', 'Cancelada', 'Atrasada'], default: 'Pendente' },
  description: { type: String },
  employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  company: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
  updatedAt: { type: Date, default: () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
  attachment: { type: String, required: false },
  createdBy: { type: String, required: true}, // Referência ao usuário que criou
  updateBy: { type: String, required: true}
}, expenseBaseOptions);

const Expense = mongoose.model('Expense', expenseBaseSchema);

module.exports = Expense;
