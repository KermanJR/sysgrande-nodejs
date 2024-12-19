const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Para gerar IDs únicos

const employeeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4, // Gerar um UUID único para cada funcionário
    },
    name: {
      type: String,
      required: true, // Nome do funcionário
    },
    position: {
      type: String,
      required: true, // Nome do funcionário
    },
    status: {
      type: String,
      enum: ["Ativo", "Inativo", "Afastado"],
      default: "Inativo",
    },
    codigoRegional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Regional", // Referência para o modelo Regional
      required: true,
    },
    codigoMunicipio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipio", // Referência para o modelo Equipe
      required: true,
    },

    company: {
      type: String,
      required: true,
      enum: ["Sanegrande", "Enter Home"], // Limita os valores possíveis para evitar erros
    },
    codigoLocal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Local",
      required: true,
    },
    codigoEquipe: {
      type: Number,
      required: true,
    },
    deletedAt: {
      type: Date, // Campo para armazenar a data de exclusão
      default: null,
    },
    department: {
      type: String,
      required: true, // Nome do departamento do funcionário
    },
    rankings: [
      {
        mes: {
          type: String, // Mês da avaliação (ex: "Janeiro", "Fevereiro")
          required: true,
        },
        ano: {
          type: Number, // Ano da avaliação
          required: true,
        },
        nota: {
          type: Number, // Nota atribuída
          required: true,
          min: 0,
          max: 10, // Limita as notas entre 0 e 10
        },
        observacao: {
          type: String, // Comentários adicionais
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

// Você pode adicionar métodos no schema conforme necessário, como uma função de busca
employeeSchema.methods.getEmployeeInfo = function () {
  return `${this.name} - Regional: ${this.codigoRegional}, Equipe: ${this.codigoEquipe}`;
};

// Método para adicionar uma avaliação ao histórico
employeeSchema.methods.addAvaliacao = function (
  mes,
  ano,
  nota,
  observacao = ""
) {
  this.avaliacoes.push({ mes, ano, nota, observacao });
  return this.save();
};

module.exports = mongoose.model("Employee", employeeSchema);
