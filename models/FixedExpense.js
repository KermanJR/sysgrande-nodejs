const mongoose = require('mongoose');
const Expense = require('./Expense');

const fixedExpenseSchema = new mongoose.Schema({
  recurring: { type: Boolean, default: true },
  dueDate: { type: Date, required: true },
});

const FixedExpense = Expense.discriminator('Fixed', fixedExpenseSchema);

module.exports = FixedExpense;
