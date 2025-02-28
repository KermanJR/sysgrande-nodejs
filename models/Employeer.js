const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: false,
  },
  number: {
    type: String,
    required: false,
  },
  complement: {
    type: String,
    required: false,
  },
  neighborhood: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  zipCode: {
    type: String,
    required: false,
  }
});

const employeeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: false,
    },
    rg: {
      type: String,
      required: false,
    },
    
    phone: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: true,
    },
    address: {
      type: addressSchema,
      required: false,
    },
    status: {
      type: String,
      enum: ["Ativo", "Inativo", "Afastado"],
      default: "Inativo",
    },
    codigoRegional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Regional",
      required: true,
    },
    codigoMunicipio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Municipio",
      required: true,
    },
    company: {
      type: String,
      required: true,
      enum: ["Sanegrande", "Enter Home"],
    },
    codigoLocal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Local",
      required: true,
    },
    codigoEquipe: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    placaMoto: {
      type: String,
      required: false,
    },
    birthDate:{
      type: Date,
      required: false,
    },
    admissionDate:{
      type: Date,
      required: false,
    },
    vehicleYear: {
      type: String,
      required: false,
    },
    vehicleModel: {
      type: String,
      required: false,
    },
    placaCarro: {
      type: String,
      required: false,
    },
    cnh: {
      type: String,
      required: false,
    },
    cnhValidity: {
      type: Date,
      required: false,
    },
    rankings: [
      {
        mes: {
          type: String,
          required: false,
        },
        ano: {
          type: Number,
          required: false,
        },
        nota: {
          type: Number,
          required: false,
          min: 0,
          max: 10,
        },
        observacao: {
          type: String,
          default: "",
          required: false
        },
      },
    ],
  },
  { timestamps: true }
);

employeeSchema.methods.getEmployeeInfo = function () {
  return `${this.name} - Regional: ${this.codigoRegional}, Equipe: ${this.codigoEquipe}`;
};

employeeSchema.methods.addAvaliacao = function (mes, ano, nota, observacao = "") {
  this.avaliacoes.push({ mes, ano, nota, observacao });
  return this.save();
};

module.exports = mongoose.model("Employee", employeeSchema);