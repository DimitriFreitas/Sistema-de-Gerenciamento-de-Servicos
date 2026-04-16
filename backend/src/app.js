import express from 'express'
//import produtosRoutes from './routes/produto.routes.js'
import clienteRoutes from './routes/cliente.routes.js'


const app =express()


app.use(express.json());

//app.use('/produtos',produtosRoutes);
app.use('/clientes',clienteRoutes);

export default app;
