const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Usar UUID para criar IDs únicos

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true, // Garante que o id seja único
    default: uuidv4, // Define o UUID como valor padrão para o campo id
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
  role: {
    type: String,
    enum: ['Supervisor', 'Administrador'], // Tipos de usuário
    default: 'Leitor',
  },
}, { timestamps: true });

// Antes de salvar o usuário, criptografar a senha e gerar o ID
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Gerar ID se não existir
  if (!this.id) {
    this.id = uuidv4(); // Gerar um UUID se o ID não for fornecido
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
