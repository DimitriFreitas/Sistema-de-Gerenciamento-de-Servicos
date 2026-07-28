import { Router } from "express";
import funcionarioController from "../controlers/funcionario.controler.js";

const router = Router();

// Criar funcionário
router.post("/", (req, res) =>
  funcionarioController.criarFuncionario(req, res)
);

// Listar todos os funcionários
router.get("/", (req, res) =>
  funcionarioController.listarFuncionarios(req, res)
);

// Inativar funcionário
router.put("/:id/inativar", (req, res) =>
  funcionarioController.inativarFuncionario(req, res)
);

// Buscar funcionário por ID
router.get("/:id", (req, res) =>
  funcionarioController.buscarFuncionario(req, res)
);

// Atualizar funcionário
router.put("/:id", (req, res) =>
  funcionarioController.atualizarFuncionario(req, res)
);

// Deletar funcionário
router.delete("/:id", (req, res) =>
  funcionarioController.deletarFuncionario(req, res)
);

export default router;
