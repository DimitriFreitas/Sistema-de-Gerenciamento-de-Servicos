import mongoose from "mongoose";

const FornecedorSchema = new mongoose.Schema({
  razaoSocial: String,
  cnpj: String,
  status: { type: String, default: "ativo" }
});

export default mongoose.model("Fornecedor", FornecedorSchema);