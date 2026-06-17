import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getInitialFormValues } from "../data/moduleConfigs";
import { api } from "../lib/api";
import ModuleActionNav from "./ModuleActionNav";

function getReferenceId(value) {
  if (value && typeof value === "object") {
    return value._id || value.id || "";
  }

  return String(value ?? "");
}

function getReferenceRecords(fields) {
  return [...new Set(
    fields
      .flatMap((field) => {
        if (field.type === "reference" || field.type === "multiReference") {
          return [field.resource];
        }

        if (field.type === "productItems") {
          return [field.productResource];
        }

        return [];
      })
      .filter(Boolean)
  )];
}

function getOptionLabel(field, record) {
  if (!record) {
    return "";
  }

  return field.optionLabel?.(record) || record.nome || record.nomeFantasia || record.razaoSocial || record.tipo || record._id;
}

function getOptionMeta(field, record) {
  return field.optionMeta?.(record) || "";
}

function renderReferenceField(field, value, relatedRecords, onChange, onBlur, hasError, formValues) {
  const records = relatedRecords[field.resource] ?? [];

  return (
    <select
      aria-invalid={hasError ? "true" : "false"}
      name={field.name}
      onBlur={onBlur}
      onChange={(event) => onChange(field.name, event.target.value)}
      value={getReferenceId(value)}
    >
      <option value="">{field.placeholder || "Selecione uma opcao"}</option>
      {records.map((record) => {
        const meta = getOptionMeta(field, record);
        const isSelected = getReferenceId(value) === record._id;
        const isDisabled = Boolean(field.optionDisabled?.(record, formValues) && !isSelected);

        return (
          <option disabled={isDisabled} key={record._id} value={record._id}>
            {meta ? `${getOptionLabel(field, record)} - ${meta}` : getOptionLabel(field, record)}
          </option>
        );
      })}
    </select>
  );
}

function renderMultiReferenceField(field, value, relatedRecords, onChange, onBlur) {
  const selectedIds = new Set(Array.isArray(value) ? value.map(getReferenceId) : []);
  const records = relatedRecords[field.resource] ?? [];

  return (
    <div className="choice-grid" onBlur={onBlur}>
      {records.map((record) => {
        const recordId = getReferenceId(record);
        const meta = getOptionMeta(field, record);

        return (
          <label className="choice-row" key={recordId}>
            <input
              checked={selectedIds.has(recordId)}
              name={field.name}
              onChange={(event) => {
                const nextIds = new Set(selectedIds);

                if (event.target.checked) {
                  nextIds.add(recordId);
                } else {
                  nextIds.delete(recordId);
                }

                onChange(field.name, [...nextIds]);
              }}
              type="checkbox"
            />
            <span>
              <strong>{getOptionLabel(field, record)}</strong>
              {meta ? <small>{meta}</small> : null}
            </span>
          </label>
        );
      })}
      {!records.length ? <p className="field-hint">Nenhum registro disponível.</p> : null}
    </div>
  );
}

function getProductDefaults(product) {
  const firstLocation = product?.locaisEstoque?.find((local) => local.quantidade > 0);

  return {
    localOrigem: firstLocation?.localizacao || product?.localizacao || "",
    valorUnitario: product?.preco ?? product?.custo ?? "",
  };
}

