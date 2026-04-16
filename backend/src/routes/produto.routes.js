
import  Router  from "express";
import produtoController from "../controllers/produto.controller.js";

const router = Router();

// Criar produto
router.post("/produtos", (req, res) =>
  produtoController.criarProduto(req, res)
);

// Listar todos
router.get("/listaProdutos", (req, res) =>
  produtoController.listarProduto(req, res)
);

// Atualizar
router.put("/produtos/:id", (req, res) =>
  produtoController.atualizarProduto(req, res)
);

// Deletar
router.delete("/produtos/:id", (req, res) =>
  produtoController.deletarProduto(req, res)
);

export default router;
