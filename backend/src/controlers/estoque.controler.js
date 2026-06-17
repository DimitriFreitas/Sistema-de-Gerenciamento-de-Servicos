import Estoque from "../models/estoque.js";
import Produto from "../models/produto.js";
import { getRequestErrorResponse } from "../utils/errors.js";

const LOCAL_PADRAO = "Geral";

function criarErro(mensagem, status = 400) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

function toNumberOrUndefined(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Number(value);
}

function normalizarLocal(local, fallback = LOCAL_PADRAO) {
  const valor = String(local ?? "").trim();
  return valor || fallback;
}

function getLocalPadraoProduto(produto) {
  return normalizarLocal(produto.localizacao, LOCAL_PADRAO);
}

function montarDadosMovimentacao(dados) {
  const valorUnitario = toNumberOrUndefined(dados.valorUnitario);
  const quantidade = toNumberOrUndefined(dados.quantidade);
  const valorTotalInformado = toNumberOrUndefined(dados.valorTotal);
  const quantidadeAnterior = toNumberOrUndefined(dados.quantidadeAnterior);
  const quantidadeNova = toNumberOrUndefined(dados.quantidadeNova);
  const valorTotal =
    valorTotalInformado !== undefined
      ? valorTotalInformado
      : valorUnitario !== undefined && quantidade !== undefined
        ? valorUnitario * quantidade
        : undefined;

  return {
    ...dados,
    quantidade,
    valorUnitario,
    valorTotal,
    quantidadeAnterior,
    quantidadeNova,
  };
}

function validarQuantidade(quantidade) {
  if (quantidade === undefined || Number.isNaN(quantidade) || quantidade <= 0) {
    throw criarErro("Quantidade deve ser maior que zero.");
  }
}

function validarQuantidadeNova(quantidadeNova) {
  if (quantidadeNova === undefined || Number.isNaN(quantidadeNova) || quantidadeNova < 0) {
    throw criarErro("Quantidade nova deve ser um número maior ou igual a zero.");
  }
}

function validarSaldoDisponivel(produto, quantidade) {
  const saldoAtual = Number(produto.quantidadeAtual ?? 0);

  if (saldoAtual <= 0) {
    throw criarErro("Produto sem estoque não pode ter saída. Registre uma entrada antes.");
  }

  if (quantidade > saldoAtual) {
    throw criarErro(`Quantidade solicitada maior que o estoque atual (${saldoAtual}).`);
  }
}

async function buscarProduto(produtoId) {
  const produto = await Produto.findById(produtoId);

  if (!produto) {
    throw criarErro("Produto não encontrado", 404);
  }

  return produto;
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
    throw criarErro("Estoque insuficiente no local informado.");
  }

  definirSaldoLocal(produto, localizacao, novoSaldo);
}

function sincronizarQuantidadeAtual(produto) {
  produto.quantidadeAtual = produto.locaisEstoque.reduce(
    (total, local) => total + Number(local.quantidade ?? 0),
    0
  );
}

async function aplicarEntradaSaida(dados) {
  validarQuantidade(dados.quantidade);

  const produto = await buscarProduto(dados.produto);
  garantirSaldosPorLocal(produto);

  if (dados.tipo === "entrada") {
    const localDestino = normalizarLocal(dados.localDestino, getLocalPadraoProduto(produto));
    alterarSaldoLocal(produto, localDestino, dados.quantidade);
  } else {
    validarSaldoDisponivel(produto, dados.quantidade);

    const localOrigem = normalizarLocal(dados.localOrigem, getLocalPadraoProduto(produto));
    alterarSaldoLocal(produto, localOrigem, -dados.quantidade);
  }

  sincronizarQuantidadeAtual(produto);
  await produto.save();

  return produto;
}

async function aplicarAjuste(dados) {
  validarQuantidadeNova(dados.quantidadeNova);

  const produto = await buscarProduto(dados.produto);
  garantirSaldosPorLocal(produto);

  const localDestino = normalizarLocal(dados.localDestino, getLocalPadraoProduto(produto));
  definirSaldoLocal(produto, localDestino, dados.quantidadeNova);
  sincronizarQuantidadeAtual(produto);
  await produto.save();

  return produto;
}

