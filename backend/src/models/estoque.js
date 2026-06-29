import mongoose from "mongoose";

const EstoqueSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produto",
    required: true
  },

  fornecedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fornecedor"
    // usado apenas na entrada
  },

  tipo: {
    type: String,
    enum: ["entrada", "saida", "ajuste", "transferencia"],
    required: true
  },

  quantidade: {
    type: Number,
    required: true,
    min: 1
  },

  valorUnitario: {
    type: Number,
    min: 0
  },

  valorTotal: {
    type: Number,
    min: 0
  },

  localOrigem: {
    type: String,
    trim: true
  },

  localDestino: {
    type: String,
    trim: true
  },

  quantidadeAnterior: {
    type: Number,
    min: 0
  },

  quantidadeNova: {
    type: Number,
    min: 0
  },

  responsavel: {
    type: String,
    trim: true
  },

  motivo: {
    type: String,
    trim: true
  },

  observacao: {
    type: String,
    trim: true
  },

  data: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Estoque", EstoqueSchema);
