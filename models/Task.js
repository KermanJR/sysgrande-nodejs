const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Nome do usuário responsável pelo evento
  event: { type: String, required: true }, // Tipo de evento (e.g., "Task Created", "Task Edited")
  date: { type: Date, default: Date.now }, // Data e hora do evento
  details: { type: mongoose.Schema.Types.Mixed, default: {} }, // Informações adicionais (e.g., campo alterado, valor antigo, novo valor)
});

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    deadline: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "inProgress", "review", "done"],
      default: "todo",
    },
    createdBy: {
      type: String,
      required: true,
    },

    history: [HistorySchema], // Histórico de eventos
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
