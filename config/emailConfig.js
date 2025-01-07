const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro serviço de email
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// utils/emailTemplates.js
const getTaskAssignmentTemplate = (taskData, userData) => {
  return `
    <h2>Nova Tarefa Atribuída</h2>
    <p>Olá ${userData.name},</p>
    <p>Uma nova tarefa foi atribuída a você:</p>
    <ul>
      <li><strong>Título:</strong> ${taskData.title}</li>
      <li><strong>Descrição:</strong> ${taskData.description}</li>
      <li><strong>Prioridade:</strong> ${taskData.priority}</li>
      <li><strong>Prazo:</strong> ${new Date(taskData.deadline).toLocaleDateString()}</li>
    </ul>
    <p>Por favor, acesse o sistema para mais detalhes.</p>
  `;
};