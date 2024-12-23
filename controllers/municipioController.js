const Municipio = require('../models/Municipio');

// Criar um novo Município
exports.createMunicipio = async (req, res) => {
  try {
    const { municipioCode, name, codigoRegional } = req.body;

    const newMunicipio = new Municipio({
      municipioCode,
      name,
      codigoRegional,  // Referência à Regional
    });

    await newMunicipio.save();
    return res.status(201).json(newMunicipio); // Retorna o município criado
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar município', error });
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
  
