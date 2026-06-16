import {
  formatCpfCnpj,
  formatPhone,
  isValidCpfCnpj,
  isValidPhone,
  onlyDigits,
} from "../lib/formatters";

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
    telefone: formatPhone(values.telefone),
    cpf_cnpj: formatCpfCnpj(values.cpf_cnpj),
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
    status: normalizeText(values.status) === "inativo" ? "inativo" : "ativo",
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

function getRecordLabel(record, fields = ["nome", "razaoSocial", "nomeFantasia", "tipo"]) {
  if (!record) {
    return "Nao informado";
  }

  for (const field of fields) {
    if (record[field]) {
      return record[field];
    }
  }

  return record._id || "Nao informado";
}

function getReferenceLabel(reference, fields) {
  if (!reference) {
    return "Nao informado";
  }

  if (typeof reference === "object") {
    return getRecordLabel(reference, fields);
  }

  return reference;
}

function toId(value) {
  if (value && typeof value === "object") {
    return value._id || value.id || "";
  }

  return String(value ?? "").trim();
}

function toOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== undefined && value !== "";
    })
  );
}

function parseList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProductsUsed(products) {
  return (Array.isArray(products) ? products : []).map((item) =>
    compactPayload({
      produto: toId(item.produto),
      quantidade: toOptionalNumber(item.quantidade),
      localOrigem: String(item.localOrigem ?? "").trim(),
      valorUnitario: toOptionalNumber(item.valorUnitario),
    })
  );
}

function formatReferenceList(value) {
  return Array.isArray(value) ? value.map(toId) : [];
}

function formatProductItems(value) {
  return (Array.isArray(value) ? value : []).map((item) => ({
    produto: toId(item.produto),
    quantidade: item.quantidade ?? 1,
    localOrigem: item.localOrigem ?? "",
    valorUnitario: item.valorUnitario ?? "",
  }));
}

function normalizeStatusPayload(status) {
  return normalizeText(status) === "inativo" ? "inativo" : "ativo";
}

function formatMovementType(type) {
  const normalizedType = normalizeText(type);

  if (normalizedType === "saida") {
    return "Saida";
  }

  if (normalizedType === "ajuste") {
    return "Ajuste";
  }

  if (normalizedType === "transferencia") {
    return "Transferencia";
  }

  return "Entrada";
}

function normalizeMovementType(type) {
  const normalizedType = normalizeText(type);

  if (normalizedType === "saida") {
    return "saida";
  }

  if (normalizedType === "ajuste") {
    return "ajuste";
  }

  if (normalizedType === "transferencia") {
    return "transferencia";
  }

  return "entrada";
}

function formatServiceStatus(status) {
  const normalizedStatus = normalizeText(status);

  if (normalizedStatus === "em_andamento") {
    return "Em andamento";
  }

  if (normalizedStatus === "concluido") {
    return "Concluido";
  }

  if (normalizedStatus === "cancelado") {
    return "Cancelado";
  }

  if (normalizedStatus === "inativo") {
    return "Inativo";
  }

  return "Agendado";
}

function normalizeServiceStatus(status) {
  const normalizedStatus = normalizeText(status).replaceAll(" ", "_");

  if (normalizedStatus === "em_andamento") {
    return "em_andamento";
  }

  if (normalizedStatus === "concluido") {
    return "concluido";
  }

  if (normalizedStatus === "cancelado") {
    return "cancelado";
  }

  if (normalizedStatus === "inativo") {
    return "inativo";
  }

  return "agendado";
}

function getServiceStatusTone(status) {
  const normalizedStatus = normalizeServiceStatus(status);

  if (normalizedStatus === "concluido") {
    return "ativo";
  }

  if (normalizedStatus === "cancelado" || normalizedStatus === "inativo") {
    return "inativo";
  }

  return "pendente";
}

function buildSupplierPayload(values) {
  return compactPayload({
    razaoSocial: values.razaoSocial.trim(),
    nomeFantasia: values.nomeFantasia.trim(),
    cnpj: formatCpfCnpj(values.cnpj),
    telefone: formatPhone(values.telefone),
    email: values.email.trim(),
    endereco: values.endereco.trim(),
    status: normalizeStatusPayload(values.status),
  });
}

function buildEmployeePayload(values) {
  return compactPayload({
    nome: values.nome.trim(),
    cpf: formatCpfCnpj(values.cpf),
    rg: values.rg.trim(),
    email: values.email.trim(),
    telefone: formatPhone(values.telefone),
    endereco: values.endereco.trim(),
    cargo: values.cargo.trim(),
    setor: values.setor.trim(),
    tipoVinculo: values.tipoVinculo.trim(),
    permissoes: parseList(values.permissoes),
    dataAdmissao: values.dataAdmissao || undefined,
    status: normalizeStatusPayload(values.status),
  });
}

function buildStockPayload(values) {
  const tipo = normalizeMovementType(values.tipo);

  return compactPayload({
    produto: toId(values.produto),
    fornecedor: toId(values.fornecedor),
    tipo,
    quantidade: toOptionalNumber(values.quantidade),
    valorUnitario: toOptionalNumber(values.valorUnitario),
    localOrigem: values.localOrigem.trim(),
    localDestino: values.localDestino.trim(),
    quantidadeNova: tipo === "ajuste" ? toOptionalNumber(values.quantidadeNova) : undefined,
    responsavel: values.responsavel.trim(),
    motivo: values.motivo.trim(),
    observacao: values.observacao.trim(),
  });
}

