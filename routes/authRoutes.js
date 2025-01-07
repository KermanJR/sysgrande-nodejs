// routes/auth.js
const express = require('express');
const { login, register, getUserById, getAllUsers } = require('../controllers/authController');

const router = express.Router();

// POST /api/login
router.post('/login', login);

// Rota para buscar usuário pelo ID
router.get('/user/:id', getUserById);

// Rota para buscar todos os usuários
router.get('/user', getAllUsers);

// POST /api/register
router.post('/register', register);

module.exports = router;
