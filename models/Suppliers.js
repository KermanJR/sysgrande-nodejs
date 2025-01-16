const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: false,
  },
  number: {
    type: String,
    required: false,
  },
  complement: {
    type: String,
    required: false,
  },
  neighborhood: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  cep: {
    type: String,
    required: false,
  }
});

const suppliersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'Nome do fornecedor é obrigatório']
  },
  contact: {
    type: String,
    required: [false, 'Nome do contato é obrigatório']
  },
 
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  cnpj: {
    type: String,
    required: false
  },
  address: {
    type: addressSchema,
    required: false,
  },
  company: {
    type: String,
    required: [true, 'Empresa é obrigatória']
  },
  createdBy: {
    type: String,
    required: [true, 'Criado por é obrigatório']
  },
  updateBy: {
    type: String,
    required: [true, 'Atualizado por é obrigatório']
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Método para soft delete
suppliersSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Método virtual para verificar se está deletado
suppliersSchema.virtual('isDeleted').get(function() {
  return this.deletedAt !== null;
});

// Query middleware para filtrar registros deletados
suppliersSchema.pre('find', function() {
  this.where({ deletedAt: null });
});

suppliersSchema.pre('findOne', function() {
  this.where({ deletedAt: null });
});

module.exports = mongoose.model('Supplier', suppliersSchema);