function buildServicePayload(values) {
  const produtosUtilizados = normalizeProductsUsed(values.produtosUtilizados);
  const valorProdutos = produtosUtilizados.reduce(
    (total, item) => total + Number(item.quantidade ?? 0) * Number(item.valorUnitario ?? 0),
    0
  );
  const valorMaoDeObra = toOptionalNumber(values.valorMaoDeObra);

  return compactPayload({
    cliente: toId(values.cliente),
    tipo: values.tipo.trim(),
    descricao: values.descricao.trim(),
    dataAgendamento: values.dataAgendamento || undefined,
    dataInicio: values.dataInicio || undefined,
    dataConclusao: values.dataConclusao || undefined,
    garantiaAte: values.garantiaAte || undefined,
    equipe: Array.isArray(values.equipe) ? values.equipe.map(toId).filter(Boolean) : parseList(values.equipe),
    produtosUtilizados,
    valorMaoDeObra,
    valorProdutos,
    valorTotal: Number(valorMaoDeObra ?? 0) + valorProdutos,
    status: normalizeServiceStatus(values.status),
    responsavel: values.responsavel.trim(),
    observacao: values.observacao.trim(),
  });
}

function requiredMessage(label) {
  return `${label} e obrigatorio.`;
}

function validateRequired(value, label) {
  return String(value ?? "").trim() ? "" : requiredMessage(label);
}

function validateEmail(value) {
  const trimmedValue = String(value ?? "").trim();

  if (!trimmedValue) {
    return requiredMessage("E-mail");
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
    ? ""
    : "Informe um e-mail valido.";
}

function validateCpfCnpj(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CPF ou CNPJ");
  }

  if (digits.length !== 11 && digits.length !== 14) {
    return "Informe 11 digitos para CPF ou 14 digitos para CNPJ.";
  }

  return isValidCpfCnpj(value) ? "" : "CPF ou CNPJ invalido.";
}

function validateCpf(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CPF");
  }

  if (digits.length !== 11) {
    return "Informe 11 digitos para CPF.";
  }

  return isValidCpfCnpj(value) ? "" : "CPF invalido.";
}

function validateCnpj(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CNPJ");
  }

  if (digits.length !== 14) {
    return "Informe 14 digitos para CNPJ.";
  }

  return isValidCpfCnpj(value) ? "" : "CNPJ invalido.";
}

function validatePhone(value) {
  if (!String(value ?? "").trim()) {
    return "";
  }

  return isValidPhone(value) ? "" : "Informe um telefone com DDD e 10 ou 11 digitos.";
}

function validateNonNegativeNumber(value, label, { required = false } = {}) {
  if (value === "" || value === null || value === undefined) {
    return required ? requiredMessage(label) : "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return `${label} deve ser um numero valido.`;
  }

  return number >= 0 ? "" : `${label} nao pode ser negativo.`;
}

function validateProductDate(value) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? "Informe uma data valida." : "";
}

function validateProductItems(value) {
  const rows = Array.isArray(value) ? value : [];

  for (const row of rows) {
    if (!toId(row.produto)) {
      return "Selecione o produto ou remova a linha vazia.";
    }

    if (!Number(row.quantidade) || Number(row.quantidade) < 1) {
      return "Informe quantidade maior que zero para cada produto.";
    }

    if (row.valorUnitario !== "" && row.valorUnitario !== undefined && Number(row.valorUnitario) < 0) {
      return "Valor unitario nao pode ser negativo.";
    }
  }

  return "";
}

