const mongoose = require('mongoose');
const { Schema } = mongoose;
const purchaseSchema = new mongoose.Schema({
  materialType: {
    type: String,
    required: [true, 'Tipo de material é obrigatório']
  },
  buyer: {
    type: String,
    required: [true, 'Tipo de material é obrigatório']
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Fornecedor é obrigatório']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantidade é obrigatória']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Valor unitário é obrigatório']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Valor total é obrigatório']
  },
  paymentMethod: {
    type: String,
    required: [false, 'Forma de pagamento é obrigatória'],
    enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'PIX', 'Entrada + Pix Parcelas', 'Entrada + Boleto Parcelas']
  },
  installments: {
    type: Number,
    default: 1,
    required: false
  },
  installmentValue: {
    type: Number,
    required: [false, 'Valor da parcela é obrigatório']
  },
  installmentDates: [{
    type: Date,
    required: [false, 'Data da parcela é obrigatória']
  }],
  purchaseDate: {
    type: Date,
    required: [false, 'Data da compra é obrigatória']
  },
  deliveryDate: {
    type: Date,
    required: [false, 'Data de entrega é obrigatória']
  },
  entrancy:{
    type: Number,
    required: false
  },
  attachment: {
    type: String // URL do arquivo
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
  }],
}, {
  timestamps: true
});

// Método para soft delete
purchaseSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Método virtual para verificar se está deletado
purchaseSchema.virtual('isDeleted').get(function() {
  return this.deletedAt !== null;
});

// Query middleware para filtrar registros deletados
purchaseSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

purchaseSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

module.exports = mongoose.model('Purchase', purchaseSchema);
