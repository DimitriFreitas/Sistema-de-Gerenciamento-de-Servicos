import Estoque from "../models/estoque.js";
import Produto from "../models/produto.js";
import Servico from "../models/servico.js";
import { getRequestErrorResponse } from "../utils/errors.js";

const LOCAL_PADRAO = "Geral";
const POPULATE_SERVICO = [
  "cliente",
  "equipe",
  "produtosUtilizados.produto",
];

function criarErro(mensagem, status = 400) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

function normalizarLocal(local, fallback = LOCAL_PADRAO) {
  const valor = String(local ?? "").trim();
  return valor || fallback;
}

function getLocalPadraoProduto(produto) {
  return normalizarLocal(produto.localizacao, LOCAL_PADRAO);
}

function garantirSaldosPorLocal(produto) {
  if (!Array.isArray(produto.locaisEstoque)) {
    produto.locaisEstoque = [];
  }

  if (produto.locaisEstoque.length === 0 && Number(produto.quantidadeAtual ?? 0) > 0) {
    produto.locaisEstoque.push({
      localizacao: getLocalPadraoProduto(produto),
      quantidade: Number(produto.quantidadeAtual ?? 0),
    });
  }
}

function getIndiceLocal(produto, localizacao) {
  return produto.locaisEstoque.findIndex(
    (local) => normalizarLocal(local.localizacao) === normalizarLocal(localizacao)
  );
}

function getSaldoLocal(produto, localizacao) {
  const indiceLocal = getIndiceLocal(produto, localizacao);

  if (indiceLocal === -1) {
    return 0;
  }

  return Number(produto.locaisEstoque[indiceLocal].quantidade ?? 0);
}

function definirSaldoLocal(produto, localizacao, quantidade) {
  if (quantidade < 0) {
    throw criarErro("Saldo do local não pode ser negativo.");
  }

  const localNormalizado = normalizarLocal(localizacao, getLocalPadraoProduto(produto));
  const indiceLocal = getIndiceLocal(produto, localNormalizado);

  if (indiceLocal === -1) {
    produto.locaisEstoque.push({
      localizacao: localNormalizado,
      quantidade,
    });
    return;
  }

  produto.locaisEstoque[indiceLocal].quantidade = quantidade;
}

function alterarSaldoLocal(produto, localizacao, diferenca) {
  const saldoAtual = getSaldoLocal(produto, localizacao);
  const novoSaldo = saldoAtual + diferenca;

  if (novoSaldo < 0) {
    throw criarErro("Estoque insuficiente para o produto utilizado no serviço.");
  }

  definirSaldoLocal(produto, localizacao, novoSaldo);
}

function sincronizarQuantidadeAtual(produto) {
  produto.quantidadeAtual = produto.locaisEstoque.reduce(
    (total, local) => total + Number(local.quantidade ?? 0),
    0
  );
}

function montarHistoricoStatus(status, responsavel, observacao) {
  return {
    status,
    responsavel,
    observacao,
    data: new Date(),
  };
}

function calcularValorProdutos(produtosUtilizados = []) {
  return produtosUtilizados.reduce(
    (total, item) => total + Number(item.quantidade ?? 0) * Number(item.valorUnitario ?? 0),
    0
  );
}

function montarDadosServico(dados) {
  const valorProdutos = dados.valorProdutos !== undefined
    ? Number(dados.valorProdutos)
    : calcularValorProdutos(dados.produtosUtilizados);
  const valorMaoDeObra = dados.valorMaoDeObra === undefined ? undefined : Number(dados.valorMaoDeObra);
  const valorTotal = dados.valorTotal !== undefined
    ? Number(dados.valorTotal)
    : Number(valorProdutos ?? 0) + Number(valorMaoDeObra ?? 0);

  return {
    ...dados,
    valorProdutos,
    valorMaoDeObra,
    valorTotal,
  };
}

async function buscarServicoPopulado(id) {
  return Servico.findById(id).populate(POPULATE_SERVICO);
}

