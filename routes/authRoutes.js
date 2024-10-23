// routes/auth.js
const express = require('express');
const { login, register, getUserById} = require('../controllers/authController');

const router = express.Router();

// POST /api/login
router.post('/login', login);

// Rota para buscar usuário pelo ID
router.get('/user/:id', getUserById);

// POST /api/register
router.post('/register', register);

module.exports = router;
