import { Router } from "express";
import funcionarioController from "../controlers/funcionario.controler.js";

const router = Router();

// Criar funcionario
router.post("/", (req, res) =>
  funcionarioController.criarFuncionario(req, res)
);

// Listar todos os funcionarios
router.get("/", (req, res) =>
  funcionarioController.listarFuncionarios(req, res)
);

// Inativar funcionario
router.put("/:id/inativar", (req, res) =>
  funcionarioController.inativarFuncionario(req, res)
);

// Buscar funcionario por ID
router.get("/:id", (req, res) =>
  funcionarioController.buscarFuncionario(req, res)
);

// Atualizar funcionario
router.put("/:id", (req, res) =>
  funcionarioController.atualizarFuncionario(req, res)
);

// Deletar funcionario
router.delete("/:id", (req, res) =>
  funcionarioController.deletarFuncionario(req, res)
);

export default router;
