function formatCurrency(value) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Nao informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "Nao informado";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeClientStatus(status) {
  return normalizeText(status) === "inativo" ? "Inativo" : "Ativo";
}

function getClientStatusTone(status) {
  return normalizeClientStatus(status) === "Inativo" ? "inativo" : "ativo";
}

function buildClientPayload(values) {
  return {
    nome: values.nome.trim(),
    email: values.email.trim(),
    telefone: values.telefone.trim(),
    cpf_cnpj: values.cpf_cnpj.trim(),
    status: normalizeText(values.status) === "inativo" ? "inativo" : "ativo",
  };
}

function buildProductPayload(values) {
  const payload = {
    nome: values.nome.trim(),
    descricao: values.descricao.trim(),
    custo: values.custo === "" ? undefined : Number(values.custo),
    preco: values.preco === "" ? undefined : Number(values.preco),
    quantidadeAtual: values.quantidadeAtual === "" ? 0 : Number(values.quantidadeAtual),
    quantidadeMinima: values.quantidadeMinima === "" ? undefined : Number(values.quantidadeMinima),
    dataValidade: values.dataValidade || undefined,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

export const moduleConfigs = {
  clientes: {
    key: "clientes",
    apiResource: "clientes",
    label: "Clientes",
    singularLabel: "cliente",
    basePath: "/clientes",
    contextLabel: "Cadastro e atendimento",

    routeMeta: {
      base: {
        eyebrow: "Modulo",
        label: "Clientes",
      },
      list: {
        eyebrow: "Consulta",
        label: "Consultar clientes",
      },
      create: {
        eyebrow: "Cadastro",
        label: "Novo cliente",
      },
      edit: {
        eyebrow: "Edicao",
        label: "Editar cliente",
      },
      deactivate: {
        eyebrow: "Inativacao",
        label: "Inativar cliente",
      },
    },
    actions: [
      {
        label: "Menu do modulo",
        path: "/clientes",
      },
      {
        label: "Consultar clientes",
        path: "/clientes/listar",
      },
      {
        label: "Novo cliente",
        path: "/clientes/novo",
      },
      {
        label: "Editar cliente",
        path: "/clientes/editar",
      },
      {
        label: "Inativar cliente",
        path: "/clientes/inativar",
      },
    ],
    list: {
      heroTitle: "Consultar clientes",
      heroDescription:
        "A consulta carrega os clientes do backend, permite filtrar por nome, documento e status e destaca o registro selecionado.",
      emptyState: "Nenhum cliente encontrado com os filtros aplicados.",
      filters: [
        { name: "nome", label: "Nome", placeholder: "Buscar por nome" },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "Filtrar por documento" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Todos", "Ativo", "Inativo"],
          defaultValue: "Todos",
        },
      ],
      columns: [
        {
          label: "Nome",
          render: (record) => record.nome || "Nao informado",
          sortValue: (record) => record.nome || "",
        },
        {
          label: "CPF / CNPJ",
          render: (record) => record.cpf_cnpj || "Nao informado",
          sortValue: (record) => record.cpf_cnpj || "",
        },
        {
          label: "Telefone",
          render: (record) => record.telefone || "Nao informado",
          sortValue: (record) => record.telefone || "",
        },
        {
          label: "Status",
          type: "status",
          sortValue: (record) => normalizeClientStatus(record.status),
          render: (record) => ({
            text: normalizeClientStatus(record.status),
            tone: getClientStatusTone(record.status),
          }),
        },
      ],
      matchesFilters(record, filters) {
        const status = normalizeClientStatus(record.status);

        return (
          normalizeText(record.nome).includes(normalizeText(filters.nome)) &&
          normalizeText(record.cpf_cnpj).includes(normalizeText(filters.cpf_cnpj)) &&
          (filters.status === "Todos" || status === filters.status)
        );
      },
      detailCard: {
        title: "Detalhes do cliente",
        description:
          "Os dados abaixo sao carregados diretamente da API para apoiar consulta, edicao e atualizacao de status.",
        tabs: ["Dados Cadastrais", "Contato", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Cliente", value: record.nome || "Nao informado" },
            { label: "Documento", value: record.cpf_cnpj || "Nao informado" },
            { label: "E-mail", value: record.email || "Nao informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar cliente",
      sideNotes: [
        "Os dados sao enviados diretamente para a API de clientes.",
        "Nome, e-mail e CPF ou CNPJ sao obrigatorios.",
        "Após salvar, a listagem pode ser consultada imediatamente.",
      ],
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome do cliente" },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "000.000.000-00 ou 00.000.000/0000-00" },
        { name: "email", label: "E-mail", type: "email", placeholder: "cliente@empresa.com" },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
      ],
      submitLabel: "Salvar cliente",
      successMessage: "Cliente cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/clientes/listar",
      toPayload(values) {
        return buildClientPayload({ ...values, status: "ativo" });
      },
    },
    edit: {
      heroTitle: "Editar cliente",
      heroDescription:
        "Edicao dos dados cadastrais do cliente selecionado com persistencia imediata na API.",
      sideNotes: [
        "Os campos sao preenchidos com os dados atuais do backend.",
        "O status pode ser ajustado nesta tela quando necessario.",
        "As alteracoes salvas ficam disponiveis imediatamente na listagem.",
      ],
      alert:
        "Selecione um cliente na consulta para abrir a edicao com o registro correto.",
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome do cliente" },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "000.000.000-00 ou 00.000.000/0000-00" },
        { name: "email", label: "E-mail", type: "email", placeholder: "cliente@empresa.com" },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
        },
      ],
      submitLabel: "Salvar alteracoes",
      successMessage: "Cliente atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/clientes/listar",
      toPayload(values) {
        return buildClientPayload(values);
      },
    },
    deactivate: {
      heroTitle: "Inativar cliente",
      heroDescription:
        "A inativacao atualiza o status do cliente para inativo sem remover o cadastro do banco.",
      warning:
        "Revise os dados do cliente antes de confirmar a inativacao. A alteracao sera persistida imediatamente na API.",
      optionalField: {
        label: "Observacao da inativacao",
        placeholder: "Registre uma observacao interna para referencia da equipe.",
      },
      actionButtons: [{ label: "Confirmar inativacao", variant: "danger", action: "confirm" }],
      successMessage: "Cliente inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Cliente", value: record.nome || "Nao informado" },
          { label: "Documento", value: record.cpf_cnpj || "Nao informado" },
          { label: "E-mail", value: record.email || "Nao informado" },
          { label: "Status atual", value: normalizeClientStatus(record.status) },
        ];
      },
      asyncAction: "update",
      buildPayload(record) {
        return {
          ...record,
          status: "inativo",
        };
      },
    },
  },
  produtos: {
    key: "produtos",
    apiResource: "produtos",
    label: "Produtos",
    singularLabel: "produto",
    basePath: "/produtos",
    contextLabel: "Estoque e cadastro",
    summary:
      "Modulo de produtos com consulta, cadastro, edicao e remocao integrados ao backend.",
    routeMeta: {
      base: {
        eyebrow: "Modulo",
        label: "Produtos",
        description: "Cadastro e consulta de produtos com dados reais do estoque.",
      },
      list: {
        eyebrow: "Consulta",
        label: "Consultar produtos",
        description: "Listagem do estoque com filtros e acoes do cadastro.",
      },
      create: {
        eyebrow: "Cadastro",
        label: "Novo produto",
        description: "Cadastro de produto com descricao, estoque e valores.",
      },
      edit: {
        eyebrow: "Edicao",
        label: "Editar produto",
        description: "Atualizacao dos dados do produto selecionado.",
      },
      deactivate: {
        eyebrow: "Inativacao",
        label: "Inativar produto",
        description: "Remocao do produto selecionado no cadastro atual.",
      },
    },
    actions: [
      {
        label: "Menu do modulo",
        path: "/produtos",
        description: "Resumo do modulo e atalhos para todas as operacoes.",
      },
      {
        label: "Consultar produtos",
        path: "/produtos/listar",
        description: "Listagem com filtros por nome, descricao e saldo de estoque.",
      },
      {
        label: "Novo produto",
        path: "/produtos/novo",
        description: "Cadastro com descricao, valores e quantidades.",
      },
      {
        label: "Editar produto",
        path: "/produtos/editar",
        description: "Atualizacao dos campos do produto selecionado.",
      },
      {
        label: "Inativar produto",
        path: "/produtos/inativar",
        description: "Remocao do produto selecionado no cadastro atual.",
      },
    ],
    list: {
      heroTitle: "Consultar produtos",
      heroDescription:
        "A consulta carrega os produtos do backend, permite filtrar por nome, descricao e faixa de estoque e destaca o item selecionado.",
      emptyState: "Nenhum produto encontrado com os filtros aplicados.",
      filters: [
        { name: "nome", label: "Nome", placeholder: "Buscar por nome" },
        { name: "descricao", label: "Descricao", placeholder: "Filtrar por descricao" },
        {
          name: "estoque",
          label: "Estoque",
          type: "select",
          options: ["Todos", "Disponivel", "Abaixo do minimo", "Sem estoque"],
          defaultValue: "Todos",
        },
      ],
      columns: [
        {
          label: "Nome",
          render: (record) => record.nome || "Nao informado",
          sortValue: (record) => record.nome || "",
        },
        {
          label: "Descricao",
          render: (record) => record.descricao || "Nao informado",
          sortValue: (record) => record.descricao || "",
        },
        {
          label: "Estoque atual",
          render: (record) => String(record.quantidadeAtual ?? 0),
          sortValue: (record) => Number(record.quantidadeAtual ?? 0),
        },
        {
          label: "Estoque minimo",
          render: (record) => String(record.quantidadeMinima ?? 0),
          sortValue: (record) => Number(record.quantidadeMinima ?? 0),
        },
        {
          label: "Custo",
          render: (record) => formatCurrency(record.custo),
          sortValue: (record) => Number(record.custo ?? 0),
        },
      ],
      matchesFilters(record, filters) {
        const currentAmount = Number(record.quantidadeAtual ?? 0);
        const minimumAmount = Number(record.quantidadeMinima ?? 0);
        const stockState =
          currentAmount <= 0
            ? "Sem estoque"
            : minimumAmount > 0 && currentAmount <= minimumAmount
              ? "Abaixo do minimo"
              : "Disponivel";

        return (
          normalizeText(record.nome).includes(normalizeText(filters.nome)) &&
          normalizeText(record.descricao).includes(normalizeText(filters.descricao)) &&
          (filters.estoque === "Todos" || stockState === filters.estoque)
        );
      },
      detailCard: {
        title: "Detalhes do produto",
        description:
          "Os dados abaixo sao carregados da API de produtos para apoiar consulta, edicao e exclusao do item.",
        tabs: ["Cadastro", "Estoque", "Valores"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Produto", value: record.nome || "Nao informado" },
            { label: "Descricao", value: record.descricao || "Nao informado" },
            { label: "Estoque atual", value: String(record.quantidadeAtual ?? 0) },
            { label: "Validade", value: formatDate(record.dataValidade) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar produto",
      heroDescription:
        "Formulario integrado ao backend para criar produtos com descricao, estoque e valores.",
      sideNotes: [
        "Os campos seguem o contrato atual da API de produtos.",
        "Custo, preco e quantidades aceitam apenas valores numericos.",
        "A data de validade e opcional.",
      ],
      fields: [
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar" },
        {
          name: "descricao",
          label: "Descricao",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0 },
        { name: "quantidadeMinima", label: "Quantidade minima", type: "number", placeholder: "0", min: 0 },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01" },
        { name: "preco", label: "Preco", type: "number", placeholder: "0.00", min: 0, step: "0.01" },
        { name: "dataValidade", label: "Data de validade", type: "date" },
      ],
      submitLabel: "Salvar produto",
      successMessage: "Produto cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/produtos/listar",
      toPayload(values) {
        return buildProductPayload(values);
      },
    },
    edit: {
      heroTitle: "Editar produto",
      heroDescription:
        "Edicao do produto selecionado com persistencia direta dos campos no backend.",
      sideNotes: [
        "Os campos sao preenchidos com os dados atuais do produto.",
        "Descricao, estoque e valores podem ser ajustados na mesma tela.",
        "As alteracoes salvas ficam visiveis imediatamente na consulta.",
      ],
      alert:
        "Selecione um produto na consulta para abrir a edicao com o registro correto.",
      fields: [
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar" },
        {
          name: "descricao",
          label: "Descricao",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0 },
        { name: "quantidadeMinima", label: "Quantidade minima", type: "number", placeholder: "0", min: 0 },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01" },
        { name: "preco", label: "Preco", type: "number", placeholder: "0.00", min: 0, step: "0.01" },
        { name: "dataValidade", label: "Data de validade", type: "date" },
      ],
      extraPanel: {
        title: "Resumo do cadastro",
        items: [
          "Atualize os dados do produto conforme a necessidade operacional.",
          "Os valores sao enviados para o backend no formato numerico.",
          "A consulta reflete as alteracoes salvas apos a resposta da API.",
        ],
      },
      submitLabel: "Salvar alteracoes",
      successMessage: "Produto atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/produtos/listar",
      toPayload(values) {
        return buildProductPayload(values);
      },
    },
    deactivate: {
      heroTitle: "Inativar produto",
      heroDescription:
        "No backend atual, a inativacao do produto e tratada como remocao do cadastro selecionado.",
      warning:
        "Revise os dados do produto antes de confirmar. A acao remove o item do backend atual.",
      optionalField: {
        label: "Observacao da inativacao",
        placeholder: "Registre uma observacao interna antes de remover o produto.",
      },
      actionButtons: [{ label: "Confirmar inativacao", variant: "danger", action: "confirm" }],
      successMessage: "Produto removido com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Produto", value: record.nome || "Nao informado" },
          { label: "Descricao", value: record.descricao || "Nao informado" },
          { label: "Estoque atual", value: String(record.quantidadeAtual ?? 0) },
          { label: "Validade", value: formatDate(record.dataValidade) },
        ];
      },
      asyncAction: "delete",
    },
  },
};

export const orderedModules = Object.values(moduleConfigs);

export function getInitialFormValues(fields, record = {}) {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.type === "date") {
        return [field.name, toDateInputValue(record[field.name]) || field.defaultValue || ""];
      }

      if (record[field.name] !== undefined && record[field.name] !== null) {
        return [field.name, String(record[field.name])];
      }

      return [field.name, field.defaultValue || ""];
    })
  );
}
