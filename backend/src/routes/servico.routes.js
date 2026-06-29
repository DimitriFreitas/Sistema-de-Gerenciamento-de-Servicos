import { Router } from "express";
import servicoController from "../controlers/servico.controler.js";

const router = Router();

// Criar serviço
router.post("/", (req, res) =>
  servicoController.criarServico(req, res)
);

// Listar todos os serviços
router.get("/", (req, res) =>
  servicoController.listarServicos(req, res)
);

// Inativar ou cancelar serviço
router.put("/:id/inativar", (req, res) =>
  servicoController.inativarServico(req, res)
);

// Buscar serviço por ID
router.get("/:id", (req, res) =>
  servicoController.buscarServico(req, res)
);

// Atualizar serviço
router.put("/:id", (req, res) =>
  servicoController.atualizarServico(req, res)
);

// Deletar serviço
router.delete("/:id", (req, res) =>
  servicoController.deletarServico(req, res)
);

export default router;
