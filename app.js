const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const regionalRoutes = require('./routes/regionalRoutes');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const municipioRoutes = require('./routes/municipioRoutes');  // Importando as rotas de município
const localRoutes = require('./routes/localRoutes'); 
const taskRoutes = require('./routes/taskRoutes'); 

const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Verificar se a pasta de uploads existe, caso contrário, criar
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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
app.use('/api', expenseRoutes);
app.use('/api', employeeRoutes)
app.use('/api', municipioRoutes);  // Registrando a rota de municípios
app.use('/api', localRoutes);  // Registrando a rota de locais
app.use('/api', taskRoutes);  // Registrando a rota de locais

// Servir a pasta de uploads como arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
