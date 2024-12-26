const Municipio = require('../models/Municipio');

exports.createMunicipio = async (req, res) => {
  try {
    // Validação dos dados de entrada
    const { municipioCode, name, codigoRegional } = req.body;
    
    if (!municipioCode || !name || !codigoRegional) {
      return res.status(400).json({ 
        message: 'Todos os campos são obrigatórios: municipioCode, name, codigoRegional' 
      });
    }

    // Verifica se o município já existe
    const municipioExistente = await Municipio.findOne({ municipioCode });
    if (municipioExistente) {
      return res.status(409).json({ 
        message: 'Já existe um município com este código' 
      });
    }

    const newMunicipio = new Municipio({
      municipioCode,
      name,
      codigoRegional
    });

    await newMunicipio.save();
    return res.status(201).json(newMunicipio);
    
  } catch (error) {
    console.error('Erro ao criar município:', error);
    return res.status(500).json({ 
      message: 'Erro ao criar município',
      error: {
        code: error.code,
        message: error.message
      }
    });
  }
};

// Consultar Municípios por código da regional
exports.getMunicipiosByCodigoRegional = async (req, res) => {
  try {
    const { codigoRegional } = req.params;
    
    const municipios = await Municipio.find({ codigoRegional });

    if (municipios.length === 0) {
      return res.status(404).json({ message: 'Nenhum município encontrado para esta regional' });
    }

    return res.status(200).json(municipios);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter municípios', error });
  }
};

// Consultar Municípios por código da regional
exports.getAllMunicipios = async (req, res) => {
    try {
      
      const municipios = await Municipio.find();
  
      if (municipios.length === 0) {
        return res.status(404).json({ message: 'Nenhum município encontrado' });
      }
  
      return res.status(200).json(municipios);
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao obter municípios', error });
    }
  };
  
