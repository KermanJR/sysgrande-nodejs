const Purchase = require('../models/Purchase');
const upload = require('../config/multer');
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