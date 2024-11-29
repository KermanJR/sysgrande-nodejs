const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const expenseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,  // Gera um ID único para a despesa
    },
    type: {  // Tipo de despesa (ex: alimentação, transporte, etc)
        type: String,
        required: true,
    },
    amount: {  // Valor da despesa
        type: Number,
        required: true,
    },
    paymentMethod: {  // Forma de pagamento (ex: cartão de crédito, boleto, etc)
        type: String,
        required: true,
    },
    eventDate: {  // Data do evento (data em que o evento/despesa ocorreu)
        type: Date,
        required: true,
    },
    paymentDate: {  // Data do pagamento (quando o pagamento foi realizado)
        type: Date,
        required: false,
    },
    status: {  // Situação da despesa (ex: pendente, paga, cancelada)
        type: String,
        required: true,
        enum: ['Pendente', 'Paga', 'Cancelada', 'Atrasada'],  // Valores possíveis para a situação
        default: 'pendente',  // Valor padrão
    },
    description: {  // Descrição detalhada da despesa
        type: String,
        required: true,
    },
    attachment: {  // Campo para o caminho do arquivo (se houver)
        type: String,
        required: false,
    },
    valorEntrada: {
        type: Number
    },
    numParcelas: {
        type: Number
    },
    valorParcelas: {
        type: Number
    },
    createdBy: {  // Nome ou ID do usuário que criou a despesa
        type: String,
        required: true,
    },
    updatedBy: {  // Nome ou ID do usuário que atualizou a despesa
        type: String,
        required: false,
    },
    createdAt: {  // Data de criação
        type: Date,
        default: Date.now,
    },
    updatedAt: {  // Data da última atualização
        type: Date,
        default: null,  // Valor padrão, para indicar que não foi atualizado ainda
    },
    company: {
        type: String,
        required: true,
        enum: ['Sanegrande', 'Enterhome'], // Limita os valores possíveis para evitar erros
    },
    
});

// Middleware para atualizar `updatedAt` automaticamente antes de salvar alterações
expenseSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Expense', expenseSchema);
