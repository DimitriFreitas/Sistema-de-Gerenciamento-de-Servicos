import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: String,
  cpf: { type : String, required: true },
  status: { type: String, default: "ativo" },
});

export default mongoose.model("Cliente", clienteSchema);