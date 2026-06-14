import Funcionario from "../models/funcionario.js";
import { getRequestErrorResponse } from "../utils/errors.js";
import { formatCpfCnpj } from "../utils/formatters.js";

function montarFiltrosFuncionario(query) {
  const filtros = {};

  if (query.nome) {
    filtros.nome = { $regex: query.nome, $options: "i" };
  }

  if (query.cpf) {
    filtros.cpf = { $regex: formatCpfCnpj(query.cpf), $options: "i" };
  }

  if (query.setor) {
    filtros.setor = { $regex: query.setor, $options: "i" };
  }

  if (query.status) {
    filtros.status = String(query.status).toLowerCase();
  }

  return filtros;
}

class FuncionarioController {

  // Criar funcionario
  async criarFuncionario(req, res) {
    try {
      const funcionario = await Funcionario.create(req.body);
      return res.status(201).json(funcionario);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao criar funcionario");
      return res.status(response.status).json(response.body);
    }
  }

  // Listar todos os funcionarios
  async listarFuncionarios(req, res) {
    try {
      const filtros = montarFiltrosFuncionario(req.query);
      const funcionarios = await Funcionario.find(filtros);

      return res.status(200).json(funcionarios);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao listar funcionarios");
      return res.status(response.status).json(response.body);
    }
  }

  // Buscar funcionario por ID
  async buscarFuncionario(req, res) {
    try {
      const { id } = req.params;

      const funcionario = await Funcionario.findById(id);

      if (!funcionario) {
        return res.status(404).json({ erro: "Funcionario nao encontrado" });
      }

      return res.status(200).json(funcionario);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao buscar funcionario");
      return res.status(response.status).json(response.body);
    }
  }

  // Atualizar funcionario
  async atualizarFuncionario(req, res) {
    try {
      const { id } = req.params;

      const funcionario = await Funcionario.findByIdAndUpdate(
        id,
        req.body,
        { returnDocument: "after", runValidators: true }
      );

      if (!funcionario) {
        return res.status(404).json({ erro: "Funcionario nao encontrado" });
      }

      return res.status(200).json(funcionario);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao atualizar funcionario");
      return res.status(response.status).json(response.body);
    }
  }

  // Inativar funcionario
  async inativarFuncionario(req, res) {
    try {
      const { id } = req.params;
      const {
        responsavelDesligamento,
        motivoDesligamento,
        observacao,
      } = req.body;

      if (!responsavelDesligamento || !motivoDesligamento) {
        return res.status(400).json({
          mensagem: "Responsavel e motivo do desligamento sao obrigatorios.",
        });
      }

      const funcionario = await Funcionario.findByIdAndUpdate(
        id,
        {
          status: "inativo",
          permissoes: [],
          dataDesligamento: new Date(),
          responsavelDesligamento,
          motivoDesligamento,
          observacao,
        },
        { returnDocument: "after", runValidators: true }
      );

      if (!funcionario) {
        return res.status(404).json({ erro: "Funcionario nao encontrado" });
      }

      return res.status(200).json(funcionario);
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao inativar funcionario");
      return res.status(response.status).json(response.body);
    }
  }

  // Deletar funcionario
  async deletarFuncionario(req, res) {
    try {
      const { id } = req.params;

      const funcionario = await Funcionario.findByIdAndDelete(id);

      if (!funcionario) {
        return res.status(404).json({ erro: "Funcionario nao encontrado" });
      }

      return res.status(200).json({ mensagem: "Funcionario deletado com sucesso" });
    } catch (erro) {
      const response = getRequestErrorResponse(erro, "Erro ao deletar funcionario");
      return res.status(response.status).json(response.body);
    }
  }
}

export default new FuncionarioController();
