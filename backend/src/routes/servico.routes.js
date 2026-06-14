import { Router } from "express";
import servicoController from "../controlers/servico.controler.js";

const router = Router();

// Criar servico
router.post("/", (req, res) =>
  servicoController.criarServico(req, res)
);

// Listar todos os servicos
router.get("/", (req, res) =>
  servicoController.listarServicos(req, res)
);

// Inativar ou cancelar servico
router.put("/:id/inativar", (req, res) =>
  servicoController.inativarServico(req, res)
);

// Buscar servico por ID
router.get("/:id", (req, res) =>
  servicoController.buscarServico(req, res)
);

// Atualizar servico
router.put("/:id", (req, res) =>
  servicoController.atualizarServico(req, res)
);

// Deletar servico
router.delete("/:id", (req, res) =>
  servicoController.deletarServico(req, res)
);

export default router;
