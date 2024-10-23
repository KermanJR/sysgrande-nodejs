const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Regional = require('../models/Regional');
require('dotenv').config();

// Função de login
const login = async (req, res) => {
  const { email, password, codigoRegional } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se a senha está correta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    // Verificar se o código regional do usuário coincide com o código enviado
    if (user.codigoRegional !== codigoRegional) {
      return res.status(401).json({ message: 'Código regional inválido para o usuário' });
    }

    // Criar token JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role }, // Usando o id personalizado aqui
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Enviar resposta com token e detalhes do usuário
    res.json({
      access_token: token,
      user: {
        id: user.id, // Usando o id personalizado
        name: user.name,
        email: user.email,
        role: user.role,
        codigoRegional: user.codigoRegional, // Retornando o código regional
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};


// Função para obter usuário pelo ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar usuário pelo ID personalizado
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retornar os dados do usuário
    res.json({
      user: {
        id: user.id, // Garantindo que o id personalizado seja retornado
        name: user.name,
        email: user.email,
        role: user.role,
        codigoRegional: user.codigoRegional,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário pelo ID:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Função de registro para cadastrar novos usuários
const register = async (req, res) => {
  const { name, email, password, codigoRegional, role } = req.body;

  try {
    // Verificar se o email já está em uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Criar um novo usuário
    const newUser = new User({
      name,
      email,
      password,
      codigoRegional,
      role,
    });

    // Salvar o usuário no banco de dados
    await newUser.save();

    // Criar token JWT
    const token = jwt.sign(
      { sub: newUser.id, role: newUser.role }, // Usando o id personalizado aqui
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Enviar resposta com token e detalhes do novo usuário
    res.status(201).json({
      access_token: token,
      user: {
        id: newUser.id, // Retornar o id personalizado na resposta
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar novo usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

module.exports = { login, register, getUserById };
