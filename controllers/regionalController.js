const Regional = require('../models/Regional');

// POST: Adicionar nova regional
exports.addRegional = async (req, res) => {
  const { regionalCode, name } = req.body;

  try {
    const newRegional = new Regional({ regionalCode, name });
    await newRegional.save();
    res.status(201).json(newRegional);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar regional', error });
  }
};

// GET: Listar todas as regionais
exports.getRegionals = async (req, res) => {
  try {
    const regionals = await Regional.find();
    res.json(regionals);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar regionais', error });
  }
};