export const moduleConfigs = {
  clientes: {
    key: "clientes",
    apiResource: "clientes",
    label: "Clientes",
    singularLabel: "cliente",
    basePath: "/clientes",
    contextLabel: "Cadastro e atendimento",
    summary:
      "Modulo de clientes com consulta, cadastro, edicao e inativacao integrados ao backend.",

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
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "Filtrar por CPF/CNPJ" },
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
          render: (record) => formatCpfCnpj(record.cpf_cnpj) || "Nao informado",
          sortValue: (record) => record.cpf_cnpj || "",
        },
        {
          label: "Telefone",
          render: (record) => formatPhone(record.telefone) || "Nao informado",
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
          onlyDigits(record.cpf_cnpj).includes(onlyDigits(filters.cpf_cnpj)) &&
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
            { label: "Documento", value: formatCpfCnpj(record.cpf_cnpj) || "Nao informado" },
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
        { name: "nome", label: "Nome", placeholder: "Informe o nome do cliente", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "000.000.000-00 ou 00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCpfCnpj },
        { name: "email", label: "E-mail", type: "email", placeholder: "cliente@empresa.com", validate: validateEmail },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
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
        { name: "nome", label: "Nome", placeholder: "Informe o nome do cliente", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf_cnpj", label: "CPF / CNPJ", placeholder: "000.000.000-00 ou 00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCpfCnpj },
        { name: "email", label: "E-mail", type: "email", placeholder: "cliente@empresa.com", validate: validateEmail },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
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
          { label: "Documento", value: formatCpfCnpj(record.cpf_cnpj) || "Nao informado" },
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
      "Modulo de produtos com consulta, cadastro, edicao e inativacao integrados ao backend.",
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
        description: "Atualizacao do status do produto selecionado.",
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
        description: "Atualizacao do status do produto selecionado.",
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
        const currentAmount = Number(record.quantidadeAtual ?? 0);
        const minimumAmount = Number(record.quantidadeMinima ?? 0);
        const stockState =
          currentAmount <= 0
            ? "Sem estoque"
            : minimumAmount > 0 && currentAmount <= minimumAmount
              ? "Abaixo do minimo"
              : "Disponivel";
        const status = normalizeClientStatus(record.status);

        return (
          normalizeText(record.nome).includes(normalizeText(filters.nome)) &&
          normalizeText(record.descricao).includes(normalizeText(filters.descricao)) &&
          (filters.estoque === "Todos" || stockState === filters.estoque) &&
          (filters.status === "Todos" || status === filters.status)
        );
      },
      detailCard: {
        title: "Detalhes do produto",
        description:
          "Os dados abaixo sao carregados da API de produtos para apoiar consulta, edicao e atualizacao de status.",
        tabs: ["Cadastro", "Estoque", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Produto", value: record.nome || "Nao informado" },
            { label: "Descricao", value: record.descricao || "Nao informado" },
            { label: "Estoque atual", value: String(record.quantidadeAtual ?? 0) },
            { label: "Validade", value: formatDate(record.dataValidade) },
            { label: "Status", value: normalizeClientStatus(record.status) },
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
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar", validate: (value) => validateRequired(value, "Nome do produto") },
        {
          name: "descricao",
          label: "Descricao",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
          validate: (value) => validateRequired(value, "Descricao"),
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade atual") },
        { name: "quantidadeMinima", label: "Quantidade minima", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade minima") },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Custo") },
        { name: "preco", label: "Preco", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Preco") },
        { name: "dataValidade", label: "Data de validade", type: "date", validate: validateProductDate },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
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
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar", validate: (value) => validateRequired(value, "Nome do produto") },
        {
          name: "descricao",
          label: "Descricao",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
          validate: (value) => validateRequired(value, "Descricao"),
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade atual") },
        { name: "quantidadeMinima", label: "Quantidade minima", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade minima") },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Custo") },
        { name: "preco", label: "Preco", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Preco") },
        { name: "dataValidade", label: "Data de validade", type: "date", validate: validateProductDate },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
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
        "A inativacao atualiza o status do produto para inativo sem remover o cadastro do banco.",
      warning:
        "Revise os dados do produto antes de confirmar. A alteracao sera persistida imediatamente na API.",
      optionalField: {
        label: "Observacao da inativacao",
        placeholder: "Registre uma observacao interna antes de inativar o produto.",
      },
      actionButtons: [{ label: "Confirmar inativacao", variant: "danger", action: "confirm" }],
      successMessage: "Produto inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Produto", value: record.nome || "Nao informado" },
          { label: "Descricao", value: record.descricao || "Nao informado" },
          { label: "Estoque atual", value: String(record.quantidadeAtual ?? 0) },
          { label: "Validade", value: formatDate(record.dataValidade) },
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
  fornecedores: {
    key: "fornecedores",
    apiResource: "fornecedores",
    label: "Fornecedores",
    singularLabel: "fornecedor",
    basePath: "/fornecedores",
    contextLabel: "Compras e suprimentos",
    summary:
      "Modulo de fornecedores com cadastro, consulta, edicao e inativacao de parceiros.",
    routeMeta: {
      base: { eyebrow: "Modulo", label: "Fornecedores" },
      list: { eyebrow: "Consulta", label: "Consultar fornecedores" },
      create: { eyebrow: "Cadastro", label: "Novo fornecedor" },
      edit: { eyebrow: "Edicao", label: "Editar fornecedor" },
      deactivate: { eyebrow: "Inativacao", label: "Inativar fornecedor" },
    },
    actions: [
      { label: "Menu do modulo", path: "/fornecedores" },
      { label: "Consultar fornecedores", path: "/fornecedores/listar" },
      { label: "Novo fornecedor", path: "/fornecedores/novo" },
      { label: "Editar fornecedor", path: "/fornecedores/editar" },
      { label: "Inativar fornecedor", path: "/fornecedores/inativar" },
    ],
    list: {
      heroTitle: "Consultar fornecedores",
      emptyState: "Nenhum fornecedor encontrado com os filtros aplicados.",
      filters: [
        { name: "razaoSocial", label: "Razao social", placeholder: "Buscar por razao social" },
        { name: "cnpj", label: "CNPJ", placeholder: "Filtrar por CNPJ" },
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
          label: "Razao social",
          render: (record) => record.razaoSocial || "Nao informado",
          sortValue: (record) => record.razaoSocial || "",
        },
        {
          label: "Nome fantasia",
          render: (record) => record.nomeFantasia || "Nao informado",
          sortValue: (record) => record.nomeFantasia || "",
        },
        {
          label: "CNPJ",
          render: (record) => formatCpfCnpj(record.cnpj) || "Nao informado",
          sortValue: (record) => record.cnpj || "",
        },
        {
          label: "Telefone",
          render: (record) => formatPhone(record.telefone) || "Nao informado",
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
          normalizeText(record.razaoSocial).includes(normalizeText(filters.razaoSocial)) &&
          onlyDigits(record.cnpj).includes(onlyDigits(filters.cnpj)) &&
          (filters.status === "Todos" || status === filters.status)
        );
      },
      detailCard: {
        title: "Detalhes do fornecedor",
        tabs: ["Cadastro", "Contato", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Razao social", value: record.razaoSocial || "Nao informado" },
            { label: "Nome fantasia", value: record.nomeFantasia || "Nao informado" },
            { label: "CNPJ", value: formatCpfCnpj(record.cnpj) || "Nao informado" },
            { label: "E-mail", value: record.email || "Nao informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar fornecedor",
      sideNotes: [
        "Razao social e CNPJ sao obrigatorios.",
        "CNPJ, telefone e e-mail seguem as validacoes do backend.",
      ],
      fields: [
        { name: "razaoSocial", label: "Razao social", placeholder: "Informe a razao social", validate: (value) => validateRequired(value, "Razao social") },
        { name: "nomeFantasia", label: "Nome fantasia", placeholder: "Informe o nome fantasia" },
        { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCnpj },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "email", label: "E-mail", type: "email", placeholder: "fornecedor@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "endereco", label: "Endereco", placeholder: "Informe o endereco", fullWidth: true },
      ],
      submitLabel: "Salvar fornecedor",
      successMessage: "Fornecedor cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/fornecedores/listar",
      toPayload(values) {
        return buildSupplierPayload({ ...values, status: "ativo" });
      },
    },
    edit: {
      heroTitle: "Editar fornecedor",
      alert: "Selecione um fornecedor na consulta para abrir a edicao com o registro correto.",
      fields: [
        { name: "razaoSocial", label: "Razao social", placeholder: "Informe a razao social", validate: (value) => validateRequired(value, "Razao social") },
        { name: "nomeFantasia", label: "Nome fantasia", placeholder: "Informe o nome fantasia" },
        { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCnpj },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "email", label: "E-mail", type: "email", placeholder: "fornecedor@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "endereco", label: "Endereco", placeholder: "Informe o endereco", fullWidth: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
      ],
      submitLabel: "Salvar alteracoes",
      successMessage: "Fornecedor atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/fornecedores/listar",
      toPayload(values) {
        return buildSupplierPayload(values);
      },
    },
    deactivate: {
      heroTitle: "Inativar fornecedor",
      warning:
        "A inativacao altera o status do fornecedor sem remover o cadastro.",
      optionalField: {
        label: "Observacao da inativacao",
        placeholder: "Registre uma observacao interna antes de inativar.",
      },
      actionButtons: [{ label: "Confirmar inativacao", variant: "danger", action: "confirm" }],
      successMessage: "Fornecedor inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Fornecedor", value: record.razaoSocial || "Nao informado" },
          { label: "CNPJ", value: formatCpfCnpj(record.cnpj) || "Nao informado" },
          { label: "Status atual", value: normalizeClientStatus(record.status) },
        ];
      },
      asyncAction: "update",
      buildPayload(record) {
        return { ...record, status: "inativo" };
      },
    },
  },
  funcionarios: {
    key: "funcionarios",
    apiResource: "funcionarios",
    label: "Funcionarios",
    singularLabel: "funcionario",
    basePath: "/funcionarios",
    contextLabel: "Equipe e permissoes",
    summary:
      "Modulo de funcionarios com cadastro, consulta, edicao e desligamento operacional.",
    routeMeta: {
      base: { eyebrow: "Modulo", label: "Funcionarios" },
      list: { eyebrow: "Consulta", label: "Consultar funcionarios" },
      create: { eyebrow: "Cadastro", label: "Novo funcionario" },
      edit: { eyebrow: "Edicao", label: "Editar funcionario" },
      deactivate: { eyebrow: "Inativacao", label: "Inativar funcionario" },
    },
    actions: [
      { label: "Menu do modulo", path: "/funcionarios" },
      { label: "Consultar funcionarios", path: "/funcionarios/listar" },
      { label: "Novo funcionario", path: "/funcionarios/novo" },
      { label: "Editar funcionario", path: "/funcionarios/editar" },
      { label: "Inativar funcionario", path: "/funcionarios/inativar" },
    ],
    list: {
      heroTitle: "Consultar funcionarios",
      emptyState: "Nenhum funcionario encontrado com os filtros aplicados.",
      filters: [
        { name: "nome", label: "Nome", placeholder: "Buscar por nome" },
        { name: "cpf", label: "CPF", placeholder: "Filtrar por CPF" },
        { name: "setor", label: "Setor", placeholder: "Filtrar por setor" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Todos", "Ativo", "Inativo"],
          defaultValue: "Todos",
        },
      ],
      columns: [
        { label: "Nome", render: (record) => record.nome || "Nao informado", sortValue: (record) => record.nome || "" },
        { label: "CPF", render: (record) => formatCpfCnpj(record.cpf) || "Nao informado", sortValue: (record) => record.cpf || "" },
        { label: "Cargo", render: (record) => record.cargo || "Nao informado", sortValue: (record) => record.cargo || "" },
        { label: "Setor", render: (record) => record.setor || "Nao informado", sortValue: (record) => record.setor || "" },
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
          onlyDigits(record.cpf).includes(onlyDigits(filters.cpf)) &&
          normalizeText(record.setor).includes(normalizeText(filters.setor)) &&
          (filters.status === "Todos" || status === filters.status)
        );
      },
      detailCard: {
        title: "Detalhes do funcionario",
        tabs: ["Cadastro", "Vinculo", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Funcionario", value: record.nome || "Nao informado" },
            { label: "CPF", value: formatCpfCnpj(record.cpf) || "Nao informado" },
            { label: "Cargo", value: record.cargo || "Nao informado" },
            { label: "Setor", value: record.setor || "Nao informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar funcionario",
      sideNotes: [
        "Nome, CPF, cargo, setor e tipo de vinculo sao obrigatorios.",
        "Permissoes devem ser separadas por virgula.",
      ],
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf", label: "CPF", placeholder: "000.000.000-00", formatInput: formatCpfCnpj, validate: validateCpf },
        { name: "rg", label: "RG", placeholder: "Informe o RG" },
        { name: "email", label: "E-mail", type: "email", placeholder: "funcionario@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "cargo", label: "Cargo", placeholder: "Informe o cargo", validate: (value) => validateRequired(value, "Cargo") },
        { name: "setor", label: "Setor", placeholder: "Informe o setor", validate: (value) => validateRequired(value, "Setor") },
        { name: "tipoVinculo", label: "Tipo de vinculo", placeholder: "CLT, PJ, temporario", validate: (value) => validateRequired(value, "Tipo de vinculo") },
        { name: "dataAdmissao", label: "Data de admissao", type: "date", validate: validateProductDate },
        { name: "permissoes", label: "Permissoes", placeholder: "admin, estoque, servicos", fullWidth: true },
        { name: "endereco", label: "Endereco", placeholder: "Informe o endereco", fullWidth: true },
      ],
      submitLabel: "Salvar funcionario",
      successMessage: "Funcionario cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/funcionarios/listar",
      toPayload(values) {
        return buildEmployeePayload({ ...values, status: "ativo" });
      },
    },
    edit: {
      heroTitle: "Editar funcionario",
      alert: "Selecione um funcionario na consulta para abrir a edicao com o registro correto.",
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf", label: "CPF", placeholder: "000.000.000-00", formatInput: formatCpfCnpj, validate: validateCpf },
        { name: "rg", label: "RG", placeholder: "Informe o RG" },
        { name: "email", label: "E-mail", type: "email", placeholder: "funcionario@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "cargo", label: "Cargo", placeholder: "Informe o cargo", validate: (value) => validateRequired(value, "Cargo") },
        { name: "setor", label: "Setor", placeholder: "Informe o setor", validate: (value) => validateRequired(value, "Setor") },
        { name: "tipoVinculo", label: "Tipo de vinculo", placeholder: "CLT, PJ, temporario", validate: (value) => validateRequired(value, "Tipo de vinculo") },
        { name: "dataAdmissao", label: "Data de admissao", type: "date", validate: validateProductDate },
        { name: "permissoes", label: "Permissoes", placeholder: "admin, estoque, servicos", fullWidth: true, formatInput: (value) => Array.isArray(value) ? value.join(", ") : value },
        { name: "endereco", label: "Endereco", placeholder: "Informe o endereco", fullWidth: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
      ],
      submitLabel: "Salvar alteracoes",
      successMessage: "Funcionario atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/funcionarios/listar",
      toPayload(values) {
        return buildEmployeePayload(values);
      },
    },
    deactivate: {
      heroTitle: "Inativar funcionario",
      warning:
        "A inativacao chama o endpoint de desligamento e remove permissoes do funcionario.",
      optionalFields: [
        { name: "responsavelDesligamento", label: "Responsavel", placeholder: "Responsavel pelo desligamento" },
        { name: "motivoDesligamento", label: "Motivo", placeholder: "Motivo do desligamento" },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna" },
      ],
      actionButtons: [{ label: "Confirmar inativacao", variant: "danger", action: "confirm" }],
      successMessage: "Funcionario inativado com sucesso.",
      requestPathSuffix: "/inativar",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Funcionario", value: record.nome || "Nao informado" },
          { label: "CPF", value: formatCpfCnpj(record.cpf) || "Nao informado" },
          { label: "Setor", value: record.setor || "Nao informado" },
          { label: "Status atual", value: normalizeClientStatus(record.status) },
        ];
      },
      asyncAction: "update",
      buildPayload(record, values = {}) {
        return {
          responsavelDesligamento: values.responsavelDesligamento?.trim() || "Sistema",
          motivoDesligamento: values.motivoDesligamento?.trim() || "Inativacao pelo sistema",
          observacao: values.observacao?.trim() || "",
        };
      },
    },
  },
  estoque: {
    key: "estoque",
    apiResource: "estoque",
    label: "Estoque",
    singularLabel: "movimentacao",
    basePath: "/estoque",
    contextLabel: "Movimentacao de estoque",
    summary:
      "Modulo de estoque com entradas, saidas, ajustes, transferencias e reversao de movimentacoes.",
    routeMeta: {
      base: { eyebrow: "Modulo", label: "Estoque" },
      list: { eyebrow: "Consulta", label: "Consultar estoque" },
      create: { eyebrow: "Movimentacao", label: "Nova movimentacao" },
      edit: { eyebrow: "Edicao", label: "Editar movimentacao" },
      deactivate: { eyebrow: "Reversao", label: "Remover movimentacao" },
    },
    actions: [
      { label: "Menu do modulo", path: "/estoque" },
      { label: "Consultar estoque", path: "/estoque/listar" },
      { label: "Nova movimentacao", path: "/estoque/novo" },
      { label: "Editar movimentacao", path: "/estoque/editar" },
      { label: "Remover movimentacao", path: "/estoque/inativar" },
    ],
    list: {
      heroTitle: "Consultar movimentacoes",
      emptyState: "Nenhuma movimentacao encontrada com os filtros aplicados.",
      filters: [
        { name: "produto", label: "Produto", placeholder: "Nome ou ID do produto" },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Todos", "Entrada", "Saida", "Ajuste", "Transferencia"],
          defaultValue: "Todos",
        },
        { name: "responsavel", label: "Responsavel", placeholder: "Filtrar por responsavel" },
      ],
      columns: [
        {
          label: "Produto",
          render: (record) => getReferenceLabel(record.produto, ["nome"]),
          sortValue: (record) => getReferenceLabel(record.produto, ["nome"]),
        },
        {
          label: "Tipo",
          render: (record) => formatMovementType(record.tipo),
          sortValue: (record) => formatMovementType(record.tipo),
        },
        {
          label: "Quantidade",
          render: (record) => String(record.quantidade ?? 0),
          sortValue: (record) => Number(record.quantidade ?? 0),
        },
        {
          label: "Valor total",
          render: (record) => formatCurrency(record.valorTotal),
          sortValue: (record) => Number(record.valorTotal ?? 0),
        },
        {
          label: "Data",
          render: (record) => formatDate(record.data),
          sortValue: (record) => record.data || "",
        },
      ],
      matchesFilters(record, filters) {
        const produto = getReferenceLabel(record.produto, ["nome"]);
        const tipo = formatMovementType(record.tipo);

        return (
          normalizeText(produto).includes(normalizeText(filters.produto)) &&
          (filters.tipo === "Todos" || tipo === filters.tipo) &&
          normalizeText(record.responsavel).includes(normalizeText(filters.responsavel))
        );
      },
      detailCard: {
        title: "Detalhes da movimentacao",
        tabs: ["Produto", "Movimentacao", "Auditoria"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Produto", value: getReferenceLabel(record.produto, ["nome"]) },
            { label: "Fornecedor", value: getReferenceLabel(record.fornecedor, ["razaoSocial", "nomeFantasia"]) },
            { label: "Tipo", value: formatMovementType(record.tipo) },
            { label: "Quantidade", value: String(record.quantidade ?? 0) },
            { label: "Responsavel", value: record.responsavel || "Nao informado" },
          ];
        },
      },
    },
    create: {
      heroTitle: "Registrar movimentacao",
      sideNotes: [
        "Selecione o produto pelo nome ou codigo cadastrado.",
        "Fornecedor aparece pelo nome fantasia quando for uma entrada de estoque.",
      ],
      fields: [
        {
          name: "produto",
          label: "Produto",
          type: "reference",
          resource: "produtos",
          placeholder: "Selecione um produto",
          optionLabel: (record) => record.codigo ? `${record.nome} (${record.codigo})` : record.nome,
          optionMeta: (record) => `estoque ${record.quantidadeAtual ?? 0}`,
          validate: (value) => validateRequired(value, "Produto"),
          formatInput: toId,
        },
        {
          name: "fornecedor",
          label: "Fornecedor",
          type: "reference",
          resource: "fornecedores",
          placeholder: "Selecione um fornecedor",
          optionLabel: (record) => record.nomeFantasia || record.razaoSocial,
          optionMeta: (record) => record.cnpj ? formatCpfCnpj(record.cnpj) : "",
          formatInput: toId,
        },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Entrada", "Saida"],
          defaultValue: "Entrada",
          formatInput: formatMovementType,
        },
        { name: "quantidade", label: "Quantidade", type: "number", min: 1, placeholder: "1", validate: (value) => validateNonNegativeNumber(value, "Quantidade", { required: true }) },
        { name: "valorUnitario", label: "Valor unitario", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Valor unitario") },
        { name: "localOrigem", label: "Local origem", placeholder: "Geral" },
        { name: "localDestino", label: "Local destino", placeholder: "Geral" },
        { name: "responsavel", label: "Responsavel", placeholder: "Nome do responsavel" },
        { name: "motivo", label: "Motivo", placeholder: "Motivo da movimentacao", fullWidth: true },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna", fullWidth: true },
      ],
      submitLabel: "Salvar movimentacao",
      successMessage: "Movimentacao cadastrada com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/estoque/listar",
      toPayload(values) {
        return buildStockPayload(values);
      },
    },
    edit: {
      heroTitle: "Editar movimentacao",
      alert: "Selecione uma movimentacao na consulta para abrir a edicao com o registro correto.",
      fields: [
        {
          name: "produto",
          label: "Produto",
          type: "reference",
          resource: "produtos",
          placeholder: "Selecione um produto",
          optionLabel: (record) => record.codigo ? `${record.nome} (${record.codigo})` : record.nome,
          optionMeta: (record) => `estoque ${record.quantidadeAtual ?? 0}`,
          validate: (value) => validateRequired(value, "Produto"),
          formatInput: toId,
        },
        {
          name: "fornecedor",
          label: "Fornecedor",
          type: "reference",
          resource: "fornecedores",
          placeholder: "Selecione um fornecedor",
          optionLabel: (record) => record.nomeFantasia || record.razaoSocial,
          optionMeta: (record) => record.cnpj ? formatCpfCnpj(record.cnpj) : "",
          formatInput: toId,
        },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Entrada", "Saida", "Ajuste", "Transferencia"],
          defaultValue: "Entrada",
          formatInput: formatMovementType,
        },
        { name: "quantidade", label: "Quantidade", type: "number", min: 1, placeholder: "1", validate: (value) => validateNonNegativeNumber(value, "Quantidade", { required: true }) },
        { name: "quantidadeNova", label: "Quantidade nova", type: "number", min: 0, placeholder: "0", validate: (value) => validateNonNegativeNumber(value, "Quantidade nova") },
        { name: "valorUnitario", label: "Valor unitario", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Valor unitario") },
        { name: "localOrigem", label: "Local origem", placeholder: "Geral" },
        { name: "localDestino", label: "Local destino", placeholder: "Geral" },
        { name: "responsavel", label: "Responsavel", placeholder: "Nome do responsavel" },
        { name: "motivo", label: "Motivo", placeholder: "Motivo da movimentacao", fullWidth: true },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna", fullWidth: true },
      ],
      submitLabel: "Salvar alteracoes",
      successMessage: "Movimentacao atualizada com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/estoque/listar",
      toPayload(values) {
        return buildStockPayload(values);
      },
    },
    deactivate: {
      heroTitle: "Remover movimentacao",
      warning:
        "A remocao reverte a movimentacao no estoque antes de excluir o registro.",
      optionalField: {
        label: "Observacao da remocao",
        placeholder: "Registre uma observacao interna antes de remover.",
      },
      actionButtons: [{ label: "Confirmar remocao", variant: "danger", action: "confirm" }],
      successMessage: "Movimentacao removida com sucesso.",
      asyncAction: "delete",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Produto", value: getReferenceLabel(record.produto, ["nome"]) },
          { label: "Tipo", value: formatMovementType(record.tipo) },
          { label: "Quantidade", value: String(record.quantidade ?? 0) },
          { label: "Data", value: formatDate(record.data) },
        ];
      },
    },
  },
  servicos: {
    key: "servicos",
    apiResource: "servicos",
    label: "Servicos",
    singularLabel: "servico",
    basePath: "/servicos",
    contextLabel: "Ordem de servico",
    summary:
      "Modulo de servicos com agenda, execucao, valores, equipe e cancelamento.",
    routeMeta: {
      base: { eyebrow: "Modulo", label: "Servicos" },
      list: { eyebrow: "Consulta", label: "Consultar servicos" },
      create: { eyebrow: "Cadastro", label: "Novo servico" },
      edit: { eyebrow: "Edicao", label: "Editar servico" },
      deactivate: { eyebrow: "Cancelamento", label: "Cancelar servico" },
    },
    actions: [
      { label: "Menu do modulo", path: "/servicos" },
      { label: "Consultar servicos", path: "/servicos/listar" },
      { label: "Novo servico", path: "/servicos/novo" },
      { label: "Editar servico", path: "/servicos/editar" },
      { label: "Cancelar servico", path: "/servicos/inativar" },
    ],
    list: {
      heroTitle: "Consultar servicos",
      emptyState: "Nenhum servico encontrado com os filtros aplicados.",
      filters: [
        { name: "cliente", label: "Cliente", placeholder: "Nome ou ID do cliente" },
        { name: "tipo", label: "Tipo", placeholder: "Filtrar por tipo" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Todos", "Agendado", "Em andamento", "Concluido", "Cancelado", "Inativo"],
          defaultValue: "Todos",
        },
      ],
      columns: [
        {
          label: "Cliente",
          render: (record) => getReferenceLabel(record.cliente, ["nome"]),
          sortValue: (record) => getReferenceLabel(record.cliente, ["nome"]),
        },
        { label: "Tipo", render: (record) => record.tipo || "Nao informado", sortValue: (record) => record.tipo || "" },
        { label: "Agendamento", render: (record) => formatDate(record.dataAgendamento), sortValue: (record) => record.dataAgendamento || "" },
        { label: "Valor total", render: (record) => formatCurrency(record.valorTotal), sortValue: (record) => Number(record.valorTotal ?? 0) },
        {
          label: "Status",
          type: "status",
          sortValue: (record) => formatServiceStatus(record.status),
          render: (record) => ({
            text: formatServiceStatus(record.status),
            tone: getServiceStatusTone(record.status),
          }),
        },
      ],
      matchesFilters(record, filters) {
        const cliente = getReferenceLabel(record.cliente, ["nome"]);
        const status = formatServiceStatus(record.status);

        return (
          normalizeText(cliente).includes(normalizeText(filters.cliente)) &&
          normalizeText(record.tipo).includes(normalizeText(filters.tipo)) &&
          (filters.status === "Todos" || status === filters.status)
        );
      },
      detailCard: {
        title: "Detalhes do servico",
        tabs: ["Cliente", "Agenda", "Valores"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Cliente", value: getReferenceLabel(record.cliente, ["nome"]) },
            { label: "Tipo", value: record.tipo || "Nao informado" },
            { label: "Agendamento", value: formatDate(record.dataAgendamento) },
            { label: "Equipe", value: Array.isArray(record.equipe) ? record.equipe.map((item) => getReferenceLabel(item, ["nome"])).join(", ") || "Nao informado" : "Nao informado" },
            { label: "Status", value: formatServiceStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar servico",
      sideNotes: [
        "Selecione cliente, equipe e produtos pelos nomes cadastrados.",
        "O valor dos produtos e o total sao calculados a partir dos itens usados.",
      ],
      fields: [
        {
          name: "cliente",
          label: "Cliente",
          type: "reference",
          resource: "clientes",
          placeholder: "Selecione um cliente",
          optionLabel: (record) => record.nome,
          optionMeta: (record) => record.cpf_cnpj ? formatCpfCnpj(record.cpf_cnpj) : record.telefone,
          validate: (value) => validateRequired(value, "Cliente"),
          formatInput: toId,
        },
        { name: "tipo", label: "Tipo de servico", placeholder: "Instalacao, manutencao, reparo", validate: (value) => validateRequired(value, "Tipo de servico") },
        { name: "descricao", label: "Descricao", type: "textarea", placeholder: "Descreva o servico", fullWidth: true },
        { name: "dataAgendamento", label: "Data de agendamento", type: "date", validate: validateProductDate },
        { name: "dataInicio", label: "Data de inicio", type: "date", validate: validateProductDate },
        { name: "garantiaAte", label: "Garantia ate", type: "date", validate: validateProductDate },
        {
          name: "equipe",
          label: "Equipe",
          type: "multiReference",
          resource: "funcionarios",
          fullWidth: true,
          optionLabel: (record) => record.nome,
          optionMeta: (record) => [record.cargo, record.setor].filter(Boolean).join(" - "),
          formatInput: formatReferenceList,
        },
        {
          name: "produtosUtilizados",
          label: "Produtos utilizados",
          type: "productItems",
          productResource: "produtos",
          fullWidth: true,
          optionLabel: (record) => `${record.nome} - estoque ${record.quantidadeAtual ?? 0}`,
          validate: validateProductItems,
          formatInput: formatProductItems,
        },
        { name: "valorMaoDeObra", label: "Mao de obra", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Mao de obra") },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Agendado", "Em andamento", "Concluido", "Cancelado"],
          defaultValue: "Agendado",
          formatInput: formatServiceStatus,
        },
        { name: "responsavel", label: "Responsavel", placeholder: "Responsavel pelo cadastro" },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna", fullWidth: true },
      ],
      submitLabel: "Salvar servico",
      successMessage: "Servico cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/servicos/listar",
      toPayload(values) {
        return buildServicePayload(values);
      },
    },
    edit: {
      heroTitle: "Editar servico",
      alert: "Selecione um servico na consulta para abrir a edicao com o registro correto.",
      fields: [
        {
          name: "cliente",
          label: "Cliente",
          type: "reference",
          resource: "clientes",
          placeholder: "Selecione um cliente",
          optionLabel: (record) => record.nome,
          optionMeta: (record) => record.cpf_cnpj ? formatCpfCnpj(record.cpf_cnpj) : record.telefone,
          validate: (value) => validateRequired(value, "Cliente"),
          formatInput: toId,
        },
        { name: "tipo", label: "Tipo de servico", placeholder: "Instalacao, manutencao, reparo", validate: (value) => validateRequired(value, "Tipo de servico") },
        { name: "descricao", label: "Descricao", type: "textarea", placeholder: "Descreva o servico", fullWidth: true },
        { name: "dataAgendamento", label: "Data de agendamento", type: "date", validate: validateProductDate },
        { name: "dataInicio", label: "Data de inicio", type: "date", validate: validateProductDate },
        { name: "dataConclusao", label: "Data de conclusao", type: "date", validate: validateProductDate },
        { name: "garantiaAte", label: "Garantia ate", type: "date", validate: validateProductDate },
        {
          name: "equipe",
          label: "Equipe",
          type: "multiReference",
          resource: "funcionarios",
          fullWidth: true,
          optionLabel: (record) => record.nome,
          optionMeta: (record) => [record.cargo, record.setor].filter(Boolean).join(" - "),
          formatInput: formatReferenceList,
        },
        {
          name: "produtosUtilizados",
          label: "Produtos utilizados",
          type: "productItems",
          productResource: "produtos",
          fullWidth: true,
          optionLabel: (record) => `${record.nome} - estoque ${record.quantidadeAtual ?? 0}`,
          validate: validateProductItems,
          formatInput: formatProductItems,
        },
        { name: "valorMaoDeObra", label: "Mao de obra", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Mao de obra") },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Agendado", "Em andamento", "Concluido", "Cancelado", "Inativo"],
          defaultValue: "Agendado",
          formatInput: formatServiceStatus,
        },
        { name: "responsavel", label: "Responsavel", placeholder: "Responsavel pela edicao" },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna", fullWidth: true },
      ],
      submitLabel: "Salvar alteracoes",
      successMessage: "Servico atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/servicos/listar",
      toPayload(values) {
        return buildServicePayload(values);
      },
    },
    deactivate: {
      heroTitle: "Cancelar servico",
      warning:
        "O cancelamento chama o endpoint de inativacao do servico e devolve produtos utilizados ao estoque.",
      optionalFields: [
        { name: "responsavelCancelamento", label: "Responsavel", placeholder: "Responsavel pelo cancelamento" },
        { name: "motivoCancelamento", label: "Motivo", placeholder: "Motivo do cancelamento" },
        { name: "observacao", label: "Observacao", placeholder: "Observacao interna" },
      ],
      actionButtons: [{ label: "Confirmar cancelamento", variant: "danger", action: "confirm" }],
      successMessage: "Servico cancelado com sucesso.",
      requestPathSuffix: "/inativar",
      asyncAction: "update",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Cliente", value: getReferenceLabel(record.cliente, ["nome"]) },
          { label: "Tipo", value: record.tipo || "Nao informado" },
          { label: "Status atual", value: formatServiceStatus(record.status) },
          { label: "Agendamento", value: formatDate(record.dataAgendamento) },
        ];
      },
      buildPayload(record, values = {}) {
        return {
          responsavelCancelamento: values.responsavelCancelamento?.trim() || "Sistema",
          motivoCancelamento: values.motivoCancelamento?.trim() || "Cancelamento pelo sistema",
          observacao: values.observacao?.trim() || "",
        };
      },
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
        const rawValue = record[field.name];
        const value = typeof rawValue === "object" ? rawValue : String(rawValue);

        return [field.name, field.formatInput ? field.formatInput(value) : value];
      }

      return [field.name, field.defaultValue || ""];
    })
  );
}
