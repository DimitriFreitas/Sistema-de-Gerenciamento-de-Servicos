import Produto from "../models/produto.js";
import express from "express";

class ProdutoController{

// Criar produto
async criarProduto(req,res){
    try{
    const produto = await Produto.create(req.body());
    return res.status(201).json(produto);
    }catch (erro){
        

    }

        
}
// Deletar produto

// Listar produto

// Atualizar produto
}