async function aplicarProdutosDoServico(produtosUtilizados = [], servicoId, responsavel) {
  const movimentacoes = [];
  const itensAplicados = [];

  try {
    for (const item of produtosUtilizados) {
      const produto = await Produto.findById(item.produto);

      if (!produto) {
        throw criarErro("Produto utilizado no serviço não encontrado.", 404);
      }

      garantirSaldosPorLocal(produto);

      const localOrigem = normalizarLocal(item.localOrigem, getLocalPadraoProduto(produto));

      alterarSaldoLocal(produto, localOrigem, -Number(item.quantidade));
      sincronizarQuantidadeAtual(produto);
      await produto.save();

      const itemAplicado = typeof item.toObject === "function" ? item.toObject() : item;
      itensAplicados.push({ ...itemAplicado, localOrigem });

      const movimentacao = await Estoque.create({
        produto: item.produto,
        tipo: "saida",
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: Number(item.quantidade) * Number(item.valorUnitario ?? 0),
        localOrigem,
        responsavel,
        motivo: "Uso em serviço",
        observacao: `Serviço ${servicoId}`,
      });

      movimentacoes.push(movimentacao);
    }
  } catch (erro) {
    await devolverProdutosDoServico(itensAplicados, servicoId, responsavel);
    throw erro;
  }

  return movimentacoes;
}

async function devolverProdutosDoServico(produtosUtilizados = [], servicoId, responsavel) {
  for (const item of produtosUtilizados) {
    const produto = await Produto.findById(item.produto);

    if (!produto) {
      throw criarErro("Produto utilizado no serviço não encontrado.", 404);
    }

    garantirSaldosPorLocal(produto);

    const localDestino = normalizarLocal(item.localOrigem, getLocalPadraoProduto(produto));

    alterarSaldoLocal(produto, localDestino, Number(item.quantidade));
    sincronizarQuantidadeAtual(produto);
    await produto.save();

    await Estoque.create({
      produto: item.produto,
      tipo: "entrada",
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: Number(item.quantidade) * Number(item.valorUnitario ?? 0),
      localDestino,
      responsavel,
      motivo: "Devolução de serviço",
      observacao: `Serviço ${servicoId}`,
    });
  }
}

function responderErroServico(erro, res, fallbackMessage) {
  if (erro.status) {
    return res.status(erro.status).json({ mensagem: erro.message });
  }

  const response = getRequestErrorResponse(erro, fallbackMessage);
  return res.status(response.status).json(response.body);
}

class ServicoController {

  // Criar serviço
  async criarServico(req, res) {
    try {
      const dadosServico = montarDadosServico(req.body);

      dadosServico.historicoStatus = [
        montarHistoricoStatus(
          dadosServico.status || "agendado",
          req.body.responsavel,
          "Serviço cadastrado"
        ),
      ];

      const servico = new Servico(dadosServico);

      await servico.validate();
      await servico.save();

      try {
        await aplicarProdutosDoServico(
          servico.produtosUtilizados,
          servico._id,
          req.body.responsavel
        );
      } catch (erro) {
        await Servico.findByIdAndDelete(servico._id);
        throw erro;
      }

      const servicoPopulado = await buscarServicoPopulado(servico._id);

      return res.status(201).json(servicoPopulado);
    } catch (erro) {
      return responderErroServico(erro, res, "Erro ao criar serviço");
    }
  }

  // Listar todos os serviços
  async listarServicos(req, res) {
    try {
      const filtros = {};

      if (req.query.cliente) {
        filtros.cliente = req.query.cliente;
      }

      if (req.query.status) {
        filtros.status = String(req.query.status).toLowerCase();
      }

      if (req.query.tipo) {
        filtros.tipo = { $regex: req.query.tipo, $options: "i" };
      }

      if (req.query.equipe) {
        filtros.equipe = req.query.equipe;
      }

      if (req.query.dataInicio || req.query.dataFim) {
        filtros.dataAgendamento = {};

        if (req.query.dataInicio) {
          filtros.dataAgendamento.$gte = new Date(req.query.dataInicio);
        }

        if (req.query.dataFim) {
          filtros.dataAgendamento.$lte = new Date(req.query.dataFim);
        }
      }

      const servicos = await Servico.find(filtros).populate(POPULATE_SERVICO);
      return res.status(200).json(servicos);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao listar serviços");
      return res.status(response.status).json(response.body);
    }
  }

