import mongoose from "mongoose";

const ProdutoServicoSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: [true, "Produto utilizado e obrigatorio."],
    },
    quantidade: {
      type: Number,
      required: [true, "Quantidade utilizada e obrigatoria."],
      min: [1, "Quantidade utilizada deve ser maior que zero."],
    },
    localOrigem: {
      type: String,
      trim: true,
    },
    valorUnitario: {
      type: Number,
      min: [0, "Valor unitario nao pode ser negativo."],
    },
  },
  { _id: false }
);

const HistoricoStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: [true, "Status do historico e obrigatorio."],
      trim: true,
    },
    data: {
      type: Date,
      default: Date.now,
    },
    responsavel: {
      type: String,
      trim: true,
    },
    observacao: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ServicoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: [true, "Cliente e obrigatorio."],
  },
  tipo: {
    type: String,
    required: [true, "Tipo de servico e obrigatorio."],
    trim: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
  dataAgendamento: {
    type: Date,
  },
  dataInicio: {
    type: Date,
  },
  dataConclusao: {
    type: Date,
  },
  garantiaAte: {
    type: Date,
  },
  equipe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Funcionario",
  }],
  produtosUtilizados: [ProdutoServicoSchema],
  valorMaoDeObra: {
    type: Number,
    min: [0, "Valor da mao de obra nao pode ser negativo."],
  },
  valorProdutos: {
    type: Number,
    min: [0, "Valor dos produtos nao pode ser negativo."],
  },
  valorTotal: {
    type: Number,
    min: [0, "Valor total nao pode ser negativo."],
  },
  status: {
    type: String,
    enum: {
      values: ["agendado", "em_andamento", "concluido", "cancelado", "inativo"],
      message: "Status do servico invalido.",
    },
    default: "agendado",
    lowercase: true,
  },
  historicoStatus: [HistoricoStatusSchema],
  responsavelCancelamento: {
    type: String,
    trim: true,
  },
  motivoCancelamento: {
    type: String,
    trim: true,
  },
  dataCancelamento: {
    type: Date,
  },
  observacao: {
    type: String,
    trim: true,
  },
});

export default mongoose.model("Servico", ServicoSchema);
