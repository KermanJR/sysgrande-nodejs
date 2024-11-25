const Despesa = require('../models/ExpenseCategory');

// Função para adicionar um tipo de despesa
exports.createDespesa = async (req, res) => {
  const { nome } = req.body;

  try {
    const novaDespesa = new Despesa({ nome });
    await novaDespesa.save();
    res.status(201).json({ id: novaDespesa._id, nome: novaDespesa.nome });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar tipo de despesa', error: err });
  }
};

// Função para listar todos os tipos de despesas
exports.getDespesas = async (req, res) => {
  try {
    const despesas = await Despesa.find();
    res.status(200).json(despesas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar tipos de despesa', error: err });
  }
};
