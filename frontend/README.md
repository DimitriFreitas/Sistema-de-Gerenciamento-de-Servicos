# Frontend

Interface web do Sistema de Gerenciamento de Serviços. Esta pasta concentra a aplicação React responsável pelos módulos de clientes, produtos, fornecedores, funcionários, estoque e serviços.

## Stack

- React 19
- React DOM 19
- React Router DOM 7
- Vite 8
- ESLint 9

## Responsabilidade

O frontend oferece uma interface navegável para:

- abrir o painel inicial do sistema;
- acessar os módulos de clientes, produtos, fornecedores, funcionários, estoque e serviços;
- consultar registros vindos do backend;
- filtrar e ordenar listagens;
- visualizar detalhes do item selecionado;
- cadastrar novos registros;
- editar registros existentes;
- inativar clientes, produtos, fornecedores e funcionários;
- registrar e remover movimentações de estoque;
- cadastrar, editar e cancelar serviços.

## Estrutura

```text
frontend/
├── public/                 # Arquivos estáticos servidos pelo Vite
├── src/
│   ├── components/         # Componentes reutilizáveis e telas CRUD genéricas
│   ├── config/             # Metadados de navegação
│   ├── data/               # Configuração dos módulos
│   ├── layouts/            # Estrutura principal da aplicação
│   ├── lib/                # Cliente HTTP, formatadores e validações auxiliares
│   ├── pages/              # Página inicial
│   ├── routes/             # Rotas da aplicação
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Entrada do React
│   └── styles.css          # Estilos globais
├── index.html              # HTML base do Vite
├── package.json            # Dependências e scripts
└── vite.config.js          # Configuração do Vite e proxy da API
```

## Fluxo da aplicação

1. `src/main.jsx` renderiza a aplicação no `index.html`.
2. `src/App.jsx` carrega as rotas principais.
3. `src/routes/AppRoutes.jsx` define as telas disponíveis.
4. `src/layouts/MainLayout.jsx` organiza sidebar, cabeçalho e área de conteúdo.
5. Os componentes CRUD recebem as configurações de `src/data/moduleConfigs.js`.
6. As chamadas HTTP são centralizadas em `src/lib/api.js`.

## Organização dos módulos

O arquivo `src/data/moduleConfigs.js` centraliza o comportamento visual e funcional dos módulos:

- textos de navegação;
- caminhos das rotas;
- filtros;
- colunas das tabelas;
- campos dos formulários;
- montagem dos dados enviados para a API;
- mensagens de sucesso;
- dados exibidos nos painéis laterais.

Esse padrão permite reaproveitar os mesmos componentes CRUD para módulos diferentes.

## Componentes principais

- `CrudModulePage.jsx`: tela inicial de um módulo.
- `CrudListPage.jsx`: listagem com filtros, ordenação e painel de detalhes.
- `CrudFormPage.jsx`: cadastro e edição.
- `CrudDeactivatePage.jsx`: confirmação de inativação.
- `ModuleActionNav.jsx`: navegação interna do módulo.
- `Header.jsx`: cabeçalho dinâmico.
- `Sidebar.jsx`: menu lateral.

## Comunicação com o backend

O frontend chama a API usando `src/lib/api.js`.

Por padrão, a base da API é `/api`. Em desenvolvimento, o `vite.config.js` encaminha essas requisições para:

```text
http://localhost:3000
```

Exemplo do fluxo:

```text
Frontend chama /api/clientes
Vite redireciona para http://localhost:3000/clientes
Backend responde com JSON
Tela atualiza a listagem
```

Se necessário, a base pode ser alterada com a variável:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Rotas

- `/`
- `/clientes`, `/clientes/listar`, `/clientes/novo`, `/clientes/editar`, `/clientes/inativar`
- `/produtos`, `/produtos/listar`, `/produtos/novo`, `/produtos/editar`, `/produtos/inativar`
- `/fornecedores`, `/fornecedores/listar`, `/fornecedores/novo`, `/fornecedores/editar`, `/fornecedores/inativar`
- `/funcionarios`, `/funcionarios/listar`, `/funcionarios/novo`, `/funcionarios/editar`, `/funcionarios/inativar`
- `/estoque`, `/estoque/listar`, `/estoque/novo`, `/estoque/editar`, `/estoque/inativar`
- `/servicos`, `/servicos/listar`, `/servicos/novo`, `/servicos/editar`, `/servicos/inativar`

Rotas desconhecidas redirecionam para `/`.

## Como instalar

Dentro de `frontend/`:

```bash
npm install
```

Ou a partir da raiz:

```bash
npm --prefix frontend install
```

## Como rodar

Dentro de `frontend/`:

```bash
npm run dev
```

Ou a partir da raiz:

```bash
npm --prefix frontend run dev
```

O Vite normalmente disponibiliza a aplicação em:

```text
http://127.0.0.1:5173
```

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a build de produção em `dist/`.
- `npm run preview`: serve a build de produção localmente.
- `npm run lint`: executa o ESLint.

## Como alterar conteúdo das telas

Para alterar textos, campos, filtros, colunas ou regras de montagem de payload, comece por:

```text
src/data/moduleConfigs.js
```

Para alterar estrutura visual reutilizável, use:

```text
src/components/
```

Para alterar cores, espaçamentos, tabelas, cards e responsividade, use:

```text
src/styles.css
```

## Validação recomendada

Antes de enviar mudanças:

```bash
npm run lint
npm run build
```

Ou a partir da raiz:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```
