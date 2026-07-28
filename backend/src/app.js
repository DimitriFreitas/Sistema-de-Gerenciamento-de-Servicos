import express from 'express'
import produtosRoutes from './routes/produto.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import fornecedorRoutes from './routes/fornecedor.routes.js'
import estoqueRoutes from './routes/estoque.routes.js'
import funcionarioRoutes from './routes/funcionario.routes.js'
import servicoRoutes from './routes/servico.routes.js'


const app =express()


app.use(express.json());

app.use('/produtos',produtosRoutes);
app.use('/clientes',clienteRoutes);
app.use('/fornecedores',fornecedorRoutes);
app.use('/estoque',estoqueRoutes);
app.use('/funcionarios',funcionarioRoutes);
app.use('/servicos',servicoRoutes);

export default app;
