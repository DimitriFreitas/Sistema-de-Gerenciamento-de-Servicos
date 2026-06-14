import mongoose from "mongoose";

const LocalEstoqueSchema = new mongoose.Schema(
  {
    localizacao: {
      type: String,
      required: [true, "Localizacao e obrigatoria."],
      trim: true,
    },
    quantidade: {
      type: Number,
      default: 0,
      min: [0, "Quantidade do local nao pode ser negativa."],
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
    required: [true, "Nome do produto e obrigatorio."],
    trim: true,
  },
  descricao: {
    type: String,
    required: [true, "Descricao e obrigatoria."],
    trim: true,
  },
  custo: {
    type: Number,
    min: [0, "Custo nao pode ser negativo."],
  },
  preco: {
    type: Number,
    min: [0, "Preco nao pode ser negativo."],
  },
  quantidadeAtual: {
    type: Number,
    default: 0,
    min: [0, "Quantidade atual nao pode ser negativa."],
  },
  quantidadeMinima: {
    type: Number,
    min: [0, "Quantidade minima nao pode ser negativa."],
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
