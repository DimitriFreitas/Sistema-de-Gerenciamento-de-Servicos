import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './src/config/database.js'

dotenv.config()

connectDB();

const server = express();

server.get('/menu', (req,res)=>{
    res.send('Bem vindo')
})

server.listen(3000,()=>{
    console.log('Servidor rodando')
})