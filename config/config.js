// config/config.js

require('dotenv').config();

const config = {
  // Servidor
  //port: process.env.PORT || 3000,
  //nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  //mongodb: {
   // uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/seu_banco',
  //},

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465', // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM,
  },

  // JWT
  /*jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  // API
  apiUrl: process.env.API_URL,

  // Upload
  uploadDir: process.env.UPLOAD_DIR || 'uploads',*/

  // Notificações
  notifications: {
    reminderDays: 7, // dias antes para notificar
    checkTime: '09:00', // hora para verificar notificações
  },
};

module.exports = config;