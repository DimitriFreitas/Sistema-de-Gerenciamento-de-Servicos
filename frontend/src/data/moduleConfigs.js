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
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "Não informado";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Não informado";
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
    return "Não informado";
  }

  for (const field of fields) {
    if (record[field]) {
      return record[field];
    }
  }

  return record._id || "Não informado";
}

function getReferenceLabel(reference, fields) {
  if (!reference) {
    return "Não informado";
  }

  if (typeof reference === "object") {
    return getRecordLabel(reference, fields);
  }

  return reference;
}

function getAvailableStock(product) {
  return Number(product?.quantidadeAtual ?? 0);
}

function findRecordById(records = [], id) {
  return records.find((record) => record._id === toId(id));
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
    return "Saída";
  }

  if (normalizedType === "ajuste") {
    return "Ajuste";
  }

  if (normalizedType === "transferencia") {
    return "Transferência";
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
    return "Concluído";
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
  return `${label} é obrigatório.`;
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
    : "Informe um e-mail válido.";
}

function validateCpfCnpj(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CPF ou CNPJ");
  }

  if (digits.length !== 11 && digits.length !== 14) {
    return "Informe 11 dígitos para CPF ou 14 dígitos para CNPJ.";
  }

  return isValidCpfCnpj(value) ? "" : "CPF ou CNPJ inválido.";
}

function validateCpf(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CPF");
  }

  if (digits.length !== 11) {
    return "Informe 11 dígitos para CPF.";
  }

  return isValidCpfCnpj(value) ? "" : "CPF inválido.";
}

function validateCnpj(value) {
  const digits = String(value ?? "").replaceAll(/\D/g, "");

  if (!digits) {
    return requiredMessage("CNPJ");
  }

  if (digits.length !== 14) {
    return "Informe 14 dígitos para CNPJ.";
  }

  return isValidCpfCnpj(value) ? "" : "CNPJ inválido.";
}

function validatePhone(value) {
  if (!String(value ?? "").trim()) {
    return "";
  }

  return isValidPhone(value) ? "" : "Informe um telefone com DDD e 10 ou 11 dígitos.";
}

function validateNonNegativeNumber(value, label, { required = false } = {}) {
  if (value === "" || value === null || value === undefined) {
    return required ? requiredMessage(label) : "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return `${label} deve ser um número válido.`;
  }

  return number >= 0 ? "" : `${label} não pode ser negativo.`;
}

function validateProductDate(value) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? "Informe uma data válida." : "";
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
      return "Valor unitário não pode ser negativo.";
    }
  }

  return "";
}

function validateStockMovementForm(values, relatedRecords) {
  const tipo = normalizeMovementType(values.tipo);

  if (tipo !== "saida" && tipo !== "transferencia") {
    return "";
  }

  const produto = findRecordById(relatedRecords.produtos, values.produto);

  if (!produto) {
    return "";
  }

  const availableStock = getAvailableStock(produto);
  const requestedAmount = Number(values.quantidade ?? 0);

  if (availableStock <= 0) {
    return "Produto sem estoque não pode ter saída. Registre uma entrada antes.";
  }

  if (requestedAmount > availableStock) {
    return `Quantidade solicitada maior que o estoque atual (${availableStock}).`;
  }

  return "";
}

function validateServiceForm(values, relatedRecords) {
  const produtosUtilizados = Array.isArray(values.produtosUtilizados)
    ? values.produtosUtilizados
    : [];

  for (const item of produtosUtilizados) {
    const produto = findRecordById(relatedRecords.produtos, item.produto);

    if (!produto) {
      continue;
    }

    const availableStock = getAvailableStock(produto);
    const requestedAmount = Number(item.quantidade ?? 0);

    if (availableStock <= 0) {
      return `${produto.nome} está sem estoque. Registre uma entrada antes de usar no serviço.`;
    }

    if (requestedAmount > availableStock) {
      return `${produto.nome} tem apenas ${availableStock} unidade(s) em estoque.`;
    }
  }

  return "";
}

function stockProductField(optionDisabled) {
  return {
    name: "produto",
    label: "Produto",
    type: "reference",
    resource: "produtos",
    placeholder: "Selecione um produto",
    optionLabel: (record) => record.codigo ? `${record.nome} (${record.codigo})` : record.nome,
    optionMeta: (record) => `estoque ${record.quantidadeAtual ?? 0}`,
    optionDisabled,
    validate: (value) => validateRequired(value, "Produto"),
    formatInput: toId,
  };
}

