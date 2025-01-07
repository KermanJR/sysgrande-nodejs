// Configuração do transportador de email
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

 const sendAssignmentEmail = async (userData, taskData) => {
    const emailContent = `
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
  
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: `Nova Tarefa Atribuída: ${taskData.title}`,
        html: emailContent
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  };

  module.exports = {
    sendAssignmentEmail
  }