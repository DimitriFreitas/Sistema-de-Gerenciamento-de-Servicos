# Backend

API do Sistema de Gerenciamento de Servicos. Esta pasta concentra o servidor Express, a conexao com MongoDB e os modelos usados pelos modulos de clientes, produtos, fornecedores, funcionarios, estoque e servicos.

## Stack

- Node.js
- Express 5
- MongoDB
- Mongoose
- dotenv

## Responsabilidade

O backend fornece endpoints HTTP para:

- criar, listar, buscar, atualizar e remover clientes;
- criar, listar, buscar, atualizar e remover produtos;
- criar, listar, buscar, atualizar e remover fornecedores;
- criar, listar, buscar, atualizar, inativar e remover funcionarios;
- registrar, listar, buscar, atualizar, ajustar, transferir e remover movimentacoes de estoque;
- criar, listar, buscar, atualizar, cancelar e remover servicos.

## Estrutura

```text
backend/
├── src/
│   ├── config/             # Configuração de banco de dados
│   ├── controlers/         # Controllers dos modulos
│   ├── models/             # Schemas Mongoose
│   ├── routes/             # Rotas HTTP da API
│   └── app.js              # Aplicação Express
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
└── server.js               # Entrada do servidor
```

## Configuração de ambiente

Crie o arquivo `.env` dentro de `backend/`:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
MONGO_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/NOME_DO_BANCO?retryWrites=true&w=majority
PORT=3000
```

`MONGO_URI` é obrigatória. Sem ela, o servidor encerra a inicialização com erro.

## Como instalar

Dentro de `backend/`:

```bash
npm install
```

Ou a partir da raiz:

```bash
npm --prefix backend install
```

## Como rodar

Dentro de `backend/`:

```bash
npm run dev
```

Ou a partir da raiz:

```bash
npm --prefix backend run dev
```

Por padrão, a API sobe em:

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: inicia o servidor com `node --watch`.
- `npm run start`: inicia o servidor com Node.

## Endpoints

As rotas REST principais seguem este padrao para `clientes`, `produtos`, `fornecedores`, `funcionarios`, `estoque` e `servicos`:

```text
GET    /<recurso>
GET    /<recurso>/:id
POST   /<recurso>
PUT    /<recurso>/:id
DELETE /<recurso>/:id
```

Rotas especializadas:

```text
PUT    /funcionarios/:id/inativar
POST   /estoque/ajuste
POST   /estoque/transferencia
PUT    /servicos/:id/inativar
```

## Modelos principais

### Cliente

Campos usados pelo módulo:

- `nome`
- `email`
- `telefone`
- `cpf_cnpj`
- `status`

### Produto

Campos usados pelo módulo:

- `nome`
- `descricao`
- `custo`
- `preco`
- `quantidadeAtual`
- `quantidadeMinima`
- `dataValidade`
- `status`

### Fornecedor

Campos usados pelo modulo:

- `razaoSocial`
- `nomeFantasia`
- `cnpj`
- `telefone`
- `email`
- `endereco`
- `status`

### Funcionario

Campos usados pelo modulo:

- `nome`
- `cpf`
- `rg`
- `email`
- `telefone`
- `cargo`
- `setor`
- `tipoVinculo`
- `permissoes`
- `status`

### Estoque

Campos usados pelo modulo:

- `produto`
- `fornecedor`
- `tipo`
- `quantidade`
- `valorUnitario`
- `localOrigem`
- `localDestino`
- `responsavel`
- `motivo`

### Servico

Campos usados pelo modulo:

- `cliente`
- `tipo`
- `descricao`
- `dataAgendamento`
- `equipe`
- `produtosUtilizados`
- `valorMaoDeObra`
- `valorTotal`
- `status`

## Integração com o frontend

Durante o desenvolvimento, o frontend chama `/api/...`. O proxy do Vite remove o prefixo `/api` e encaminha a requisição para o backend.

Exemplo:

```text
/api/produtos -> http://localhost:3000/produtos
```

Por isso, para usar o sistema completo em desenvolvimento, mantenha o backend rodando na porta configurada em `PORT`, normalmente `3000`.
