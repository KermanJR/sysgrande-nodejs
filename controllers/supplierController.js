const Suppliers = require('../models/Suppliers');

exports.createSupplier = async (req, res) => {
    try {
      const {
        name,
        cnpj,
        email,
        phone,
        contact,
        company,
        address,
        createdBy,
        updateBy
      } = req.body;

    
  
      // Verificar se o CNPJ já existe
      const existingSupplier = await Suppliers.findOne({ cnpj });
      if (existingSupplier) {
        return res.status(400).json({ message: 'CNPJ já cadastrado no sistema' });
      }
  /*
      // Validar campos obrigatórios
      if (!name || !cnpj || !email || !phone) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
      }
  
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
  
      // Validar formato do CNPJ (apenas números)
      const cnpjRegex = /^\d{14}$/;
      if (!cnpjRegex.test(cnpj.replace(/\D/g, ''))) {
        return res.status(400).json({ message: 'Formato de CNPJ inválido' });
      }
  
      // Validar dados do endereço
      if (!address.street || !address.number || !address.neighborhood || 
          !address.city || !address.state || !address.cep) {
        return res.status(400).json({ message: 'Dados de endereço incompletos' });
      }
  */
      const newSupplier = new Suppliers({
        name,
        cnpj,
        email,
        phone,
        contact,
        company,
        createdBy,
        updateBy,
        address: {
          street: address.street,
          number: address.number,
          complement: address.complement || '',
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          cep: address.cep
        }
      });
  
      await newSupplier.save();
      return res.status(201).json(newSupplier);
  
    } catch (error) {
      console.error('Error creating supplier:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Erro de validação',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      return res.status(500).json({ 
        message: 'Erro ao criar fornecedor', 
        error: error.message 
      });
    }
  };

exports.getSuppliers = async (req, res) => {
  const { company } = req.query;

  if (!company) {
    return res.status(400).json({ message: 'O campo "company" é obrigatório na consulta' });
  }

  try {
    const suppliers = await Suppliers.find({ company })
      .sort({ createdAt: -1 })
      .exec();

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar fornecedores', error });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Suppliers.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar fornecedor', error });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updateData = req.body;

    const updatedSupplier = await Suppliers.findByIdAndUpdate(
      supplierId,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(updatedSupplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Erro de validação',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await Suppliers.findById(id);

    if (!supplier) {
      return res.status(404).json({
        message: 'Fornecedor não encontrado ou não pertence à empresa especificada'
      });
    }

    await supplier.softDelete();
    res.status(200).json({ message: 'Fornecedor removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover fornecedor', error });
  }
};

exports.searchSuppliers = async (req, res) => {
  try {
    const { term, company } = req.query;
    
    if (!company) {
      return res.status(400).json({ message: 'O campo "company" é obrigatório na consulta' });
    }

    const query = {
      company,
      supplier: new RegExp(term, 'i')
    };

    const suppliers = await Suppliers.find(query)
      .sort({ supplier: 1 });
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};