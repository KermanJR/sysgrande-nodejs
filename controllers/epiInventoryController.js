// controllers/epiInventoryController.js
const EpiInventory = require('../models/EpiInventory');
const EpiRequest = require('../models/EpiRequest');

exports.addToInventory = async (req, res) => {
  try {
    const {
      epi,           // Name of the EPI (Botinas, Uniformes, Protetor Solar)
      company,       // Company name
      size,          // Size if applicable
      quantity,      // Quantity being added
      minQuantity,   // Minimum quantity threshold
      pricePerUnit,  // Price per unit
      supplier,      // Supplier ID
      notes,        // Additional notes
      createdBy,    // User who created
      updatedBy     // User who updated
      ,totalPrice
    } = req.body;

    console.log(req.body)

    // Validate required fields
    if (!epi || !company || !quantity || !pricePerUnit || !supplier) {
      return res.status(400).json({
        message: 'Campos obrigatórios faltando'
      });
    }

    // Check if inventory item already exists with same characteristics
    let inventory = await EpiInventory.findOne({
      epi,
      company,
      size: size || null,
      supplier
    });

    if (inventory) {
      // Update existing inventory
      inventory.quantity = Number(inventory.quantity) + Number(quantity);
      inventory.pricePerUnit = pricePerUnit;
      inventory.transactions.updatedBy = updatedBy;
      inventory.lastUpdated = new Date();
      inventory.totalPrice = totalPrice
      // Add transaction record
      inventory.transactions.push({
        type: 'entrada',
        quantity: Number(quantity),
        reason: 'Adição ao estoque',
        updatedBy: updatedBy,
        date: new Date()
      });

      await inventory.save();
    } else {
      // Create new inventory item
      inventory = new EpiInventory({
        epi,
        company,
        size,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity) || 5,
        pricePerUnit: Number(pricePerUnit),
        supplier,
        notes,
        createdBy,
        totalPrice,
        updatedBy,
        transactions: [{
          type: 'entrada',
          quantity: Number(quantity),
          reason: 'Estoque inicial',
          updatedBy: createdBy,
          date: new Date()
        }]
      });

      await inventory.save();
    }

    // Populate supplier information before sending response
    await inventory.populate('supplier', 'name');
    
    res.status(201).json(inventory);
  } catch (error) {
    console.error('Error in addToInventory:', error);
    res.status(500).json({ 
      message: 'Erro ao adicionar ao estoque', 
      error: error.message 
    });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const { company, lowStock } = req.query;
    
    let query = {};
    if (company) query.company = company;
    if (lowStock === 'true') {
      query = {
        ...query,
        $expr: { $lte: ['$quantity', '$minQuantity'] }
      };
    }

    const inventory = await EpiInventory.find(query)
      .populate('supplier', 'name')
      .sort('epi');

    res.json(inventory);
  } catch (error) {
    console.error('Error in getInventory:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estoque', 
      error: error.message 
    });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventory = await EpiInventory.findById(id);
    if (!inventory) {
      return res.status(404).json({ 
        message: 'Item não encontrado no estoque' 
      });
    }

    // Track quantity changes
    const oldQuantity = inventory.quantity;
    const newQuantity = Number(updateData.quantity);

    if (newQuantity !== oldQuantity) {
      const quantityDiff = newQuantity - oldQuantity;
      inventory.transactions.push({
        type: quantityDiff > 0 ? 'entrada' : 'saida',
        quantity: Math.abs(quantityDiff),
        reason: 'Ajuste de estoque',
        updatedBy: updateData.updatedBy,
        date: new Date()
      });
    }

    // Update fields
    const updatableFields = [
      'epi',
      'size',
      'quantity',
      'minQuantity',
      'pricePerUnit',
      'supplier',
      'notes',
      'updatedBy'
    ];

    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        inventory[field] = updateData[field];
      }
    });

    inventory.lastUpdated = new Date();
    await inventory.save();

    // Populate supplier information before sending response
    await inventory.populate('supplier', 'name');

    res.json(inventory);
  } catch (error) {
    console.error('Error in updateInventory:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar estoque', 
      error: error.message 
    });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventory = await EpiInventory.findById(id);
    if (!inventory) {
      return res.status(404).json({ 
        message: 'Item não encontrado no estoque' 
      });
    }

    await inventory.remove();
    
    res.json({ 
      message: 'Item removido com sucesso',
      deletedId: id 
    });
  } catch (error) {
    console.error('Error in deleteInventory:', error);
    res.status(500).json({ 
      message: 'Erro ao remover item do estoque', 
      error: error.message 
    });
  }
};