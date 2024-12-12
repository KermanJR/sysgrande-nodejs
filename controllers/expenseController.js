const Expense = require('../models/Expense');
const upload = require('../config/multer');
const VacationExpense = require('../models/VacationExpense')

// Adicionar despesa
exports.addExpense = (req, res) => {
    upload.single('attachment')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
        }

        const {
            type, amount, paymentMethod, paymentDate, status, description,
            company, createdBy, employee, startDate, endDate,
            holidayValue, additionalPayments, updateBy
        } = req.body;

    

        const attachment = req.file ? req.file.path : null;


        if (!company) {
            return res.status(400).json({ message: 'O campo "company" é obrigatório' });
        }

        try {
            let newExpense;

            if (type == 'Vacation') {
                newExpense = new VacationExpense({
                    type,
                    amount,
                    paymentMethod,
                    paymentDate,
                    status,
                    description,
                    attachment,
                    company,
                    createdBy,
                    employee,
                    startDate,
                    endDate,
                    holidayValue,
                    additionalPayments,
                    updateBy
                });
            } else {
                newExpense = new Expense({
                    type,
                    amount,
                    paymentMethod,
                    paymentDate,
                    status,
                    description,
                    attachment,
                    company,
                    createdBy,
                    employee,
                    updateBy
                });
            }

            await newExpense.save();
            res.status(201).json(newExpense);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao adicionar despesa', error });
        }
    });
};

// Listar todas as despesas
exports.getExpenses = async (req, res) => {
    const { company } = req.query;

    if (!company) {
        return res.status(400).json({ message: 'O campo "company" é obrigatório na consulta' });
    }

    try {
        // Popular tanto 'employee' quanto 'createdBy'
        const expenses = await Expense.find({ company })
            .populate('employee')          // Popula os dados do 'employee'
            .populate('user');        // Popula os dados de 'createdBy'

        const expensesWithAttachmentUrls = expenses.map((expense) => {
            if (expense.attachment) {
                expense.attachment = `${req.protocol}://${req.get('host')}/${expense.attachment.replace(/\\/g, '/')}`;
            }
            return expense;
        });

        res.json(expensesWithAttachmentUrls);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar despesas', error });
    }
};


// Atualizar despesa com suporte a FormData e arquivo
exports.updateExpense = async (req, res) => {
    const { id } = req.params;

    // Processa o upload do arquivo com multer
    upload.single('attachment')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
        }

        // Dados recebidos no corpo da requisição
        const { type, amount, paymentMethod, paymentDate, status, description, 
                company, createdBy, employee, startDate, endDate, 
                holidayValue, additionalPayments, updateBy } = req.body;

        const attachment = req.file ? req.file.path : null; // Se houver um arquivo, usa o caminho

        try {
            // Busca a despesa existente
            const expense = await Expense.findOne({ id: id }).populate("employee");
            if (!expense) {
                return res.status(404).json({ message: "Despesa não encontrada" });
            }

            // Atualiza os campos da despesa com os novos valores
            expense.type = type;
            expense.amount = amount;
            expense.paymentMethod = paymentMethod;
            expense.paymentDate = paymentDate;
            expense.status = status;
            expense.description = description;
            expense.company = company;
            expense.createdBy = createdBy;
            expense.employee = employee;
            expense.startDate = startDate;
            expense.endDate = endDate;
            expense.holidayValue = holidayValue;
            expense.additionalPayments = additionalPayments;
            expense.updateBy = updateBy;

            // Atualiza o campo 'updatedAt' para a data e hora atuais
            expense.updatedAt = Date.now();

            // Se houver um novo arquivo, atualiza o campo 'attachment'
            if (attachment) {
                expense.attachment = attachment;
            }

            // Salva as mudanças no banco de dados
            await expense.save();

            // Retorna a despesa atualizada
            res.status(200).json(expense);
        } catch (error) {
            console.error('Erro ao atualizar despesa:', error);
            res.status(500).json({ message: 'Erro ao atualizar despesa', error });
        }
    });
};


// Deletar despesa
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExpense = await Expense.findOneAndDelete({ id: id });

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada ou não pertence à empresa especificada' });
        }

        res.status(200).json({ message: 'Despesa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover despesa', error });
    }
};
