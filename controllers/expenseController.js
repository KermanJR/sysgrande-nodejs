// controllers/expenseController.js
const Expense = require('../models/Expense');

exports.addExpense = (req, res) => {
    // Usando o multer para fazer o upload do arquivo
    upload.single('document')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
      }
  
      const { type, amount, paymentMethod, eventDate, paymentDate, status, description } = req.body;
      const document = req.file ? req.file.path : null;  // Se o arquivo foi enviado, armazene o caminho
  
      try {
        const newExpense = new Expense({
          type,
          amount,
          paymentMethod,
          eventDate,
          paymentDate,
          status,
          description,
          document,
        });
  
        await newExpense.save();
        res.status(201).json(newExpense);
      } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar despesa', error });
      }
    });
  };

// GET: Listar todas as despesas
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar despesas', error });
  }
};

// PUT: Atualizar uma despesa existente
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;

  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      { id },
      { description, amount, date, category },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar despesa', error });
  }
};

// DELETE: Remover uma despesa
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await Expense.findOneAndDelete({ id });

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    res.status(200).json({ message: 'Despesa removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover despesa', error });
  }
};
