import { Router } from "express";
import clienteController from "../controlers/cliente.controler.js";
 
const router = Router();
 
// Criar cliente
router.post("/", (req, res) =>
  clienteController.criarCliente(req, res)
);
 
// Listar todos os clientes
router.get("/", (req, res) =>
  clienteController.listarClientes(req, res)
);
 
// Buscar cliente por ID
router.get("/:id", (req, res) =>
  clienteController.buscarCliente(req, res)
);
 
// Atualizar cliente
router.put("/:id", (req, res) =>
  clienteController.atualizarCliente(req, res)
);
 
// Deletar cliente
router.delete("/:id", (req, res) =>
  clienteController.deletarCliente(req, res)
);
 
export default router;