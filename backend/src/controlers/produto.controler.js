import Produto from "../models/produto.js";

class ProdutoController {

  // Criar produto
  async criarProduto(req, res) {
    try {
      const produto = await Produto.create(req.body);
      return res.status(201).json(produto);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao criar produto" });
    }
  }

  // Listar todos os produtos
  async listarProdutos(req, res) {
    try {
      const produtos = await Produto.find();
      return res.status(200).json(produtos);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao listar produtos" });
    }
  }

  // Buscar produto por ID
  async buscarProduto(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findById(id);

      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar produto" });
    }
  }

  // Atualizar produto
  async atualizarProduto(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findByIdAndUpdate(
        id,
        req.body,
        { returnDocument: "after" }
      );

      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao atualizar produto" });
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
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao deletar produto" });
    }
  }
}

export default new ProdutoController();
