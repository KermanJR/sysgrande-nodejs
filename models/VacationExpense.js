const mongoose = require('mongoose');
const Expense = require('./Expense');

const vacationExpenseSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  holidayValue: { type: Number, required: true },
  additionalPayments: { type: Number },
});

const VacationExpense = Expense.discriminator('Vacation', vacationExpenseSchema);

module.exports = VacationExpense;
