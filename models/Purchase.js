const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema para as notificações
const purchaseNotificationSchema = new Schema({
  type: {
    type: String,
    enum: ['recompra'],
    required: true
  },
  sentAt: {
    type: Date,
    required: true
  },
  nextPurchaseDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  emailTo: {
    type: String,
    required: true
  }
});

// Schema para os itens
const purchaseItemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome do item é obrigatório']
  },
  type: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: [true, 'Quantidade é obrigatória']
  },
  unitPrice: {
    type: Number,
    required: [false, 'Valor unitário é obrigatório']
  },
  totalPrice: {
    type: Number,
    required: [false, 'Valor total é obrigatório']
  }
});

const purchaseSchema = new mongoose.Schema({
  items: {
    type: [purchaseItemSchema],
    required: [true, 'Pelo menos um item é obrigatório'],
    validate: {
      validator: function(items) {
        return items.length > 0;
      },
      message: 'A compra deve ter pelo menos um item'
    }
  },
  materialType: {
    type: String,
    required: [true, 'Tipo de material é obrigatório']
  },
  notifications:{
    type: [purchaseNotificationSchema]
  },
  buyer: {
    type: String,
    required: [true, 'Comprador é obrigatório']
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [false, 'Fornecedor é obrigatório']
  },
  totalPrice: {
    type: Number,
    required: [false, 'Valor total é obrigatório']
  },
  paymentMethod: {
    type: String,
    required: false,
    enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'PIX', 'Entrada + Pix Parcelas', 'Entrada + Boleto Parcelas']
  },
  installments: {
    type: Number,
    default: 1,
    required: false
  },
  installmentValue: {
    type: Number,
    required: false
  },
  installmentDates: [{
    type: Date,
    required: false
  }],
  purchaseDate: {
    type: Date,
    required: false
  },
  deliveryDate: {
    type: Date,
    required: false
  },
  nextPurchaseDate: {
    type: Date,
    required: false
  },

  // Novo campo de recorrência
  recurrence: {
    type: String,
    enum: ['1 Mês', '2 Meses', '3 Meses', 'Semanal', 'Mensal', 'Quinzenal', 'Mediante Necessidade'],
    default: 'Mediante Necessidade',
    required: false
  },
  entrancy: {
    type: Number,
    required: false
  },
  entrancyPaymentDate: {
    type: Date,
    required: false
  },
  attachment: {
    type: String
  },
  company: {
    type: String,
    required: [true, 'Empresa é obrigatória']
  },
  createdBy: {
    type: String,
    required: [true, 'Criado por é obrigatório']
  },
  updatedBy: {
    type: String,
    required: [true, 'Atualizado por é obrigatório']
  },
  deletedAt: {
    type: Date,
    default: null
  },
  history: [{
    action: String,
    user: String,
    changes: [{
      field: String,
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed
    }],
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Middleware para calcular o preço total antes de salvar
purchaseSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalPrice = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
  next();
});

// Métodos existentes
purchaseSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

purchaseSchema.virtual('isDeleted').get(function() {
  return this.deletedAt !== null;
});

purchaseSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

purchaseSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

module.exports = mongoose.model('Purchase', purchaseSchema);