async function aplicarTransferencia(dados) {
  validarQuantidade(dados.quantidade);

  const produto = await buscarProduto(dados.produto);
  garantirSaldosPorLocal(produto);

  const localOrigem = normalizarLocal(dados.localOrigem, getLocalPadraoProduto(produto));
  const localDestino = normalizarLocal(dados.localDestino, getLocalPadraoProduto(produto));

  if (localOrigem === localDestino) {
    throw criarErro("Local de origem e destino devem ser diferentes.");
  }

  validarSaldoDisponivel(produto, dados.quantidade);
  alterarSaldoLocal(produto, localOrigem, -dados.quantidade);
  alterarSaldoLocal(produto, localDestino, dados.quantidade);
  sincronizarQuantidadeAtual(produto);
  await produto.save();

  return produto;
}

async function aplicarMovimentacao(dados) {
  if (dados.tipo === "entrada" || dados.tipo === "saida") {
    return aplicarEntradaSaida(dados);
  }

  if (dados.tipo === "ajuste") {
    return aplicarAjuste(dados);
  }

  if (dados.tipo === "transferencia") {
    return aplicarTransferencia(dados);
  }

  throw criarErro("Tipo de movimentação inválido.");
}

async function reverterMovimentacao(dados) {
  if (dados.tipo === "entrada") {
    return aplicarEntradaSaida({
      produto: dados.produto,
      tipo: "saida",
      quantidade: dados.quantidade,
      localOrigem: dados.localDestino,
    });
  }

  if (dados.tipo === "saida") {
    return aplicarEntradaSaida({
      produto: dados.produto,
      tipo: "entrada",
      quantidade: dados.quantidade,
      localDestino: dados.localOrigem,
    });
  }

  if (dados.tipo === "ajuste") {
    return aplicarAjuste({
      produto: dados.produto,
      quantidadeNova: dados.quantidadeAnterior,
      localDestino: dados.localDestino,
    });
  }

  if (dados.tipo === "transferencia") {
    return aplicarTransferencia({
      produto: dados.produto,
      quantidade: dados.quantidade,
      localOrigem: dados.localDestino,
      localDestino: dados.localOrigem,
    });
  }

  throw criarErro("Tipo de movimentação inválido.");
}

function responderErroMovimentacao(erro, res, fallbackMessage) {
  if (erro.status) {
    return res.status(erro.status).json({ mensagem: erro.message });
  }

  const response = getRequestErrorResponse(erro, fallbackMessage);
  return res.status(response.status).json(response.body);
}

class EstoqueController {

  // Criar movimentação de estoque
  async criarMovimentacao(req, res) {
    try {
      const dadosMovimentacao = montarDadosMovimentacao(req.body);

      if (dadosMovimentacao.tipo !== "entrada" && dadosMovimentacao.tipo !== "saida") {
        throw criarErro("Use as rotas específicas para ajuste ou transferência.");
      }

      const movimentacao = new Estoque(dadosMovimentacao);

      await movimentacao.validate();
      await aplicarMovimentacao(dadosMovimentacao);
      await movimentacao.save();
      await movimentacao.populate(["produto", "fornecedor"]);

      return res.status(201).json(movimentacao);
    } catch (erro) {
      return responderErroMovimentacao(erro, res, "Erro ao criar movimentação de estoque");
    }
  }

  // Ajustar quantidade de um produto em um local
  async ajustarEstoque(req, res) {
    try {
      const produto = await buscarProduto(req.body.produto);
      garantirSaldosPorLocal(produto);

      const localDestino = normalizarLocal(req.body.localizacao ?? req.body.localDestino, getLocalPadraoProduto(produto));
      const quantidadeAnterior = getSaldoLocal(produto, localDestino);
      const quantidadeNova = toNumberOrUndefined(req.body.quantidadeNova);

      validarQuantidadeNova(quantidadeNova);

      if (quantidadeAnterior === quantidadeNova) {
        throw criarErro("Quantidade nova deve ser diferente da quantidade atual.");
      }

      const dadosMovimentacao = montarDadosMovimentacao({
        ...req.body,
        tipo: "ajuste",
        localDestino,
        quantidadeAnterior,
        quantidadeNova,
        quantidade: Math.abs(quantidadeNova - quantidadeAnterior),
      });
      const movimentacao = new Estoque(dadosMovimentacao);

      await movimentacao.validate();
      await aplicarMovimentacao(dadosMovimentacao);
      await movimentacao.save();
      await movimentacao.populate(["produto", "fornecedor"]);

      return res.status(201).json(movimentacao);
    } catch (erro) {
      return responderErroMovimentacao(erro, res, "Erro ao ajustar estoque");
    }
  }

