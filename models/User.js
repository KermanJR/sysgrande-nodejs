const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Employee = require('./Employeer'); // Importando o modelo de funcionários

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  codigoRegional: {
    type: Number,
    required: true,
  },
  codigoEquipe: {
    type: Number,
    required: false,
  },
  role: {
    type: String,
    enum: ['Supervisor', 'Administrador', 'Leitor'],
    default: 'Leitor',
  },
  // Adicionando referência ao funcionário
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Referência ao modelo Employee
    required: false, // Se não for obrigatório
  }
}, { timestamps: true });

// Antes de salvar o usuário, criptografar a senha e gerar o ID
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.id) {
    this.id = uuidv4();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
