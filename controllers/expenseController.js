// controllers/expenseController.js
const Expense = require('../models/Expense');
const upload = require('../config/multer');

// Adicionar despesa
exports.addExpense = (req, res) => {
    // Usando o multer para fazer o upload do arquivo
    upload.single('attachment')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
        }

        const { type, amount, paymentMethod, eventDate, paymentDate, status, description, company, createdBy } = req.body;
        const attachment = req.file ? req.file.path : null;  // Se o arquivo foi enviado, armazene o caminho

        // Validar se o campo company foi informado
        if (!company) {
            return res.status(400).json({ message: 'O campo "company" é obrigatório' });
        }

        try {
            const newExpense = new Expense({
                type,
                createdBy,
                amount,
                paymentMethod,
                eventDate,
                paymentDate,
                status,
                description,
                attachment,
                company,  // Campo da empresa
            });

            await newExpense.save();
            res.status(201).json(newExpense);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao adicionar despesa', error });
        }
    });
};

// Listar todas as despesas
exports.getExpenses = async (req, res) => {
    const { company } = req.query;  // A empresa pode vir via query string

    if (!company) {
        return res.status(400).json({ message: 'O campo "company" é obrigatório na consulta' });
    }

    try {
        const expenses = await Expense.find({ company }); // Filtrar despesas pela empresa
        
        //const expenses = await Expense.find();
        // Gerar a URL completa para o campo `attachment`
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

// Atualizar uma despesa existente
exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { description, amount, date, category, company } = req.body;

    // Não deve ser possível mudar a empresa de uma despesa, então você pode validar isso
    if (company) {
        return res.status(400).json({ message: 'Não é possível alterar a empresa de uma despesa' });
    }

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

// Deletar uma despesa
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const { company } = req.query; // Empresa deve vir via query para garantir que a empresa é válida

    if (!company) {
        return res.status(400).json({ message: 'O campo "company" é obrigatório para exclusão' });
    }

    try {
        const deletedExpense = await Expense.findOneAndDelete({ id, company }); // Filtrar pela empresa

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Despesa não encontrada ou não pertence à empresa especificada' });
        }

        res.status(200).json({ message: 'Despesa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover despesa', error });
    }
};
