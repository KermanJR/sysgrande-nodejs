const Purchase = require('../models/Purchase');
const upload = require('../config/multer');
const { checkPurchasesManually} = require('../services/purchaseRemindService')
const mongoose = require('mongoose')

exports.createPurchase = (req, res) => {
  upload.single('attachment')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: 'Erro ao fazer upload do arquivo',
        error: err.message
      });
    }

    try {
      const data = req.body;

      // Validate supplier ID
      if (!mongoose.Types.ObjectId.isValid(data.supplier)) {
        return res.status(400).json({
          message: 'ID do fornecedor inválido'
        });
      }

      // Parse items from the request body
      let items = [];
      if (data.items) {
        try {
          items = JSON.parse(data.items);
          // Validate each item
          items.forEach(item => {
            if (!item.name || !item.quantity || !item.unitPrice) {
              throw new Error('Dados dos itens incompletos');
            }
          });
        } catch (error) {
          return res.status(400).json({
            message: 'Formato inválido para items',
            error: error.message
          });
        }
      }

      // Handle installment dates
      if (data.installmentDates && data.installmentDates.length > 0) {
        try {
          if (typeof data.installmentDates === 'string') {
            const parsedDates = JSON.parse(data.installmentDates)
              .map(date => date ? new Date(date) : null)
              .filter(date => date !== null);
            data.installmentDates = parsedDates;
          } else if (Array.isArray(data.installmentDates)) {
            data.installmentDates = data.installmentDates
              .map(date => date ? new Date(date) : null)
              .filter(date => date !== null);
          }
        } catch (error) {
          return res.status(400).json({
            message: 'Formato inválido para installmentDates'
          });
        }
      } else {
        data.installmentDates = [];
      }

      // Convert dates
      if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
      if (data.deliveryDate) data.deliveryDate = new Date(data.deliveryDate);
      if (data.entrancyPaymentDate) data.entrancyPaymentDate = new Date(data.entrancyPaymentDate);

      const newPurchase = new Purchase({
        ...data,
        items,
        supplier: data.supplier,
        attachment: req.file ? req.file.path : null
      });

      await newPurchase.save();

      const populatedPurchase = await Purchase.findById(newPurchase._id)
        .populate('supplier')
        .exec();

      res.status(201).json(populatedPurchase);
    } catch (error) {
      console.error('Error adding purchase:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Erro de validação',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      res.status(500).json({
        message: 'Erro ao adicionar compra',
        error: error.message
      });
    }
  });
};

