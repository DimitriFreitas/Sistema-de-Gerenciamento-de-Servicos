import Produto from "../models/produto.js";
import { getRequestErrorResponse } from "../utils/errors.js";

class ProdutoController {

  // Criar produto
  async criarProduto(req, res) {
    try {
      const produto = await Produto.create(req.body);
      await produto.populate("fornecedor");

      return res.status(201).json(produto);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao criar produto");
      return res.status(response.status).json(response.body);
    }
  }

  // Listar todos os produtos
  async listarProdutos(req, res) {
    try {
      const produtos = await Produto.find().populate("fornecedor");
      return res.status(200).json(produtos);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao listar produtos");
      return res.status(response.status).json(response.body);
    }
  }

  // Buscar produto por ID
  async buscarProduto(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findById(id).populate("fornecedor");

      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao buscar produto");
      return res.status(response.status).json(response.body);
    }
  }

  // Atualizar produto
  async atualizarProduto(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findByIdAndUpdate(
        id,
        req.body,
        { returnDocument: "after", runValidators: true }
      ).populate("fornecedor");

      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao atualizar produto");
      return res.status(response.status).json(response.body);
    }
  }

  // Deletar produto
  async deletarProduto(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findByIdAndDelete(id);

      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }

      return res.status(200).json({ mensagem: "Produto deletado com sucesso" });
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao deletar produto");
      return res.status(response.status).json(response.body);
    }
  }
}

export default new ProdutoController();
