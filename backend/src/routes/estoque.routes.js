import { Router } from "express";
import estoqueController from "../controlers/estoque.controler.js";

const router = Router();

// Criar movimentação
router.post("/", (req, res) =>
  estoqueController.criarMovimentacao(req, res)
);

// Listar todas as movimentações
router.get("/", (req, res) =>
  estoqueController.listarMovimentacoes(req, res)
);

// Ajustar quantidade de estoque
router.post("/ajuste", (req, res) =>
  estoqueController.ajustarEstoque(req, res)
);

// Transferir estoque entre locais
router.post("/transferencia", (req, res) =>
  estoqueController.transferirEstoque(req, res)
);

// Buscar movimentação por ID
router.get("/:id", (req, res) =>
  estoqueController.buscarMovimentacao(req, res)
);

// Atualizar movimentação
router.put("/:id", (req, res) =>
  estoqueController.atualizarMovimentacao(req, res)
);

// Deletar movimentação
router.delete("/:id", (req, res) =>
  estoqueController.deletarMovimentacao(req, res)
);

export default router;