exports.getPurchases = async (req, res) => {
  const { company } = req.query;

  if (!company) {
    return res.status(400).json({ message: 'O campo "company" é obrigatório na consulta' });
  }

  try {
    const purchases = await Purchase.find({ 
      company,
      deletedAt: null 
    })
    .populate({
      path: 'supplier',
      select: 'name email phone address contact companyName cnpj'
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    const purchasesWithAttachmentUrls = purchases.map(purchase => {
      if (purchase.attachment) {
        purchase.attachment = `${req.protocol}://${req.get('host')}/${purchase.attachment.replace(/\\/g, '/')}`;
      }
      
      return {
        ...purchase,
        formattedPurchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('pt-BR') : null,
        formattedDeliveryDate: purchase.deliveryDate ? new Date(purchase.deliveryDate).toLocaleDateString('pt-BR') : null,
        formattedEntrancyPaymentDate: purchase.entrancyPaymentDate ? new Date(purchase.entrancyPaymentDate).toLocaleDateString('pt-BR') : null
      };
    });

    const response = {
      data: purchasesWithAttachmentUrls,
      total: purchasesWithAttachmentUrls.length,
      page: 1,
      totalPages: 1
    };

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    res.status(500).json({ 
      message: 'Erro ao listar compras', 
      error: error.message 
    });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const oldPurchase = await Purchase.findById(purchaseId);

    if (!oldPurchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const updateData = req.body;
    const changes = [];

    if (updateData.items) {
      try {
        updateData.items = JSON.parse(updateData.items);
        changes.push({
          field: 'items',
          oldValue: oldPurchase.items,
          newValue: updateData.items
        });
      } catch (error) {
        return res.status(400).json({
          message: 'Formato inválido para items',
          error: error.message
        });
      }
    }

    const fieldsToTrack = [
      'purchaseDate', 'supplier', 'amount', 'status',
      'installmentDates', 'description', 'category',
      'entrancyPaymentDate'  // Added new field to track
    ];

    fieldsToTrack.forEach(field => {
      const oldValue = oldPurchase[field];
      const newValue = updateData[field];

      if (newValue && oldValue?.toString() !== newValue?.toString()) {
        changes.push({
          field,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    });

    if (req.file) {
      updateData.attachment = req.file.path;
      changes.push({
        field: 'attachment',
        oldValue: oldPurchase.attachment,
        newValue: req.file.path
      });
    }

    if (changes.length > 0) {
      const historyEntry = {
        action: 'updated',
        user: req.body.updateBy,
        changes,
        timestamp: new Date()
      };

      updateData.history = [...oldPurchase.history, historyEntry];
    }

    if (updateData.installmentDates != null) {
      try {
        const parsedDates = JSON.parse(updateData.installmentDates);
        updateData.installmentDates = parsedDates
          .map(date => {
            const parsedDate = new Date(date);
            return parsedDate.toString() === 'Invalid Date' ? null : parsedDate;
          })
          .filter(date => date !== null);

        if (updateData.installmentDates.length === 0) {
          updateData.installmentDates = [];
        }
      } catch (parseError) {
        updateData.installmentDates = [];
      }
    }

    // Handle entrancyPaymentDate
    if (updateData.entrancyPaymentDate) {
      updateData.entrancyPaymentDate = new Date(updateData.entrancyPaymentDate);
    }

    updateData.updatedAt = new Date();

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    )
    .populate('supplier')
    .populate('createdBy', 'name');

    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rest of the controller functions remain unchanged
exports.getPurchaseHistory = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const purchase = await Purchase.findById(purchaseId)
      .populate('history.user', 'name')
      .select('history');

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase.history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePurchase = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPurchase = await Purchase.findById(id);

    if (!deletedPurchase) {
      return res.status(404).json({
        message: 'Compra não encontrada ou não pertence à empresa especificada'
      });
    }

    await deletedPurchase.softDelete();
    res.status(200).json({ message: 'Compra removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover compra', error });
  }
};

exports.getPurchasesByPeriod = async (req, res) => {
  try {
    const { startDate, endDate, company } = req.query;
    
    const query = {
      company,
      purchaseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const purchases = await Purchase.find(query)
      .populate('supplier')
      .populate('createdBy', 'name email')
      .populate({
        path: 'history.user',
        select: 'name email'
      })
      .sort({ purchaseDate: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchasesBySupplier = async (req, res) => {
  try {
    const { supplier, company } = req.query;
    
    const purchases = await Purchase.find({ 
      company,
      supplier: new RegExp(supplier, 'i')
    })
      .populate('supplier')
      .populate('createdBy', 'name email')
      .populate({
        path: 'history.user',
        select: 'name email'
      })
      .sort({ purchaseDate: -1 });
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Método para verificar notificações manualmente
exports.checkPurchaseReminders = async (req, res) => {
  try {
      await checkPurchasesManually();
      res.json({ 
          success: true, 
          message: 'Verificação de lembretes executada com sucesso' 
      });
  } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Erro ao verificar lembretes',
          error: error.message 
      });
  }
};

exports.getPurchaseNotifications = async (req, res) => {
  try {
      const { id } = req.params;
      const purchase = await Purchase.findById(id)
          .select('notifications items materialType supplier purchaseDate')
          .populate('supplier', 'name');

      if (!purchase) {
          return res.status(404).json({
              success: false,
              message: 'Compra não encontrada'
          });
      }

      res.json({
          success: true,
          data: purchase.notifications,
          purchase: {
              items: purchase.items,
              materialType: purchase.materialType,
              supplier: purchase.supplier,
              purchaseDate: purchase.purchaseDate
          }
      });
  } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({
          success: false,
          message: 'Erro ao buscar notificações',
          error: error.message
      });
  }
};

exports.testEmail = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('supplier');
    if (!purchase) {
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    const emailSent = await sendPurchaseReminderEmail(purchase);
    
    if (emailSent) {
      res.json({ message: 'Email de teste enviado com sucesso' });
    } else {
      res.status(500).json({ message: 'Falha ao enviar email de teste' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao testar email', error: error.message });
  }
};

exports.testEmailGeneric = async (req, res) => {
  try {
      // Email de teste com dados fictícios
      const testPurchase = {
          buyer: "Teste",
          createdBy: "tecadm@sanegrande.com.br", // email que receberá o teste
          items: [
              {
                  name: "Item Teste",
                  quantity: 100,
                  unitPrice: 10.00,
                  totalPrice: 1000.00
              }
          ],
          purchaseDate: new Date(),
          supplier: {
              name: "Fornecedor Teste"
          },
          totalPrice: 1000.00
      };

      const emailSent = await sendPurchaseReminderEmail(testPurchase);

      if (emailSent) {
          res.json({
              success: true,
              message: 'Email de teste genérico enviado com sucesso'
          });
      } else {
          res.status(500).json({
              success: false,
              message: 'Falha ao enviar email de teste'
          });
      }
  } catch (error) {
      console.error('Erro ao testar email:', error);
      res.status(500).json({
          success: false,
          message: 'Erro ao testar email',
          error: error.message
      });
  }
};

// Método para buscar todas as notificações
exports.getAllNotifications = async (req, res) => {
  try {
      const { company, status, startDate, endDate } = req.query;
      
      let query = { deletedAt: null };
      
      if (company) {
          query.company = company;
      }

      if (startDate && endDate) {
          query['notifications.sentAt'] = {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
          };
      }

      const purchases = await Purchase.find(query)
          .select('notifications items materialType supplier purchaseDate company')
          .populate('supplier', 'name')
          .sort({ 'notifications.sentAt': -1 });

      // Filtra e formata as notificações
      const notifications = purchases.reduce((acc, purchase) => {
          const purchaseNotifications = purchase.notifications
              .filter(notification => !status || notification.status === status)
              .map(notification => ({
                  ...notification.toObject(),
                  purchaseId: purchase._id,
                  materialType: purchase.materialType,
                  supplier: purchase.supplier,
                  company: purchase.company,
                  items: purchase.items
              }));
          return [...acc, ...purchaseNotifications];
      }, []);

      res.json({
          success: true,
          total: notifications.length,
          data: notifications
      });
  } catch (error) {
      console.error('Erro ao buscar todas as notificações:', error);
      res.status(500).json({
          success: false,
          message: 'Erro ao buscar todas as notificações',
          error: error.message
      });
  }
};
