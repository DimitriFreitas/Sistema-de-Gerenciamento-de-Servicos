import mongoose from "mongoose";
import {
  formatCpfCnpj,
  formatPhone,
  isValidCpfCnpj,
  isValidPhone,
  onlyDigits,
} from "../utils/formatters.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FornecedorSchema = new mongoose.Schema({
  razaoSocial: {
    type: String,
    required: [true, "Razão social é obrigatória."],
    trim: true,
  },
  nomeFantasia: {
    type: String,
    trim: true,
  },
  cnpj: {
    type: String,
    required: [true, "CNPJ é obrigatório."],
    unique: true,
    trim: true,
    set: formatCpfCnpj,
    validate: {
      validator: (value) => onlyDigits(value).length === 14 && isValidCpfCnpj(value),
      message: "CNPJ inválido.",
    },
  },
  telefone: {
    type: String,
    trim: true,
    set: formatPhone,
    validate: {
      validator: isValidPhone,
      message: "Informe um telefone com DDD e 10 ou 11 dígitos.",
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => !value || emailRegex.test(value),
      message: "Informe um e-mail válido.",
    },
  },
  endereco: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ["ativo", "inativo"],
      message: "Status deve ser ativo ou inativo.",
    },
    default: "ativo",
    lowercase: true,
  },
});

export default mongoose.model("Fornecedor", FornecedorSchema);
