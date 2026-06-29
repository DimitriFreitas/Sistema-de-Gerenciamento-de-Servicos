import Fornecedor from "../models/fornecedor.js";
import { getRequestErrorResponse } from "../utils/errors.js";

class FornecedorController {

  // Criar fornecedor
  async criarFornecedor(req, res) {
    try {
      const fornecedor = await Fornecedor.create(req.body);
      return res.status(201).json(fornecedor);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao criar fornecedor");
      return res.status(response.status).json(response.body);
    }
  }

  // Listar todos os fornecedores
  async listarFornecedores(req, res) {
    try {
      const fornecedores = await Fornecedor.find();
      return res.status(200).json(fornecedores);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao listar fornecedores");
      return res.status(response.status).json(response.body);
    }
  }

  // Buscar fornecedor por ID
  async buscarFornecedor(req, res) {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findById(id);

      if (!fornecedor) {
        return res.status(404).json({ erro: "Fornecedor não encontrado" });
      }

      return res.status(200).json(fornecedor);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao buscar fornecedor");
      return res.status(response.status).json(response.body);
    }
  }

  // Atualizar fornecedor
  async atualizarFornecedor(req, res) {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findByIdAndUpdate(
        id,
        req.body,
        { returnDocument: "after", runValidators: true }
      );

      if (!fornecedor) {
        return res.status(404).json({ erro: "Fornecedor não encontrado" });
      }

      return res.status(200).json(fornecedor);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao atualizar fornecedor");
      return res.status(response.status).json(response.body);
    }
  }

  // Deletar fornecedor
  async deletarFornecedor(req, res) {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findByIdAndDelete(id);

      if (!fornecedor) {
        return res.status(404).json({ erro: "Fornecedor não encontrado" });
      }

      return res.status(200).json({ mensagem: "Fornecedor deletado com sucesso" });
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao deletar fornecedor");
      return res.status(response.status).json(response.body);
    }
  }
}

export default new FornecedorController();