function supplierReferenceField() {
  return {
    name: "fornecedor",
    label: "Fornecedor",
    type: "reference",
    resource: "fornecedores",
    placeholder: "Selecione um fornecedor",
    optionLabel: (record) => record.nomeFantasia || record.razaoSocial,
    optionMeta: (record) => record.cnpj ? formatCpfCnpj(record.cnpj) : "",
    formatInput: toId,
  };
}

function serviceClientField() {
  return {
    name: "cliente",
    label: "Cliente",
    type: "reference",
    resource: "clientes",
    placeholder: "Selecione um cliente",
    optionLabel: (record) => record.nome,
    optionMeta: (record) => record.cpf_cnpj ? formatCpfCnpj(record.cpf_cnpj) : record.telefone,
    validate: (value) => validateRequired(value, "Cliente"),
    formatInput: toId,
  };
}

function serviceTeamField() {
  return {
    name: "equipe",
    label: "Equipe",
    type: "multiReference",
    resource: "funcionarios",
    fullWidth: true,
    optionLabel: (record) => record.nome,
    optionMeta: (record) => [record.cargo, record.setor].filter(Boolean).join(" - "),
    formatInput: formatReferenceList,
  };
}

function serviceProductsField() {
  return {
    name: "produtosUtilizados",
    label: "Produtos utilizados",
    type: "productItems",
    productResource: "produtos",
    fullWidth: true,
    optionLabel: (record) => `${record.nome} - estoque ${record.quantidadeAtual ?? 0}`,
    optionDisabled: (record) => getAvailableStock(record) <= 0,
    validate: validateProductItems,
    formatInput: formatProductItems,
  };
}

