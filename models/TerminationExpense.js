const mongoose = require('mongoose');
const Expense = require('./Expense');
const { Schema } = mongoose;

const terminationExpenseSchema = new mongoose.Schema({
  terminationDate: { type: Date, required: true }, // Data da demissão
  reason: { 
    type: String, 
    enum: ['Demissão sem justa causa', 'Demissão com justa causa', 'Pedido de demissão', 'Término de contrato', 'Aposentadoria', 'Baixa Produtividade'], 
    required: true 
  }, // Motivo da rescisão
  severancePay: { type: Number, required: false }, // Valor da indenização
  noticePeriod: { type: Number, required: false }, // Período de aviso prévio (em dias)
  remainingVacations: { type: Number, required: false }, // Dias de férias não usufruídos
  FGTSBalance: { type: Number, required: false }, // Saldo do FGTS
  fineFGTS: { type: Number, required: false }, // Multa do FGTS (se aplicável)
  INSSDeduction: { type: Number, required: false }, // Valor deduzido de INSS
  incomeTaxDeduction: { type: Number, required: false }, // Valor deduzido de imposto de renda
  otherDeductions: { type: Number, required: false }, // Outras deduções aplicáveis
  totalAmount: { type: Number, required: false }, // Valor total da rescisão
  paymentDeadlineTermination: { type: Date, required: true }, // Prazo para pagamento
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  statusSendWarning: { type: String, required: true },
  statusASO: { type: String, required: true },
  statusPaymentTermination: { type: String, required: true },
  
  
});

const TerminationExpense = Expense.discriminator('Termination', terminationExpenseSchema);

module.exports = TerminationExpense;
