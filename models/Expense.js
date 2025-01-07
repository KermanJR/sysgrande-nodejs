const mongoose = require("mongoose");
const { Schema } = mongoose;

const expenseBaseOptions = {
  discriminatorKey: "type", // Define o campo discriminador
  collection: "expenses", // Armazena todos no mesmo collection
};

const expenseBaseSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: require("uuid").v4,
    },
    amount: { type: Number, required: false },
    paymentMethod: { type: String, required: false },
    paymentDate: { type: Date, required: false },
    status: {
      type: String,
      enum: ["Pendente", "Paga", "Cancelada", "Atrasada"],
      default: "Pendente",
    },
    description: { type: String },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    company: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
    attachment: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Referência ao usuário que criou
    updateBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    history: [{
      action: { 
        type: String, 
        required: true,
        enum: ['created', 'updated']
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      changes: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
      }],
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  expenseBaseOptions
);

const Expense = mongoose.model("Expense", expenseBaseSchema);

module.exports = Expense;