  // Transferir estoque entre locais
  async transferirEstoque(req, res) {
    try {
      const produto = await buscarProduto(req.body.produto);
      const localOrigem = normalizarLocal(req.body.localOrigem, getLocalPadraoProduto(produto));
      const localDestino = normalizarLocal(req.body.localDestino, getLocalPadraoProduto(produto));
      const quantidade = toNumberOrUndefined(req.body.quantidade);

      if (localOrigem === localDestino) {
        throw criarErro("Local de origem e destino devem ser diferentes.");
      }

      const dadosMovimentacao = montarDadosMovimentacao({
        ...req.body,
        tipo: "transferencia",
        quantidade,
        localOrigem,
        localDestino,
      });
      const movimentacao = new Estoque(dadosMovimentacao);

      await movimentacao.validate();
      await aplicarMovimentacao(dadosMovimentacao);
      await movimentacao.save();
      await movimentacao.populate(["produto", "fornecedor"]);

      return res.status(201).json(movimentacao);
    } catch (erro) {
      return responderErroMovimentacao(erro, res, "Erro ao transferir estoque");
    }
  }

  // Listar todas as movimentações
  async listarMovimentacoes(req, res) {
    try {
      const movimentacoes = await Estoque.find().populate(["produto", "fornecedor"]);
      return res.status(200).json(movimentacoes);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao listar movimentações de estoque");
      return res.status(response.status).json(response.body);
    }
  }

  // Buscar movimentação por ID
  async buscarMovimentacao(req, res) {
    try {
      const { id } = req.params;

      const movimentacao = await Estoque.findById(id).populate(["produto", "fornecedor"]);

      if (!movimentacao) {
        return res.status(404).json({ erro: "Movimentação de estoque não encontrada" });
      }

      return res.status(200).json(movimentacao);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao buscar movimentação de estoque");
      return res.status(response.status).json(response.body);
    }
  }

  // Atualizar movimentação
  async atualizarMovimentacao(req, res) {
    try {
      const { id } = req.params;
      const movimentacaoAtual = await Estoque.findById(id);

      if (!movimentacaoAtual) {
        return res.status(404).json({ erro: "Movimentação de estoque não encontrada" });
      }

      const dadosAtuais = montarDadosMovimentacao(movimentacaoAtual.toObject());
      const dadosMovimentacao = montarDadosMovimentacao({
        ...movimentacaoAtual.toObject(),
        ...req.body,
      });
      const movimentacaoValidada = new Estoque(dadosMovimentacao);

      await movimentacaoValidada.validate();
      await reverterMovimentacao(dadosAtuais);

      try {
        await aplicarMovimentacao(dadosMovimentacao);
      } catch (erro) {
        await aplicarMovimentacao(dadosAtuais);
        throw erro;
      }

      const movimentacao = await Estoque.findByIdAndUpdate(
        id,
        dadosMovimentacao,
        { returnDocument: "after", runValidators: true }
      ).populate(["produto", "fornecedor"]);

      return res.status(200).json(movimentacao);
    } catch (erro) {
      return responderErroMovimentacao(erro, res, "Erro ao atualizar movimentação de estoque");
    }
  }

  // Deletar movimentação
  async deletarMovimentacao(req, res) {
    try {
      const { id } = req.params;

      const movimentacao = await Estoque.findById(id);

      if (!movimentacao) {
        return res.status(404).json({ erro: "Movimentação de estoque não encontrada" });
      }

      await reverterMovimentacao(montarDadosMovimentacao(movimentacao.toObject()));
      await Estoque.findByIdAndDelete(id);

      return res.status(200).json({ mensagem: "Movimentação de estoque deletada com sucesso" });
    } catch (erro) {
      return responderErroMovimentacao(erro, res, "Erro ao deletar movimentação de estoque");
    }
  }
}

export default new EstoqueController();
