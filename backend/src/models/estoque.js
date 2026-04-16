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
    // só usado na ENTRADA
  },

  tipo: {
    type: String,
    enum: ["entrada", "saida"],
    required: true
  },

  quantidade: {
    type: Number,
    required: true
  },

  valorUnitario: Number,

  data: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Estoque", EstoqueSchema);