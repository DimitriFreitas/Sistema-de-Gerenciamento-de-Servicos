import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getInitialFormValues } from "../data/moduleConfigs";
import { api } from "../lib/api";
import ModuleActionNav from "./ModuleActionNav";

function renderField(field, value, onChange) {
  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        onChange={onChange}
        placeholder={field.placeholder}
        rows={4}
        value={value}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select name={field.name} onChange={onChange} value={value}>
        {field.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      max={field.max}
      min={field.min}
      name={field.name}
      onChange={onChange}
      placeholder={field.placeholder}
      step={field.step}
      type={field.type || "text"}
      value={value}
    />
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
  const [submitState, setSubmitState] = useState({
    status: "idle",
    error: "",
  });

  useEffect(() => {
    if (mode === "create") {
      setFormValues(getInitialFormValues(config.fields));
      setRequestState({ status: "idle", error: "" });
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
          throw new Error(`${moduleConfig.singularLabel} nao encontrado.`);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

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
          {requestState.error ? <div className="alert alert--danger">{requestState.error}</div> : null}
          {submitState.error ? <div className="alert alert--danger">{submitState.error}</div> : null}

          <div className="form-grid">
            {config.fields.map((field) => (
              <label className={`field${field.fullWidth ? " field--full" : ""}`} key={field.label}>
                <span>{field.label}</span>
                {renderField(field, formValues[field.name] ?? "", handleChange)}
              </label>
            ))}
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
