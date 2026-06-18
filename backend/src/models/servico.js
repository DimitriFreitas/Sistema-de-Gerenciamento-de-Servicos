import mongoose from "mongoose";

const ProdutoServicoSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: [true, "Produto utilizado é obrigatório."],
    },
    quantidade: {
      type: Number,
      required: [true, "Quantidade utilizada é obrigatória."],
      min: [1, "Quantidade utilizada deve ser maior que zero."],
    },
    localOrigem: {
      type: String,
      trim: true,
    },
    valorUnitario: {
      type: Number,
      min: [0, "Valor unitário não pode ser negativo."],
    },
  },
  { _id: false }
);

const HistoricoStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: [true, "Status do histórico é obrigatório."],
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

const HistoricoResponsavelSchema = new mongoose.Schema(
  {
    funcionario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funcionario",
      required: [true, "Funcionário responsável é obrigatório."],
    },
    dataInicio: {
      type: Date,
      default: Date.now,
    },
    dataFim: {
      type: Date,
    },
    motivo: {
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
    required: [true, "Cliente é obrigatório."],
  },
  tipo: {
    type: String,
    required: [true, "Tipo de serviço é obrigatório."],
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
  responsavelAtual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Funcionario",
  },
  historicoResponsaveis: [HistoricoResponsavelSchema],
  produtosUtilizados: [ProdutoServicoSchema],
  valorMaoDeObra: {
    type: Number,
    min: [0, "Valor da mão de obra não pode ser negativo."],
  },
  valorProdutos: {
    type: Number,
    min: [0, "Valor dos produtos não pode ser negativo."],
  },
  valorTotal: {
    type: Number,
    min: [0, "Valor total não pode ser negativo."],
  },
  status: {
    type: String,
    enum: {
      values: ["agendado", "em_andamento", "concluido", "cancelado", "inativo"],
      message: "Status do serviço inválido.",
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
