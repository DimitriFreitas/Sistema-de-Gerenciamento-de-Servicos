import { Router } from "express";
import fornecedorController from "../controlers/fornecedor.controler.js";

const router = Router();

// Criar fornecedor
router.post("/", (req, res) =>
  fornecedorController.criarFornecedor(req, res)
);

// Listar todos os fornecedores
router.get("/", (req, res) =>
  fornecedorController.listarFornecedores(req, res)
);

// Buscar fornecedor por ID
router.get("/:id", (req, res) =>
  fornecedorController.buscarFornecedor(req, res)
);

// Atualizar fornecedor
router.put("/:id", (req, res) =>
  fornecedorController.atualizarFornecedor(req, res)
);

// Deletar fornecedor
router.delete("/:id", (req, res) =>
  fornecedorController.deletarFornecedor(req, res)
);

export default router;
