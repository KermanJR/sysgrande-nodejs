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

      // Handle installment dates - make it optional
      if (data.installmentDates && data.installmentDates.length > 0) {
        try {
          // Check if it's a string that needs parsing
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
        // If no installment dates provided, set as empty array
        data.installmentDates = [];
      }

      // Convert dates
      if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate);
      if (data.deliveryDate) data.deliveryDate = new Date(data.deliveryDate);

      const newPurchase = new Purchase({
        ...data,
        supplier: data.supplier,
        attachment: req.file ? req.file.path : null
      });

      await newPurchase.save();

      // Populate supplier data before sending response
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
        select: 'name email phone address contact companyName cnpj' // Seleciona os campos que você quer do fornecedor
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean() // Converte para objeto JavaScript puro para melhor performance
      .exec();
  
      // Processar URLs de anexos se necessário
      const purchasesWithAttachmentUrls = purchases.map(purchase => {
        if (purchase.attachment) {
          purchase.attachment = `${req.protocol}://${req.get('host')}/${purchase.attachment.replace(/\\/g, '/')}`;
        }
        
        // Formatação adicional dos dados se necessário
        return {
          ...purchase,
          formattedPurchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString('pt-BR') : null,
          formattedDeliveryDate: purchase.deliveryDate ? new Date(purchase.deliveryDate).toLocaleDateString('pt-BR') : null,
          // Adicione mais formatações se necessário
        };
      });
  
      // Adicionar metadados à resposta se necessário
      const response = {
        data: purchasesWithAttachmentUrls,
        total: purchasesWithAttachmentUrls.length,
        page: 1, // Se implementar paginação
        totalPages: 1 // Se implementar paginação
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
  
      // Track changes in main fields
      const fieldsToTrack = [
        'purchaseDate', 'supplier', 'amount', 'status',
        'installmentDates', 'description', 'category'
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
  
      // Handle file upload if there's a new file
      if (req.file) {
        updateData.attachment = req.file.path;
        changes.push({
          field: 'attachment',
          oldValue: oldPurchase.attachment,
          newValue: req.file.path
        });
      }
  
      // Create history entry if there are changes
      if (changes.length > 0) {
        const historyEntry = {
          action: 'updated',
          user: req.body.updateBy,
          changes,
          timestamp: new Date()
        };
  
        updateData.history = [...oldPurchase.history, historyEntry];
      }
  
      // Handle installment dates with validation
      if (updateData.installmentDates != null) {
        try {
          const parsedDates = JSON.parse(updateData.installmentDates);
          
          // Filter out invalid or empty dates
          updateData.installmentDates = parsedDates
            .map(date => {
              const parsedDate = new Date(date);
              return parsedDate.toString() === 'Invalid Date' ? null : parsedDate;
            })
            .filter(date => date !== null);
  
          // If all dates were invalid, set to empty array
          if (updateData.installmentDates.length === 0) {
            updateData.installmentDates = [];
          }
        } catch (parseError) {
          // If JSON parsing fails, set to empty array
          updateData.installmentDates = [];
        }
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