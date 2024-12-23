const Local = require('../models/Local');

// Criar um novo Local
exports.createLocal = async (req, res) => {
  try {
    const { localCode, name, codigoMunicipio } = req.body;

    const newLocal = new Local({
      localCode,
      name,
      codigoMunicipio,  // Referência ao Município
    });

    await newLocal.save();
    return res.status(201).json(newLocal); // Retorna o local criado
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar local', error });
  }
};

// Consultar Locais por código do município
exports.getLocaisByCodigoMunicipio = async (req, res) => {
  try {
    const { codigoMunicipio } = req.params;
    
    const locais = await Local.find({ codigoMunicipio });

    if (locais.length === 0) {
      return res.status(404).json({ message: 'Nenhum local encontrado para este município' });
    }

    return res.status(200).json(locais);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter locais', error });
  }
};

// Consultar Locais por código do município
exports.getAllLocals = async (req, res) => {
    try {
      
      const locais = await Local.find();
  
      if (locais.length === 0) {
        return res.status(404).json({ message: 'Nenhum local encontrado.' });
      }
  
      return res.status(200).json(locais);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao obter locais', error });
    }
  };
