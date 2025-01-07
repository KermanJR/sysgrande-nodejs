const Expense = require("../models/Expense");
const upload = require("../config/multer");
const VacationExpense = require("../models/VacationExpense");
const TerminationExpense = require("../models/TerminationExpense");

exports.addExpense = (req, res) => {
  upload.single("attachment")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Erro ao fazer upload do arquivo",
        error: err.message,
      });
    }

    try {
      const data = req.body;
      
      // Create initial history entry for creation
      const initialHistory = {
        action: 'created',
        user: data.createdBy, // This should be the user's ID
        changes: [],
        timestamp: new Date()
      };

      let newExpense;
      if (data.type === "Termination") {
        newExpense = new TerminationExpense({
          ...data,
          history: [initialHistory],
          attachment: req.file ? req.file.path : null
        });
      }

      await newExpense.save();

      // Populate necessary fields
      const populatedExpense = await TerminationExpense.findById(newExpense._id)
        .populate('employee')
        .populate('createdBy', 'name')
        .populate({
          path: 'history.user',
          select: 'name email'
        });

      res.status(201).json(populatedExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ message: "Erro ao adicionar despesa", error });
    }
  });
};

exports.getExpenses = async (req, res) => {
  const { company } = req.query;

  if (!company) {
    return res
      .status(400)
      .json({ message: 'O campo "company" é obrigatório na consulta' });
  }

  try {
    const expenses = await Expense.find({ company })
      .populate({
        path: 'employee',
        populate: [
          { path: 'codigoRegional', select: 'codigo name' },
          { path: 'codigoMunicipio', select: 'codigo name' },
          { path: 'codigoLocal', select: 'codigo name' },
        ]
      })
      .populate('createdBy', 'name email')
      .populate({
        path: 'history.user',
        select: 'name email'
      })
      .exec();

    const expensesWithAttachmentUrls = expenses.map((expense) => {
      if (expense.attachment) {
        expense.attachment = `${req.protocol}://${req.get(
          "host"
        )}/${expense.attachment.replace(/\\/g, "/")}`;
      }
      return expense;
    });

    res.json(expensesWithAttachmentUrls);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar despesas", error });
  }
};

exports.updateExpense = async (req, res) => {
  try {

    console.log(req.body)
    const terminationId = req.params.id;
    const oldTermination = await TerminationExpense.findById(terminationId);
    
    if (!oldTermination) {
      return res.status(404).json({ error: 'Termination not found' });
    }

    const updateData = req.body;
    const changes = [];

    // Track changes in main fields
    const fieldsToTrack = [
      'terminationDate', 'reason', 'statusSendWarning', 'statusASO',
      'statusPaymentTermination', 'paymentDeadlineTermination', 'status'
    ];

    fieldsToTrack.forEach(field => {
      const oldValue = oldTermination[field];
      const newValue = updateData[field];
      
      if (newValue && oldValue?.toString() !== newValue?.toString()) {
        changes.push({
          field,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    });

    // Create history entry if there are changes
    if (changes.length > 0) {
      const historyEntry = {
        action: 'updated',
        user: req.body.updateBy, // Assuming this is the current user's ID
        changes,
        timestamp: new Date()
      };

      updateData.history = [...oldTermination.history, historyEntry];
    }

    updateData.updatedAt = new Date();

    const updatedTermination = await Expense.findByIdAndUpdate(
      terminationId,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    )
    .populate('employee')
    .populate('createdBy', 'name')
    .populate('history.user', 'name');

    res.json(updatedTermination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTerminationHistory = async (req, res) => {
  try {
    const terminationId = req.params.id;
    const termination = await Expense.findById(terminationId)
      .populate('history.user', 'name')
      .select('history');
      console.log(termination)
    if (!termination) {
      return res.status(404).json({ error: 'Termination not found' });
    }

    res.json(termination.history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar despesa
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await Expense.findOneAndDelete({ id: id });

    if (!deletedExpense) {
      return res.status(404).json({
        message:
          "Despesa não encontrada ou não pertence à empresa especificada",
      });
    }

    res.status(200).json({ message: "Despesa removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover despesa", error });
  }
};