function serviceFields({ includeCompletionDate = false, statusOptions, responsavelPlaceholder }) {
  return [
    serviceClientField(),
    { name: "tipo", label: "Tipo de serviço", placeholder: "Instalação, manutenção, reparo", validate: (value) => validateRequired(value, "Tipo de serviço") },
    { name: "descricao", label: "Descrição", type: "textarea", placeholder: "Descreva o serviço", fullWidth: true },
    { name: "dataAgendamento", label: "Data de agendamento", type: "date", validate: validateProductDate },
    { name: "dataInicio", label: "Data de início", type: "date", validate: validateProductDate },
    ...(includeCompletionDate
      ? [{ name: "dataConclusao", label: "Data de conclusão", type: "date", validate: validateProductDate }]
      : []),
    { name: "garantiaAte", label: "Garantia até", type: "date", validate: validateProductDate },
    serviceTeamField(),
    serviceProductsField(),
    { name: "valorMaoDeObra", label: "Mão de obra", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Mão de obra") },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      defaultValue: "Agendado",
      formatInput: formatServiceStatus,
    },
    { name: "responsavel", label: "Responsável", placeholder: responsavelPlaceholder },
    { name: "observacao", label: "Observação", placeholder: "Observação interna", fullWidth: true },
  ];
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
      "Módulo de clientes com consulta, cadastro, edição e inativação integrados ao backend.",

    routeMeta: {
      base: {
        eyebrow: "Módulo",
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
        eyebrow: "Edição",
        label: "Editar cliente",
      },
      deactivate: {
        eyebrow: "Inativação",
        label: "Inativar cliente",
      },
    },
    actions: [
      {
        label: "Menu do módulo",
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
          render: (record) => record.nome || "Não informado",
          sortValue: (record) => record.nome || "",
        },
        {
          label: "CPF / CNPJ",
          render: (record) => formatCpfCnpj(record.cpf_cnpj) || "Não informado",
          sortValue: (record) => record.cpf_cnpj || "",
        },
        {
          label: "Telefone",
          render: (record) => formatPhone(record.telefone) || "Não informado",
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
          "Os dados abaixo são carregados diretamente da API para apoiar consulta, edição e atualização de status.",
        tabs: ["Dados Cadastrais", "Contato", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Cliente", value: record.nome || "Não informado" },
            { label: "Documento", value: formatCpfCnpj(record.cpf_cnpj) || "Não informado" },
            { label: "E-mail", value: record.email || "Não informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar cliente",
      sideNotes: [
        "Os dados são enviados diretamente para a API de clientes.",
        "Nome, e-mail e CPF ou CNPJ são obrigatórios.",
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
        "Edição dos dados cadastrais do cliente selecionado com persistência imediata na API.",
      sideNotes: [
        "Os campos são preenchidos com os dados atuais do backend.",
        "O status pode ser ajustado nesta tela quando necessário.",
        "As alterações salvas ficam disponíveis imediatamente na listagem.",
      ],
      alert:
        "Selecione um cliente na consulta para abrir a edição com o registro correto.",
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
      submitLabel: "Salvar alterações",
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
        "A inativação atualiza o status do cliente para inativo sem remover o cadastro do banco.",
      warning:
        "Revise os dados do cliente antes de confirmar a inativação. A alteração será persistida imediatamente na API.",
      optionalField: {
        label: "Observação da inativação",
        placeholder: "Registre uma observação interna para referência da equipe.",
      },
      actionButtons: [{ label: "Confirmar inativação", variant: "danger", action: "confirm" }],
      successMessage: "Cliente inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Cliente", value: record.nome || "Não informado" },
          { label: "Documento", value: formatCpfCnpj(record.cpf_cnpj) || "Não informado" },
          { label: "E-mail", value: record.email || "Não informado" },
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
      "Módulo de produtos com consulta, cadastro, edição e inativação integrados ao backend.",
    routeMeta: {
      base: {
        eyebrow: "Módulo",
        label: "Produtos",
        description: "Cadastro e consulta de produtos com dados reais do estoque.",
      },
      list: {
        eyebrow: "Consulta",
        label: "Consultar produtos",
        description: "Listagem do estoque com filtros e ações do cadastro.",
      },
      create: {
        eyebrow: "Cadastro",
        label: "Novo produto",
        description: "Cadastro de produto com descrição, estoque e valores.",
      },
      edit: {
        eyebrow: "Edição",
        label: "Editar produto",
        description: "Atualização dos dados do produto selecionado.",
      },
      deactivate: {
        eyebrow: "Inativação",
        label: "Inativar produto",
        description: "Atualização do status do produto selecionado.",
      },
    },
    actions: [
      {
        label: "Menu do módulo",
        path: "/produtos",
        description: "Resumo do módulo e atalhos para todas as operações.",
      },
      {
        label: "Consultar produtos",
        path: "/produtos/listar",
        description: "Listagem com filtros por nome, descrição e saldo de estoque.",
      },
      {
        label: "Novo produto",
        path: "/produtos/novo",
        description: "Cadastro com descrição, valores e quantidades.",
      },
      {
        label: "Editar produto",
        path: "/produtos/editar",
        description: "Atualização dos campos do produto selecionado.",
      },
      {
        label: "Inativar produto",
        path: "/produtos/inativar",
        description: "Atualização do status do produto selecionado.",
      },
    ],
    list: {
      heroTitle: "Consultar produtos",
      heroDescription:
        "A consulta carrega os produtos do backend, permite filtrar por nome, descrição e faixa de estoque e destaca o item selecionado.",
      emptyState: "Nenhum produto encontrado com os filtros aplicados.",
      filters: [
        { name: "nome", label: "Nome", placeholder: "Buscar por nome" },
        { name: "descricao", label: "Descrição", placeholder: "Filtrar por descrição" },
        {
          name: "estoque",
          label: "Estoque",
          type: "select",
          options: ["Todos", "Disponível", "Abaixo do mínimo", "Sem estoque"],
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
          render: (record) => record.nome || "Não informado",
          sortValue: (record) => record.nome || "",
        },
        {
          label: "Descrição",
          render: (record) => record.descricao || "Não informado",
          sortValue: (record) => record.descricao || "",
        },
        {
          label: "Estoque atual",
          render: (record) => String(record.quantidadeAtual ?? 0),
          sortValue: (record) => Number(record.quantidadeAtual ?? 0),
        },
        {
          label: "Estoque mínimo",
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
              ? "Abaixo do mínimo"
              : "Disponível";
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
          "Os dados abaixo são carregados da API de produtos para apoiar consulta, edição e atualização de status.",
        tabs: ["Cadastro", "Estoque", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Produto", value: record.nome || "Não informado" },
            { label: "Descrição", value: record.descricao || "Não informado" },
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
        "Formulário integrado ao backend para criar produtos com descrição, estoque e valores.",
      sideNotes: [
        "Os campos seguem o contrato atual da API de produtos.",
        "Custo, preço e quantidades aceitam apenas valores numéricos.",
        "A data de validade e opcional.",
      ],
      fields: [
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar", validate: (value) => validateRequired(value, "Nome do produto") },
        {
          name: "descricao",
          label: "Descrição",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
          validate: (value) => validateRequired(value, "Descrição"),
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade atual") },
        { name: "quantidadeMinima", label: "Quantidade mínima", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade mínima") },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Custo") },
        { name: "preco", label: "Preço", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Preço") },
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
        "Edição do produto selecionado com persistência direta dos campos no backend.",
      sideNotes: [
        "Os campos são preenchidos com os dados atuais do produto.",
        "Descrição, estoque e valores podem ser ajustados na mesma tela.",
        "As alterações salvas ficam visíveis imediatamente na consulta.",
      ],
      alert:
        "Selecione um produto na consulta para abrir a edição com o registro correto.",
      fields: [
        { name: "nome", label: "Nome do produto", placeholder: "Ex.: Disjuntor Tripolar", validate: (value) => validateRequired(value, "Nome do produto") },
        {
          name: "descricao",
          label: "Descrição",
          type: "textarea",
          placeholder: "Descreva o produto cadastrado",
          fullWidth: true,
          validate: (value) => validateRequired(value, "Descrição"),
        },
        { name: "quantidadeAtual", label: "Quantidade atual", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade atual") },
        { name: "quantidadeMinima", label: "Quantidade mínima", type: "number", placeholder: "0", min: 0, validate: (value) => validateNonNegativeNumber(value, "Quantidade mínima") },
        { name: "custo", label: "Custo", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Custo") },
        { name: "preco", label: "Preço", type: "number", placeholder: "0.00", min: 0, step: "0.01", validate: (value) => validateNonNegativeNumber(value, "Preço") },
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
          "Os valores são enviados para o backend no formato numérico.",
          "A consulta reflete as alterações salvas após a resposta da API.",
        ],
      },
      submitLabel: "Salvar alterações",
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
        "A inativação atualiza o status do produto para inativo sem remover o cadastro do banco.",
      warning:
        "Revise os dados do produto antes de confirmar. A alteração será persistida imediatamente na API.",
      optionalField: {
        label: "Observação da inativação",
        placeholder: "Registre uma observação interna antes de inativar o produto.",
      },
      actionButtons: [{ label: "Confirmar inativação", variant: "danger", action: "confirm" }],
      successMessage: "Produto inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Produto", value: record.nome || "Não informado" },
          { label: "Descrição", value: record.descricao || "Não informado" },
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
      "Módulo de fornecedores com cadastro, consulta, edição e inativação de parceiros.",
    routeMeta: {
      base: { eyebrow: "Módulo", label: "Fornecedores" },
      list: { eyebrow: "Consulta", label: "Consultar fornecedores" },
      create: { eyebrow: "Cadastro", label: "Novo fornecedor" },
      edit: { eyebrow: "Edição", label: "Editar fornecedor" },
      deactivate: { eyebrow: "Inativação", label: "Inativar fornecedor" },
    },
    actions: [
      { label: "Menu do módulo", path: "/fornecedores" },
      { label: "Consultar fornecedores", path: "/fornecedores/listar" },
      { label: "Novo fornecedor", path: "/fornecedores/novo" },
      { label: "Editar fornecedor", path: "/fornecedores/editar" },
      { label: "Inativar fornecedor", path: "/fornecedores/inativar" },
    ],
    list: {
      heroTitle: "Consultar fornecedores",
      emptyState: "Nenhum fornecedor encontrado com os filtros aplicados.",
      filters: [
        { name: "razaoSocial", label: "Razão social", placeholder: "Buscar por razão social" },
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
          label: "Razão social",
          render: (record) => record.razaoSocial || "Não informado",
          sortValue: (record) => record.razaoSocial || "",
        },
        {
          label: "Nome fantasia",
          render: (record) => record.nomeFantasia || "Não informado",
          sortValue: (record) => record.nomeFantasia || "",
        },
        {
          label: "CNPJ",
          render: (record) => formatCpfCnpj(record.cnpj) || "Não informado",
          sortValue: (record) => record.cnpj || "",
        },
        {
          label: "Telefone",
          render: (record) => formatPhone(record.telefone) || "Não informado",
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
            { label: "Razão social", value: record.razaoSocial || "Não informado" },
            { label: "Nome fantasia", value: record.nomeFantasia || "Não informado" },
            { label: "CNPJ", value: formatCpfCnpj(record.cnpj) || "Não informado" },
            { label: "E-mail", value: record.email || "Não informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar fornecedor",
      sideNotes: [
        "Razão social e CNPJ são obrigatórios.",
        "CNPJ, telefone e e-mail seguem as validações do backend.",
      ],
      fields: [
        { name: "razaoSocial", label: "Razão social", placeholder: "Informe a razão social", validate: (value) => validateRequired(value, "Razão social") },
        { name: "nomeFantasia", label: "Nome fantasia", placeholder: "Informe o nome fantasia" },
        { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCnpj },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "email", label: "E-mail", type: "email", placeholder: "fornecedor@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "endereco", label: "Endereço", placeholder: "Informe o endereço", fullWidth: true },
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
      alert: "Selecione um fornecedor na consulta para abrir a edição com o registro correto.",
      fields: [
        { name: "razaoSocial", label: "Razão social", placeholder: "Informe a razão social", validate: (value) => validateRequired(value, "Razão social") },
        { name: "nomeFantasia", label: "Nome fantasia", placeholder: "Informe o nome fantasia" },
        { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", formatInput: formatCpfCnpj, validate: validateCnpj },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "email", label: "E-mail", type: "email", placeholder: "fornecedor@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "endereco", label: "Endereço", placeholder: "Informe o endereço", fullWidth: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
      ],
      submitLabel: "Salvar alterações",
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
        "A inativação altera o status do fornecedor sem remover o cadastro.",
      optionalField: {
        label: "Observação da inativação",
        placeholder: "Registre uma observação interna antes de inativar.",
      },
      actionButtons: [{ label: "Confirmar inativação", variant: "danger", action: "confirm" }],
      successMessage: "Fornecedor inativado com sucesso.",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Fornecedor", value: record.razaoSocial || "Não informado" },
          { label: "CNPJ", value: formatCpfCnpj(record.cnpj) || "Não informado" },
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
    label: "Funcionários",
    singularLabel: "funcionário",
    basePath: "/funcionarios",
    contextLabel: "Equipe e permissões",
    summary:
      "Módulo de funcionários com cadastro, consulta, edição e desligamento operacional.",
    routeMeta: {
      base: { eyebrow: "Módulo", label: "Funcionários" },
      list: { eyebrow: "Consulta", label: "Consultar funcionários" },
      create: { eyebrow: "Cadastro", label: "Novo funcionário" },
      edit: { eyebrow: "Edição", label: "Editar funcionário" },
      deactivate: { eyebrow: "Inativação", label: "Inativar funcionário" },
    },
    actions: [
      { label: "Menu do módulo", path: "/funcionarios" },
      { label: "Consultar funcionários", path: "/funcionarios/listar" },
      { label: "Novo funcionário", path: "/funcionarios/novo" },
      { label: "Editar funcionário", path: "/funcionarios/editar" },
      { label: "Inativar funcionário", path: "/funcionarios/inativar" },
    ],
    list: {
      heroTitle: "Consultar funcionários",
      emptyState: "Nenhum funcionário encontrado com os filtros aplicados.",
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
        { label: "Nome", render: (record) => record.nome || "Não informado", sortValue: (record) => record.nome || "" },
        { label: "CPF", render: (record) => formatCpfCnpj(record.cpf) || "Não informado", sortValue: (record) => record.cpf || "" },
        { label: "Cargo", render: (record) => record.cargo || "Não informado", sortValue: (record) => record.cargo || "" },
        { label: "Setor", render: (record) => record.setor || "Não informado", sortValue: (record) => record.setor || "" },
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
        title: "Detalhes do funcionário",
        tabs: ["Cadastro", "Vínculo", "Status"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Funcionário", value: record.nome || "Não informado" },
            { label: "CPF", value: formatCpfCnpj(record.cpf) || "Não informado" },
            { label: "Cargo", value: record.cargo || "Não informado" },
            { label: "Setor", value: record.setor || "Não informado" },
            { label: "Status", value: normalizeClientStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar funcionário",
      sideNotes: [
        "Nome, CPF, cargo, setor e tipo de vínculo são obrigatórios.",
        "Permissões devem ser separadas por vírgula.",
      ],
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf", label: "CPF", placeholder: "000.000.000-00", formatInput: formatCpfCnpj, validate: validateCpf },
        { name: "rg", label: "RG", placeholder: "Informe o RG" },
        { name: "email", label: "E-mail", type: "email", placeholder: "funcionario@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "cargo", label: "Cargo", placeholder: "Informe o cargo", validate: (value) => validateRequired(value, "Cargo") },
        { name: "setor", label: "Setor", placeholder: "Informe o setor", validate: (value) => validateRequired(value, "Setor") },
        { name: "tipoVinculo", label: "Tipo de vínculo", placeholder: "CLT, PJ, temporário", validate: (value) => validateRequired(value, "Tipo de vínculo") },
        { name: "dataAdmissao", label: "Data de admissão", type: "date", validate: validateProductDate },
        { name: "permissoes", label: "Permissões", placeholder: "admin, estoque, serviços", fullWidth: true },
        { name: "endereco", label: "Endereço", placeholder: "Informe o endereço", fullWidth: true },
      ],
      submitLabel: "Salvar funcionário",
      successMessage: "Funcionário cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/funcionarios/listar",
      toPayload(values) {
        return buildEmployeePayload({ ...values, status: "ativo" });
      },
    },
    edit: {
      heroTitle: "Editar funcionário",
      alert: "Selecione um funcionário na consulta para abrir a edição com o registro correto.",
      fields: [
        { name: "nome", label: "Nome", placeholder: "Informe o nome", validate: (value) => validateRequired(value, "Nome") },
        { name: "cpf", label: "CPF", placeholder: "000.000.000-00", formatInput: formatCpfCnpj, validate: validateCpf },
        { name: "rg", label: "RG", placeholder: "Informe o RG" },
        { name: "email", label: "E-mail", type: "email", placeholder: "funcionario@empresa.com", validate: (value) => (String(value ?? "").trim() ? validateEmail(value) : "") },
        { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", formatInput: formatPhone, validate: validatePhone },
        { name: "cargo", label: "Cargo", placeholder: "Informe o cargo", validate: (value) => validateRequired(value, "Cargo") },
        { name: "setor", label: "Setor", placeholder: "Informe o setor", validate: (value) => validateRequired(value, "Setor") },
        { name: "tipoVinculo", label: "Tipo de vínculo", placeholder: "CLT, PJ, temporário", validate: (value) => validateRequired(value, "Tipo de vínculo") },
        { name: "dataAdmissao", label: "Data de admissão", type: "date", validate: validateProductDate },
        { name: "permissoes", label: "Permissões", placeholder: "admin, estoque, serviços", fullWidth: true, formatInput: (value) => Array.isArray(value) ? value.join(", ") : value },
        { name: "endereco", label: "Endereço", placeholder: "Informe o endereço", fullWidth: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Ativo", "Inativo"],
          defaultValue: "Ativo",
          formatInput: normalizeClientStatus,
        },
      ],
      submitLabel: "Salvar alterações",
      successMessage: "Funcionário atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/funcionarios/listar",
      toPayload(values) {
        return buildEmployeePayload(values);
      },
    },
    deactivate: {
      heroTitle: "Inativar funcionário",
      warning:
        "A inativação chama o endpoint de desligamento e remove permissões do funcionário.",
      optionalFields: [
        { name: "responsavelDesligamento", label: "Responsável", placeholder: "Responsável pelo desligamento" },
        { name: "motivoDesligamento", label: "Motivo", placeholder: "Motivo do desligamento" },
        { name: "observacao", label: "Observação", placeholder: "Observação interna" },
      ],
      actionButtons: [{ label: "Confirmar inativação", variant: "danger", action: "confirm" }],
      successMessage: "Funcionário inativado com sucesso.",
      requestPathSuffix: "/inativar",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Funcionário", value: record.nome || "Não informado" },
          { label: "CPF", value: formatCpfCnpj(record.cpf) || "Não informado" },
          { label: "Setor", value: record.setor || "Não informado" },
          { label: "Status atual", value: normalizeClientStatus(record.status) },
        ];
      },
      asyncAction: "update",
      buildPayload(record, values = {}) {
        return {
          responsavelDesligamento: values.responsavelDesligamento?.trim() || "Sistema",
          motivoDesligamento: values.motivoDesligamento?.trim() || "Inativação pelo sistema",
          observacao: values.observacao?.trim() || "",
        };
      },
    },
  },
  estoque: {
    key: "estoque",
    apiResource: "estoque",
    label: "Estoque",
    singularLabel: "movimentação",
    basePath: "/estoque",
    contextLabel: "Movimentação de estoque",
    summary:
      "Módulo de estoque com entradas, saídas, ajustes, transferências e reversão de movimentações.",
    routeMeta: {
      base: { eyebrow: "Módulo", label: "Estoque" },
      list: { eyebrow: "Consulta", label: "Consultar estoque" },
      create: { eyebrow: "Movimentação", label: "Nova movimentação" },
      edit: { eyebrow: "Edição", label: "Editar movimentação" },
      deactivate: { eyebrow: "Reversão", label: "Remover movimentação" },
    },
    actions: [
      { label: "Menu do módulo", path: "/estoque" },
      { label: "Consultar estoque", path: "/estoque/listar" },
      { label: "Nova movimentação", path: "/estoque/novo" },
      { label: "Editar movimentação", path: "/estoque/editar" },
      { label: "Remover movimentação", path: "/estoque/inativar" },
    ],
    list: {
      heroTitle: "Consultar movimentações",
      emptyState: "Nenhuma movimentação encontrada com os filtros aplicados.",
      filters: [
        { name: "produto", label: "Produto", placeholder: "Nome ou ID do produto" },
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Todos", "Entrada", "Saída", "Ajuste", "Transferência"],
          defaultValue: "Todos",
        },
        { name: "responsavel", label: "Responsável", placeholder: "Filtrar por responsável" },
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
        title: "Detalhes da movimentação",
        tabs: ["Produto", "Movimentação", "Auditoria"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Produto", value: getReferenceLabel(record.produto, ["nome"]) },
            { label: "Fornecedor", value: getReferenceLabel(record.fornecedor, ["razaoSocial", "nomeFantasia"]) },
            { label: "Tipo", value: formatMovementType(record.tipo) },
            { label: "Quantidade", value: String(record.quantidade ?? 0) },
            { label: "Responsável", value: record.responsavel || "Não informado" },
          ];
        },
      },
    },
    create: {
      heroTitle: "Registrar movimentação",
      sideNotes: [
        "Selecione o produto pelo nome ou codigo cadastrado.",
        "Fornecedor aparece pelo nome fantasia quando for uma entrada de estoque.",
      ],
      fields: [
        stockProductField((record, values) =>
          normalizeMovementType(values.tipo) === "saida" && getAvailableStock(record) <= 0
        ),
        supplierReferenceField(),
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Entrada", "Saída"],
          defaultValue: "Entrada",
          formatInput: formatMovementType,
        },
        { name: "quantidade", label: "Quantidade", type: "number", min: 1, placeholder: "1", validate: (value) => validateNonNegativeNumber(value, "Quantidade", { required: true }) },
        { name: "valorUnitario", label: "Valor unitário", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Valor unitário") },
        { name: "localOrigem", label: "Local origem", placeholder: "Geral" },
        { name: "localDestino", label: "Local destino", placeholder: "Geral" },
        { name: "responsavel", label: "Responsável", placeholder: "Nome do responsável" },
        { name: "motivo", label: "Motivo", placeholder: "Motivo da movimentação", fullWidth: true },
        { name: "observacao", label: "Observação", placeholder: "Observação interna", fullWidth: true },
      ],
      submitLabel: "Salvar movimentação",
      successMessage: "Movimentação cadastrada com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/estoque/listar",
      validateForm: validateStockMovementForm,
      toPayload(values) {
        return buildStockPayload(values);
      },
    },
    edit: {
      heroTitle: "Editar movimentação",
      alert: "Selecione uma movimentação na consulta para abrir a edição com o registro correto.",
      fields: [
        stockProductField((record, values) =>
          ["saida", "transferencia"].includes(normalizeMovementType(values.tipo)) &&
          getAvailableStock(record) <= 0
        ),
        supplierReferenceField(),
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: ["Entrada", "Saída", "Ajuste", "Transferência"],
          defaultValue: "Entrada",
          formatInput: formatMovementType,
        },
        { name: "quantidade", label: "Quantidade", type: "number", min: 1, placeholder: "1", validate: (value) => validateNonNegativeNumber(value, "Quantidade", { required: true }) },
        { name: "quantidadeNova", label: "Quantidade nova", type: "number", min: 0, placeholder: "0", validate: (value) => validateNonNegativeNumber(value, "Quantidade nova") },
        { name: "valorUnitario", label: "Valor unitário", type: "number", min: 0, step: "0.01", placeholder: "0.00", validate: (value) => validateNonNegativeNumber(value, "Valor unitário") },
        { name: "localOrigem", label: "Local origem", placeholder: "Geral" },
        { name: "localDestino", label: "Local destino", placeholder: "Geral" },
        { name: "responsavel", label: "Responsável", placeholder: "Nome do responsável" },
        { name: "motivo", label: "Motivo", placeholder: "Motivo da movimentação", fullWidth: true },
        { name: "observacao", label: "Observação", placeholder: "Observação interna", fullWidth: true },
      ],
      submitLabel: "Salvar alterações",
      successMessage: "Movimentação atualizada com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/estoque/listar",
      validateForm: validateStockMovementForm,
      toPayload(values) {
        return buildStockPayload(values);
      },
    },
    deactivate: {
      heroTitle: "Remover movimentação",
      warning:
        "A remoção reverte a movimentação no estoque antes de excluir o registro.",
      optionalField: {
        label: "Observação da remoção",
        placeholder: "Registre uma observação interna antes de remover.",
      },
      actionButtons: [{ label: "Confirmar remoção", variant: "danger", action: "confirm" }],
      successMessage: "Movimentação removida com sucesso.",
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
    label: "Serviços",
    singularLabel: "serviço",
    basePath: "/servicos",
    contextLabel: "Ordem de serviço",
    summary:
      "Módulo de serviços com agenda, execução, valores, equipe e cancelamento.",
    routeMeta: {
      base: { eyebrow: "Módulo", label: "Serviços" },
      list: { eyebrow: "Consulta", label: "Consultar serviços" },
      create: { eyebrow: "Cadastro", label: "Novo serviço" },
      edit: { eyebrow: "Edição", label: "Editar serviço" },
      deactivate: { eyebrow: "Cancelamento", label: "Cancelar serviço" },
    },
    actions: [
      { label: "Menu do módulo", path: "/servicos" },
      { label: "Consultar serviços", path: "/servicos/listar" },
      { label: "Novo serviço", path: "/servicos/novo" },
      { label: "Editar serviço", path: "/servicos/editar" },
      { label: "Cancelar serviço", path: "/servicos/inativar" },
    ],
    list: {
      heroTitle: "Consultar serviços",
      emptyState: "Nenhum serviço encontrado com os filtros aplicados.",
      filters: [
        { name: "cliente", label: "Cliente", placeholder: "Nome ou ID do cliente" },
        { name: "tipo", label: "Tipo", placeholder: "Filtrar por tipo" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Todos", "Agendado", "Em andamento", "Concluído", "Cancelado", "Inativo"],
          defaultValue: "Todos",
        },
      ],
      columns: [
        {
          label: "Cliente",
          render: (record) => getReferenceLabel(record.cliente, ["nome"]),
          sortValue: (record) => getReferenceLabel(record.cliente, ["nome"]),
        },
        { label: "Tipo", render: (record) => record.tipo || "Não informado", sortValue: (record) => record.tipo || "" },
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
        title: "Detalhes do serviço",
        tabs: ["Cliente", "Agenda", "Valores"],
        facts(record) {
          if (!record) {
            return [];
          }

          return [
            { label: "Cliente", value: getReferenceLabel(record.cliente, ["nome"]) },
            { label: "Tipo", value: record.tipo || "Não informado" },
            { label: "Agendamento", value: formatDate(record.dataAgendamento) },
            { label: "Equipe", value: Array.isArray(record.equipe) ? record.equipe.map((item) => getReferenceLabel(item, ["nome"])).join(", ") || "Não informado" : "Não informado" },
            { label: "Status", value: formatServiceStatus(record.status) },
          ];
        },
      },
    },
    create: {
      heroTitle: "Cadastrar serviço",
      sideNotes: [
        "Selecione cliente, equipe e produtos pelos nomes cadastrados.",
        "O valor dos produtos e o total são calculados a partir dos itens usados.",
      ],
      fields: serviceFields({
        statusOptions: ["Agendado", "Em andamento", "Concluído", "Cancelado"],
        responsavelPlaceholder: "Responsável pelo cadastro",
      }),
      submitLabel: "Salvar serviço",
      successMessage: "Serviço cadastrado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/servicos/listar",
      validateForm: validateServiceForm,
      toPayload(values) {
        return buildServicePayload(values);
      },
    },
    edit: {
      heroTitle: "Editar serviço",
      alert: "Selecione um serviço na consulta para abrir a edição com o registro correto.",
      fields: serviceFields({
        includeCompletionDate: true,
        statusOptions: ["Agendado", "Em andamento", "Concluído", "Cancelado", "Inativo"],
        responsavelPlaceholder: "Responsável pela edição",
      }),
      submitLabel: "Salvar alterações",
      successMessage: "Serviço atualizado com sucesso.",
      secondaryLabel: "Voltar para consulta",
      secondaryPath: "/servicos/listar",
      validateForm: validateServiceForm,
      toPayload(values) {
        return buildServicePayload(values);
      },
    },
    deactivate: {
      heroTitle: "Cancelar serviço",
      warning:
        "O cancelamento chama o endpoint de inativação do serviço e devolve produtos utilizados ao estoque.",
      optionalFields: [
        { name: "responsavelCancelamento", label: "Responsável", placeholder: "Responsável pelo cancelamento" },
        { name: "motivoCancelamento", label: "Motivo", placeholder: "Motivo do cancelamento" },
        { name: "observacao", label: "Observação", placeholder: "Observação interna" },
      ],
      actionButtons: [{ label: "Confirmar cancelamento", variant: "danger", action: "confirm" }],
      successMessage: "Serviço cancelado com sucesso.",
      requestPathSuffix: "/inativar",
      asyncAction: "update",
      facts(record) {
        if (!record) {
          return [];
        }

        return [
          { label: "Cliente", value: getReferenceLabel(record.cliente, ["nome"]) },
          { label: "Tipo", value: record.tipo || "Não informado" },
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
