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
    required: [true, "Razao social e obrigatoria."],
    trim: true,
  },
  nomeFantasia: {
    type: String,
    trim: true,
  },
  cnpj: {
    type: String,
    required: [true, "CNPJ e obrigatorio."],
    unique: true,
    trim: true,
    set: formatCpfCnpj,
    validate: {
      validator: (value) => onlyDigits(value).length === 14 && isValidCpfCnpj(value),
      message: "CNPJ invalido.",
    },
  },
  telefone: {
    type: String,
    trim: true,
    set: formatPhone,
    validate: {
      validator: isValidPhone,
      message: "Informe um telefone com DDD e 10 ou 11 digitos.",
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => !value || emailRegex.test(value),
      message: "Informe um e-mail valido.",
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
