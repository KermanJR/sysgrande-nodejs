const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const HistorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: false 
  },
  event: { type: String, required: true }, // Tipo de evento (e.g., "Task Created", "Task Edited") Podemos padronizar isso melhor com o ENUM
  date: { type: Date, default: Date.now }, // Data e hora do evento
  details: {
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Usuário atribuído à tarefa
    old: mongoose.Schema.Types.Mixed,
    new: mongoose.Schema.Types.Mixed,
  },
});

const TaskSchema = new mongoose.Schema(
  
  {
    title: { //Título da tarefa
      type: String,
      required: true,
    },
    id: {
        type: String,
        required: true,
        unique: true, // Garante que o id seja único
        default: uuidv4, // Define o UUID como valor padrão para o campo id
      },
    description: { //Descrição da tarefa
      type: String,
      required: true,
    },
    priority: { //Prioridade da tarefa
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      required: true,
    },
    deadline: { //Prazo para realizar a tarefa
      type: Date,
      required: true,
    },
    notes: { //Anotações sobre a tarefa
      type: String,
    },
    company: { //Empresa em que foi gerada a tarefa
      type: String,
      required: true,
    },
    status: { //Status da tarefa
      type: String,
      enum: ["todo", "inProgress", "review", "done"],
      default: "todo",
    },
    createdBy: { // Aqui devemos associar a tarefa a um usuário do sistema e não a um funcionário (employee)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    history: [HistorySchema], // Histórico de eventos
    assignedTo: [ //Usuário que podemos atribuir a responsabilidade da tarefa através do seu id
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