function renderProductItemsField(field, value, relatedRecords, onChange) {
  const records = relatedRecords[field.productResource] ?? [];
  const rows = Array.isArray(value) ? value : [];

  function updateRow(index, patch) {
    onChange(
      field.name,
      rows.map((row, currentIndex) =>
        currentIndex === index ? { ...row, ...patch } : row
      )
    );
  }

  function addRow() {
    onChange(field.name, [
      ...rows,
      { produto: "", quantidade: 1, localOrigem: "", valorUnitario: "" },
    ]);
  }

  function removeRow(index) {
    onChange(
      field.name,
      rows.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  return (
    <div className="product-items">
      <div className="product-items__header">
        <span>Produto</span>
        <span>Quantidade</span>
        <span>Local</span>
        <span>Valor unitário</span>
        <span>Ações</span>
      </div>
      {rows.map((row, index) => {
        const product = records.find((record) => record._id === getReferenceId(row.produto));

        return (
          <div className="product-items__row" key={`${getReferenceId(row.produto)}-${index}`}>
            <select
              aria-label="Produto utilizado"
              onChange={(event) => {
                const nextProduct = records.find((record) => record._id === event.target.value);

                updateRow(index, {
                  produto: event.target.value,
                  ...getProductDefaults(nextProduct),
                });
              }}
              value={getReferenceId(row.produto)}
            >
              <option value="">Selecione</option>
              {records.map((record) => (
                <option
                  disabled={Boolean(field.optionDisabled?.(record, row) && getReferenceId(row.produto) !== record._id)}
                  key={record._id}
                  value={record._id}
                >
                  {field.optionLabel?.(record) || record.nome}
                </option>
              ))}
            </select>
            <input
              aria-label="Quantidade"
              min="1"
              onChange={(event) => updateRow(index, { quantidade: event.target.value })}
              type="number"
              value={row.quantidade ?? 1}
            />
            <input
              aria-label="Local de origem"
              onChange={(event) => updateRow(index, { localOrigem: event.target.value })}
              placeholder={product?.localizacao || "Local"}
              type="text"
              value={row.localOrigem ?? ""}
            />
            <input
              aria-label="Valor unitário"
              min="0"
              onChange={(event) => updateRow(index, { valorUnitario: event.target.value })}
              step="0.01"
              type="number"
              value={row.valorUnitario ?? ""}
            />
            <button
              className="table-link table-link--danger"
              onClick={() => removeRow(index)}
              type="button"
            >
              Remover
            </button>
          </div>
        );
      })}
      <button className="button button--secondary product-items__add" onClick={addRow} type="button">
        Adicionar produto
      </button>
    </div>
  );
}

function renderField(field, value, onChange, onBlur, hasError, relatedRecords, formValues) {
  const inputProps = {
    "aria-invalid": hasError ? "true" : "false",
    name: field.name,
    onBlur,
    onChange: (event) => onChange(field.name, event.target.value),
    value,
  };

  if (field.type === "reference") {
    return renderReferenceField(field, value, relatedRecords, onChange, onBlur, hasError, formValues);
  }

  if (field.type === "multiReference") {
    return renderMultiReferenceField(field, value, relatedRecords, onChange, onBlur);
  }

  if (field.type === "productItems") {
    return renderProductItemsField(field, value, relatedRecords, onChange);
  }

  if (field.type === "textarea") {
    return (
      <textarea
        {...inputProps}
        placeholder={field.placeholder}
        rows={4}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select {...inputProps}>
        {field.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      {...inputProps}
      max={field.max}
      min={field.min}
      placeholder={field.placeholder}
      step={field.step}
      type={field.type || "text"}
    />
  );
}

function validateFields(fields, values) {
  return Object.fromEntries(
    fields
      .map((field) => [field.name, field.validate?.(values[field.name]) || ""])
      .filter(([, error]) => Boolean(error))
  );
}

function CrudFormPage({ moduleConfig, mode }) {
  const config = moduleConfig[mode];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id");
  const [formValues, setFormValues] = useState(() =>
    getInitialFormValues(config.fields)
  );
  const [requestState, setRequestState] = useState({
    status: mode === "create" ? "idle" : "loading",
    error: "",
  });
  const [relatedState, setRelatedState] = useState({
    status: "idle",
    error: "",
    records: {},
  });
  const [submitState, setSubmitState] = useState({
    status: "idle",
    error: "",
  });
  const [touchedFields, setTouchedFields] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fieldErrors = validateFields(config.fields, formValues);
  const formError = config.validateForm?.(formValues, relatedState.records) || "";

  useEffect(() => {
    const resources = getReferenceRecords(config.fields);

    if (!resources.length) {
      setRelatedState({ status: "idle", error: "", records: {} });
      return;
    }

    async function loadRelatedRecords() {
      try {
        setRelatedState((current) => ({ ...current, status: "loading", error: "" }));
        const entries = await Promise.all(
          resources.map(async (resource) => [resource, await api.list(resource)])
        );

        setRelatedState({
          status: "success",
          error: "",
          records: Object.fromEntries(entries),
        });
      } catch (error) {
        setRelatedState((current) => ({
          ...current,
          status: "error",
          error: error.message,
        }));
      }
    }

    loadRelatedRecords();
  }, [config.fields]);

  useEffect(() => {
    if (mode === "create") {
      setFormValues(getInitialFormValues(config.fields));
      setRequestState({ status: "idle", error: "" });
      setTouchedFields({});
      setFormSubmitted(false);
      return;
    }

    if (!recordId) {
      setRequestState({
        status: "missing-id",
        error: `Selecione um ${moduleConfig.singularLabel} na consulta antes de editar.`,
      });
      return;
    }

    async function loadRecord() {
      try {
        setRequestState({ status: "loading", error: "" });
        const data = await api.list(moduleConfig.apiResource);
        const record = data.find((item) => item._id === recordId);

        if (!record) {
          throw new Error(`${moduleConfig.singularLabel} não encontrado.`);
        }

        setFormValues(getInitialFormValues(config.fields, record));
        setRequestState({ status: "success", error: "" });
      } catch (error) {
        setRequestState({
          status: "error",
          error: error.message,
        });
      }
    }

    loadRecord();
  }, [
    config.fields,
    mode,
    moduleConfig.apiResource,
    moduleConfig.singularLabel,
    recordId,
  ]);

  function handleChange(name, value) {
    const field = config.fields.find((currentField) => currentField.name === name);
    const nextValue = field?.formatInput ? field.formatInput(value) : value;

    setFormValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
    setSubmitState((current) =>
      current.status === "error" ? { status: "idle", error: "" } : current
    );
  }

  function handleBlur(event) {
    const { name } = event.target;

    setTouchedFields((current) => ({
      ...current,
      [name]: true,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormSubmitted(true);

    if (Object.keys(fieldErrors).length) {
      setSubmitState({ status: "idle", error: "" });
      return;
    }

    if (formError) {
      setSubmitState({ status: "error", error: formError });
      return;
    }

    try {
      setSubmitState({ status: "saving", error: "" });
      const payload = config.toPayload(formValues);

      if (mode === "create") {
        await api.create(moduleConfig.apiResource, payload);
      } else if (recordId) {
        await api.update(moduleConfig.apiResource, recordId, payload);
      }

      navigate(moduleConfig.actions[1].path, {
        state: {
          feedback: {
            message: config.successMessage,
          },
        },
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        error: error.message,
      });
    }
  }

  return (
    <div className="page-stack">
      <ModuleActionNav actions={moduleConfig.actions} />

      <section className="form-layout form-layout--single">
        <form className="surface-card surface-card--flush" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{moduleConfig.contextLabel}</p>
              <h3>{config.heroTitle}</h3>
            </div>
          </div>
          {config.alert ? <div className="alert alert--info">{config.alert}</div> : null}
          {requestState.status === "loading" ? (
            <div className="alert alert--info">Carregando dados do backend...</div>
          ) : null}
          {relatedState.status === "loading" ? (
            <div className="alert alert--info">Carregando listas de seleção...</div>
          ) : null}
          {requestState.error ? <div className="alert alert--danger">{requestState.error}</div> : null}
          {relatedState.error ? <div className="alert alert--danger">{relatedState.error}</div> : null}
          {submitState.error ? <div className="alert alert--danger">{submitState.error}</div> : null}

          <div className="form-grid">
            {config.fields.map((field) => {
              const shouldShowError = Boolean(
                fieldErrors[field.name] && (touchedFields[field.name] || formSubmitted)
              );
              const isComplexField = field.type === "multiReference" || field.type === "productItems";
              const FieldWrapper = isComplexField ? "div" : "label";

              return (
                <FieldWrapper
                  className={`field${field.fullWidth ? " field--full" : ""}${shouldShowError ? " field--invalid" : ""}`}
                  key={field.label}
                >
                  <span>{field.label}</span>
                  {renderField(
                    field,
                    formValues[field.name] ?? "",
                    handleChange,
                    handleBlur,
                    shouldShowError,
                    relatedState.records,
                    formValues
                  )}
                  {shouldShowError ? (
                    <small className="field-error">{fieldErrors[field.name]}</small>
                  ) : null}
                </FieldWrapper>
              );
            })}
          </div>

          {config.sideNotes?.length ? (
            <div className="timeline-list compact-stack">
              {config.sideNotes.map((note) => (
                <div className="timeline-item" key={note}>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          ) : null}

          {config.extraPanel ? (
            <div className="inner-panel">
              <p className="eyebrow">Complemento</p>
              <h4>{config.extraPanel.title}</h4>
              <div className="mini-list">
                {config.extraPanel.items.map((item) => (
                  <div className="mini-list-item" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="button-group form-actions">
            <button
              className="button button--primary"
              disabled={submitState.status === "saving" || requestState.status === "loading"}
              type="submit"
            >
              {submitState.status === "saving" ? "Salvando..." : config.submitLabel}
            </button>
            <Link className="button button--secondary" to={config.secondaryPath}>
              {config.secondaryLabel}
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CrudFormPage;
