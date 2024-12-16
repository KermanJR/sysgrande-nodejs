const mongoose = require('mongoose');
const Expense = require('./Expense');

const terminationExpenseSchema = new mongoose.Schema({
  terminationDate: { type: Date, required: true }, // Data da rescisão
  reason: { 
    type: String, 
    enum: ['Demissão sem justa causa', 'Demissão com justa causa', 'Pedido de demissão', 'Término de contrato', 'Aposentadoria', 'Outros'], 
    required: true 
  }, // Motivo da rescisão
  severancePay: { type: Number, required: true }, // Valor da indenização
  noticePeriod: { type: Number, required: false }, // Período de aviso prévio (em dias)
  remainingVacations: { type: Number, required: false }, // Dias de férias não usufruídos
  FGTSBalance: { type: Number, required: false }, // Saldo do FGTS
  fineFGTS: { type: Number, required: false }, // Multa do FGTS (se aplicável)
  INSSDeduction: { type: Number, required: false }, // Valor deduzido de INSS
  incomeTaxDeduction: { type: Number, required: false }, // Valor deduzido de imposto de renda
  otherDeductions: { type: Number, required: false }, // Outras deduções aplicáveis
  totalAmount: { type: Number, required: true }, // Valor total da rescisão
  paymentDeadline: { type: Date, required: true }, // Prazo para pagamento
});

const TerminationExpense = Expense.discriminator('Termination', terminationExpenseSchema);

module.exports = TerminationExpense;
