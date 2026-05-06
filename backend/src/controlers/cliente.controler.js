import Cliente from "../models/cliente.js";

class ClienteController {

  async criarCliente(req, res) {
    try {
      const cliente = await Cliente.create(req.body);
      return res.status(201).json(cliente);
    } catch (erro) {
      return res.status(500).json({ mensagem: erro.message });
    }
  }

  async listarClientes(req, res) {
    try {
      const clientes = await Cliente.find();
      return res.status(200).json(clientes);
    } catch (erro) {
      return res.status(500).json({ mensagem: erro.message });
    }
  }

  async buscarCliente(req, res) {
    try {
      const cliente = await Cliente.findById(req.params.id);

      if (!cliente) {
        return res.status(404).json({ mensagem: "Cliente não encontrado" });
      }

      return res.status(200).json(cliente);
    } catch (erro) {
      return res.status(500).json({ mensagem: erro.message });
    }
  }

  async atualizarCliente(req, res) {
    try {
      const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: "after",
      });
      return res.status(200).json(cliente);
    } catch (erro) {
      return res.status(500).json({ mensagem: erro.message });
    }
  }

  async deletarCliente(req, res) {
    try {
      await Cliente.findByIdAndDelete(req.params.id);
      return res.status(200).json({ mensagem: "Cliente removido com sucesso" });
    } catch (erro) {
      return res.status(500).json({ mensagem: erro.message });
    }
  }
}

export default new ClienteController();