  // Buscar serviço por ID
  async buscarServico(req, res) {
    try {
      const { id } = req.params;

      const servico = await buscarServicoPopulado(id);

      if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      return res.status(200).json(servico);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao buscar serviço");
      return res.status(response.status).json(response.body);
    }
  }

  // Atualizar serviço
  async atualizarServico(req, res) {
    try {
      const { id } = req.params;
      const servicoAtual = await Servico.findById(id);

      if (!servicoAtual) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      const dadosServico = montarDadosServico({
        ...servicoAtual.toObject(),
        ...req.body,
      });
      delete dadosServico._id;
      delete dadosServico.__v;

      if (req.body.status && req.body.status !== servicoAtual.status) {
        dadosServico.historicoStatus = [
          ...servicoAtual.historicoStatus,
          montarHistoricoStatus(req.body.status, req.body.responsavel, req.body.observacaoStatus),
        ];
      }

      const servicoValidado = new Servico(dadosServico);
      await servicoValidado.validate();

      const alterouProdutos = req.body.produtosUtilizados !== undefined;

      if (alterouProdutos) {
        await devolverProdutosDoServico(
          servicoAtual.produtosUtilizados,
          servicoAtual._id,
          req.body.responsavel
        );

        try {
          await aplicarProdutosDoServico(
            dadosServico.produtosUtilizados,
            servicoAtual._id,
            req.body.responsavel
          );
        } catch (erro) {
          await aplicarProdutosDoServico(
            servicoAtual.produtosUtilizados,
            servicoAtual._id,
            req.body.responsavel
          );
          throw erro;
        }
      }

      const servico = await Servico.findByIdAndUpdate(
        id,
        dadosServico,
        { returnDocument: "after", runValidators: true }
      ).populate(POPULATE_SERVICO);

      return res.status(200).json(servico);
    } catch (erro) {
      return responderErroServico(erro, res, "Erro ao atualizar serviço");
    }
  }

  // Inativar ou cancelar serviço
  async inativarServico(req, res) {
    try {
      const { id } = req.params;
      const {
        responsavelCancelamento,
        motivoCancelamento,
        observacao,
      } = req.body;

      if (!responsavelCancelamento || !motivoCancelamento) {
        return res.status(400).json({
          mensagem: "Responsável e motivo do cancelamento são obrigatórios.",
        });
      }

      const servicoAtual = await Servico.findById(id);

      if (!servicoAtual) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      if (servicoAtual.status === "cancelado" || servicoAtual.status === "inativo") {
        return res.status(400).json({ mensagem: "Serviço já está cancelado ou inativo." });
      }

      await devolverProdutosDoServico(
        servicoAtual.produtosUtilizados,
        servicoAtual._id,
        responsavelCancelamento
      );

      const servico = await Servico.findByIdAndUpdate(
        id,
        {
          status: "cancelado",
          responsavelCancelamento,
          motivoCancelamento,
          dataCancelamento: new Date(),
          observacao,
          historicoStatus: [
            ...servicoAtual.historicoStatus,
            montarHistoricoStatus("cancelado", responsavelCancelamento, motivoCancelamento),
          ],
        },
        { returnDocument: "after", runValidators: true }
      ).populate(POPULATE_SERVICO);

      return res.status(200).json(servico);
    } catch (erro) {
      return responderErroServico(erro, res, "Erro ao inativar serviço");
    }
  }

  // Deletar serviço
  async deletarServico(req, res) {
    try {
      const { id } = req.params;
      const servico = await Servico.findById(id);

      if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      await devolverProdutosDoServico(servico.produtosUtilizados, servico._id, req.body.responsavel);
      await Servico.findByIdAndDelete(id);

      return res.status(200).json({ mensagem: "Serviço deletado com sucesso" });
    } catch (erro) {
      return responderErroServico(erro, res, "Erro ao deletar serviço");
    }
  }
}

export default new ServicoController();
