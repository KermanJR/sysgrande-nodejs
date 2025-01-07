const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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
  role: {
    type: String,
    enum: ['Supervisor', 'Administrador', 'Leitor'],
    default: 'Leitor',
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: false},

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
