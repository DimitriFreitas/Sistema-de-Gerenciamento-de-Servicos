# Guia do Frontend

Esta pasta contém o frontend em React + Vite do projeto. No estado atual, ela está focada na entrega visual da Sprint 1 para os módulos de `Clientes` e `Produtos`, com navegação responsiva e fluxos CRUD simulados.

Hoje, o frontend está em um estágio visual:

- layout, rotas e navegação já foram implementados
- telas de CRUD de `Clientes` e `Produtos` já existem
- os dados ainda são mockados no próprio frontend
- a integração com o backend ainda não foi conectada

## Stack utilizada

- React 19
- Vite 8
- React Router DOM 7
- ESLint 9

## Pré-requisitos

- Node.js 20+ recomendado
- npm disponível no terminal

## Como iniciar

A partir da raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

O Vite vai iniciar o servidor local de desenvolvimento e mostrar a URL no terminal, normalmente `http://localhost:5173`.

## Scripts disponíveis

Execute os comandos abaixo dentro de `frontend/`.

### `npm run dev`

Inicia o servidor de desenvolvimento com hot reload.

### `npm run build`

Gera a versão de produção em `frontend/dist/`.

### `npm run preview`

Serve localmente a build de produção após `npm run build`.

### `npm run lint`

Executa o ESLint em todo o código do frontend.

## Estrutura da pasta

```text
frontend/
├── public/                 # Arquivos estáticos usados pelo Vite
├── src/
│   ├── components/         # Blocos reutilizáveis e páginas CRUD genéricas
│   ├── config/             # Metadados de navegação e rotas
│   ├── data/               # Configuração mockada dos módulos ativos
│   ├── layouts/            # Layout principal da aplicação
│   ├── pages/              # Páginas de topo usadas pelas rotas
│   ├── routes/             # Definição do roteamento
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Bootstrap do React
│   └── styles.css          # Estilos globais da aplicação
├── index.html              # Entrada HTML do Vite
├── package.json
└── README.md
```

## Como o frontend está organizado

### Fluxo de entrada

A aplicação começa nestes arquivos:

- `src/main.jsx`: monta o React no DOM
- `src/App.jsx`: carrega o roteador principal
- `src/routes/AppRoutes.jsx`: define todas as rotas do frontend

### Layout

O shell principal da aplicação está em:

- `src/layouts/MainLayout.jsx`
- `src/components/Header.jsx`
- `src/components/Sidebar.jsx`
- `src/config/navigation.js`

Essa camada cuida de:

- comportamento responsivo da sidebar
- títulos e descrições dinâmicas no cabeçalho, conforme a rota
- navegação principal entre os módulos

### Configuração dos módulos

O comportamento dos módulos ativos está centralizado em:

- `src/data/moduleConfigs.js`

Esse arquivo é a fonte principal para:

- módulos ativos
- labels e descrições das rotas
- textos dos botões
- linhas mockadas das tabelas
- campos dos formulários
- painéis laterais de detalhes
- fluxo visual de inativação

Se o objetivo for alterar o conteúdo visual de `Clientes` ou `Produtos`, esse é o primeiro arquivo a revisar.

### Telas CRUD reutilizáveis

As páginas dos módulos foram montadas com componentes genéricos:

- `CrudModulePage.jsx`: página inicial do módulo
- `CrudListPage.jsx`: tela de listagem com painel lateral
- `CrudFormPage.jsx`: tela base de cadastro e edição
- `CrudDeactivatePage.jsx`: tela de confirmação de inativação
- `ModuleActionNav.jsx`: navegação interna do módulo

Isso permite manter consistência visual entre `Clientes` e `Produtos`.

## Rotas ativas

O roteamento atual expõe estes caminhos principais:

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

Rotas desconhecidas redirecionam para `/`.

## Comportamento atual

Hoje o frontend funciona como um protótipo navegável, não como uma aplicação totalmente integrada.

O que já funciona:

- layout responsivo
- navegação lateral e cabeçalho dinâmico
- transição entre telas por rota
- estrutura CRUD de `Clientes` e `Produtos`
- formulários, tabelas e painéis com dados simulados

O que ainda não foi implementado:

- chamadas reais para o backend
- persistência de cadastro, edição e inativação
- regras reais de validação
- tratamento de erros da API
- estados de carregamento ligados a requisições reais

## Como alterar a interface

### Alterar textos e conteúdo dos módulos

Edite:

- `src/data/moduleConfigs.js`

Use esse arquivo para alterar:

- labels
- descrições
- dados mockados
- campos dos formulários
- textos de ações e botões

### Alterar a navegação global

Edite:

- `src/config/navigation.js`
- `src/components/Sidebar.jsx`
- `src/components/Header.jsx`

### Alterar layout e comportamento da estrutura principal

Edite:

- `src/layouts/MainLayout.jsx`
- `src/styles.css`

### Alterar o visual da aplicação

Grande parte da aparência está concentrada em:

- `src/styles.css`

Esse arquivo define:

- grids de layout
- botões
- cards
- tabelas
- breakpoints responsivos
- cores e variáveis visuais em `:root`

## Como adicionar um novo módulo

Para adicionar um novo módulo seguindo o padrão atual:

1. Adicione um novo objeto dentro de `src/data/moduleConfigs.js`.
2. Defina `basePath`, `routeMeta`, `actions` e as configurações de `list`, `create`, `edit` e `deactivate`.
3. Inclua esse módulo em `orderedModules` caso ele deva aparecer na navegação.
4. Registre as novas rotas em `src/routes/AppRoutes.jsx`.
5. Ajuste `src/config/navigation.js` se o módulo precisar aparecer no menu principal.

A estrutura atual é orientada por configuração, então o ideal é reutilizar os componentes CRUD existentes em vez de duplicar páginas novas do zero.

## Caminho recomendado para integração com o backend

Quando chegar a hora de integrar de verdade:

1. Mantenha `moduleConfigs.js` apenas para conteúdo estático de interface.
2. Tire as linhas mockadas e os detalhes fixos da configuração.
3. Crie serviços ou funções para consumir a API de `Clientes` e `Produtos`.
4. Substitua os botões visuais por ações reais de envio.
5. Adicione estados de carregamento, sucesso e erro.
6. Adicione validações coerentes com os requisitos funcionais.

## Observações sobre arquivos já existentes

Existem arquivos em `src/pages/` que parecem ser legados ou não fazem parte do fluxo principal atual:

- `src/pages/Clientes.jsx`
- `src/pages/Produtos.jsx`
- `src/pages/ModuloPlaceholder.jsx`

No fluxo roteado atual, o caminho principal usa:

- `src/pages/Home.jsx`
- os componentes CRUD reutilizáveis dentro de `src/components/`

Antes de remover qualquer arquivo antigo, vale confirmar se ninguém do grupo ainda depende deles.

## Fluxo de trabalho recomendado

Para desenvolvimento normal do frontend:

1. Rode `npm run dev`.
2. Se a mudança for de conteúdo, ajuste primeiro `src/data/moduleConfigs.js`.
3. Se a mudança for estrutural ou visual, ajuste `src/components/`, `src/layouts/`, `src/config/` ou `src/styles.css`.
4. Rode `npm run lint`.
5. Rode `npm run build` antes de subir alterações.

## Escopo atual do frontend

Hoje esta pasta representa:

- um shell responsivo de aplicação
- fluxos visuais da Sprint 1 para `Clientes`
- fluxos visuais da Sprint 1 para `Produtos`
- uma base pronta para começar a integração com o backend

Ela ainda não representa um frontend totalmente finalizado para produção.
