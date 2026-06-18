import mongoose from "mongoose";

const LocalEstoqueSchema = new mongoose.Schema(
  {
    localizacao: {
      type: String,
      required: [true, "Localização é obrigatória."],
      trim: true,
    },
    quantidade: {
      type: Number,
      default: 0,
      min: [0, "Quantidade do local não pode ser negativa."],
    },
  },
  { _id: false }
);

const ProdutoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  nome: {
    type: String,
    required: [true, "Nome do produto é obrigatório."],
    trim: true,
  },
  descricao: {
    type: String,
    required: [true, "Descrição é obrigatória."],
    trim: true,
  },
  custo: {
    type: Number,
    min: [0, "Custo não pode ser negativo."],
  },
  preco: {
    type: Number,
    min: [0, "Preço não pode ser negativo."],
  },
  quantidadeAtual: {
    type: Number,
    default: 0,
    min: [0, "Quantidade atual não pode ser negativa."],
  },
  quantidadeMinima: {
    type: Number,
    min: [0, "Quantidade mínima não pode ser negativa."],
  },
  unidadeMedida: {
    type: String,
    trim: true,
  },
  localizacao: {
    type: String,
    trim: true,
  },
  locaisEstoque: [LocalEstoqueSchema],
  fornecedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fornecedor",
  },
  dataValidade: Date,
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
export default mongoose.model("Produto", ProdutoSchema);
