# Sistema de Gerenciamento de Serviços

Projeto academico fullstack para gerenciamento de servicos em motores eletricos. A aplicacao permite consultar, cadastrar, editar, inativar ou remover registros pela interface web integrada a uma API Node.js com MongoDB.

## Equipe

- Allisson de Almeida Bento Viana
- Dimitri Alves Andrade Freitas
- Eduardo de Carvalho Reis
- Kauê Santos Fernandes

## Metodologia

O projeto foi desenvolvido em grupo utilizando Scrum, com divisão de entregas por módulos e evolução incremental das funcionalidades.

## Funcionalidades

- Cadastro, consulta, edicao e inativacao de clientes.
- Cadastro, consulta, edicao e inativacao de produtos.
- Cadastro, consulta, edicao e inativacao de fornecedores.
- Cadastro, consulta, edicao e inativacao de funcionarios.
- Registro, consulta, edicao e remocao de movimentacoes de estoque.
- Cadastro, consulta, edicao e cancelamento de servicos.
- Listagens com filtros e ordenação por coluna.
- Painel lateral de detalhes do registro selecionado.
- Comunicação entre frontend e backend por API HTTP.
- Persistência dos dados em MongoDB usando Mongoose.

## Stack

### Frontend

- React 19
- Vite 8
- React Router DOM 7
- ESLint 9

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- dotenv

### Desenvolvimento

- npm
- concurrently, para subir frontend e backend com um único comando

## Estrutura do projeto

```text
.
├── backend/              # API Express, modelos Mongoose e rotas HTTP
├── frontend/             # Interface React/Vite
├── package.json          # Scripts para rodar o projeto completo
└── README.md             # Visão geral do projeto
```

## Pré-requisitos

- Node.js 20 ou superior.
- npm disponível no terminal.
- Uma string de conexão MongoDB válida.

## Configuração inicial

Instale as dependências da raiz, do backend e do frontend:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Crie o arquivo de ambiente do backend:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com a sua conexão MongoDB:

```env
MONGO_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/NOME_DO_BANCO?retryWrites=true&w=majority
PORT=3000
```

## Como rodar tudo de uma vez

Na raiz do repositório:

```bash
npm run dev
```

Esse comando inicia:

- backend em `http://localhost:3000`
- frontend em `http://127.0.0.1:5173`

O frontend usa o proxy do Vite para encaminhar chamadas feitas em `/api` para o backend.

## Como rodar separadamente

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
```

## Scripts principais

### Raiz

- `npm run dev`: roda backend e frontend em modo desenvolvimento.
- `npm run start`: roda o backend com `start` e o frontend com Vite.

### Backend

- `npm --prefix backend run dev`: inicia a API com `node --watch`.
- `npm --prefix backend run start`: inicia a API com Node.

### Frontend

- `npm --prefix frontend run dev`: inicia o Vite.
- `npm --prefix frontend run build`: gera a build de produção.
- `npm --prefix frontend run preview`: serve a build localmente.
- `npm --prefix frontend run lint`: executa o ESLint.

## Rotas da API

As rotas REST principais seguem o mesmo padrao para `clientes`, `produtos`, `fornecedores`, `funcionarios`, `estoque` e `servicos`:

- `GET /<recurso>`
- `GET /<recurso>/:id`
- `POST /<recurso>`
- `PUT /<recurso>/:id`
- `DELETE /<recurso>/:id`

Rotas especializadas:

- `PUT /funcionarios/:id/inativar`
- `POST /estoque/ajuste`
- `POST /estoque/transferencia`
- `PUT /servicos/:id/inativar`

## Rotas do frontend

### Início

- `/`

### Clientes

- `/clientes`
- `/clientes/listar`
- `/clientes/novo`
- `/clientes/editar`
- `/clientes/inativar`

### Produtos

- `/produtos`
- `/produtos/listar`
- `/produtos/novo`
- `/produtos/editar`
- `/produtos/inativar`

### Fornecedores

- `/fornecedores`
- `/fornecedores/listar`
- `/fornecedores/novo`
- `/fornecedores/editar`
- `/fornecedores/inativar`

### Funcionarios

- `/funcionarios`
- `/funcionarios/listar`
- `/funcionarios/novo`
- `/funcionarios/editar`
- `/funcionarios/inativar`

### Estoque

- `/estoque`
- `/estoque/listar`
- `/estoque/novo`
- `/estoque/editar`
- `/estoque/inativar`

### Servicos

- `/servicos`
- `/servicos/listar`
- `/servicos/novo`
- `/servicos/editar`
- `/servicos/inativar`

## Documentação por módulo

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

## Observações

- `node_modules/`, `dist/`, `.env`, `.codex/` e `.omx/` são arquivos ou pastas locais e não devem ser versionados.
- O backend depende de `backend/.env`; sem `MONGO_URI`, o servidor não inicia.
- A interface inativa registros atualizando o campo `status`; os endpoints `DELETE` da API continuam disponíveis como remoção direta.
