// services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  host: 'smtps.uhserver.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Função para verificar a conexão do email
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Conexão com servidor de email estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro na conexão com servidor de email:', error);
    return false;
  }
};


const sendPurchaseReminderEmail = async (purchase) => {
  const emailContent = `
    <h2>Lembrete de Recompra</h2>
    <p>Olá ${purchase.buyer},</p>
    <p>Este é um lembrete para a recompra dos seguintes itens:</p>
    
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Quantidade</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Valor Unitário</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${purchase.items.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">R$ ${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">R$ ${item.totalPrice.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p>Detalhes da compra anterior:</p>
    <ul>
      <li>Data da compra: ${new Date(purchase.purchaseDate).toLocaleDateString()}</li>
      <li>Fornecedor: ${purchase.supplier.name}</li>
      <li>Valor total: R$ ${purchase.totalPrice.toFixed(2)}</li>
    </ul>
  `;

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: 'tecadm@sanegrande.com.br',
      subject: 'Lembrete de Recompra',
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

module.exports = { sendPurchaseReminderEmail, verifyEmailConnection };