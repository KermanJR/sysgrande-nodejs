const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const regionalRoutes = require('./routes/regionalRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

// Middleware CORS
app.use(cors()); // Permite todas as origens por padrão

// Middleware para processar o body das requisições
app.use(bodyParser.json());

// Rotas
app.use('/api', itemRoutes);
app.use('/api', regionalRoutes);
app.use('/api', authRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
