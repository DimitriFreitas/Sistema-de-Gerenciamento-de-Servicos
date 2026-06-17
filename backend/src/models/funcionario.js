import mongoose from "mongoose";
import {
  formatCpfCnpj,
  formatPhone,
  isValidCpfCnpj,
  isValidPhone,
  onlyDigits,
} from "../utils/formatters.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FuncionarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "Nome é obrigatório."],
    trim: true,
  },
  cpf: {
    type: String,
    required: [true, "CPF é obrigatório."],
    unique: true,
    trim: true,
    set: formatCpfCnpj,
    validate: {
      validator: (value) => onlyDigits(value).length === 11 && isValidCpfCnpj(value),
      message: "CPF inválido.",
    },
  },
  rg: {
    type: String,
    trim: true,
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
  telefone: {
    type: String,
    trim: true,
    set: formatPhone,
    validate: {
      validator: isValidPhone,
      message: "Informe um telefone com DDD e 10 ou 11 dígitos.",
    },
  },
  endereco: {
    type: String,
    trim: true,
  },
  cargo: {
    type: String,
    required: [true, "Cargo é obrigatório."],
    trim: true,
  },
  setor: {
    type: String,
    required: [true, "Setor é obrigatório."],
    trim: true,
  },
  tipoVinculo: {
    type: String,
    required: [true, "Tipo de vínculo é obrigatório."],
    trim: true,
  },
  permissoes: [{
    type: String,
    trim: true,
  }],
  dataAdmissao: {
    type: Date,
  },
  dataDesligamento: {
    type: Date,
  },
  responsavelDesligamento: {
    type: String,
    trim: true,
  },
  motivoDesligamento: {
    type: String,
    trim: true,
  },
  observacao: {
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

export default mongoose.model("Funcionario", FuncionarioSchema);
