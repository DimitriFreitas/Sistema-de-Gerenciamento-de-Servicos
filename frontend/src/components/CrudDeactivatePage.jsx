import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, request } from "../lib/api";
import ModuleActionNav from "./ModuleActionNav";

function CrudDeactivatePage({ moduleConfig }) {
  const config = moduleConfig.deactivate;
  const optionalFields = useMemo(
    () =>
      config.optionalFields ?? (
        config.optionalField ? [{ name: "observacao", ...config.optionalField }] : []
      ),
    [config]
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("id");
  const [record, setRecord] = useState(null);
  const [deactivationValues, setDeactivationValues] = useState(() =>
    Object.fromEntries(optionalFields.map((field) => [field.name, ""]))
  );
  const [requestState, setRequestState] = useState({
    status: "loading",
    error: "",
  });
  const [submitState, setSubmitState] = useState({
    status: "idle",
    error: "",
  });

  useEffect(() => {
    setDeactivationValues(
      Object.fromEntries(optionalFields.map((field) => [field.name, ""]))
    );
  }, [optionalFields]);

  useEffect(() => {
    if (!recordId) {
      setRequestState({
        status: "missing-id",
        error: `Selecione um ${moduleConfig.singularLabel} na consulta antes de continuar.`,
      });
      return;
    }

    async function loadRecord() {
      try {
        setRequestState({ status: "loading", error: "" });
        const data = await api.list(moduleConfig.apiResource);
        const selectedRecord = data.find((item) => item._id === recordId);

        if (!selectedRecord) {
          throw new Error(`${moduleConfig.singularLabel} não encontrado.`);
        }

        setRecord(selectedRecord);
        setRequestState({ status: "success", error: "" });
      } catch (error) {
        setRequestState({
          status: "error",
          error: error.message,
        });
      }
    }

    loadRecord();
  }, [moduleConfig.apiResource, moduleConfig.singularLabel, recordId]);

  async function handlePrimaryAction() {
    if (!recordId || !record) {
      return;
    }

    try {
      setSubmitState({ status: "saving", error: "" });

      if (config.asyncAction === "delete") {
        await api.remove(moduleConfig.apiResource, recordId);
      } else if (config.requestPathSuffix) {
        await request(`${moduleConfig.apiResource}/${recordId}${config.requestPathSuffix}`, {
          method: "PUT",
          body: JSON.stringify(config.buildPayload(record, deactivationValues)),
        });
      } else {
        await api.update(
          moduleConfig.apiResource,
          recordId,
          config.buildPayload(record, deactivationValues)
        );
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
        <article className="surface-card surface-card--flush">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{moduleConfig.contextLabel}</p>
              <h3>{config.heroTitle}</h3>
            </div>
            <Link className="button button--secondary" to={moduleConfig.actions[1].path}>
              Voltar para consulta
            </Link>
          </div>
          <div className="alert alert--danger">{config.warning}</div>
          {requestState.status === "loading" ? (
            <div className="alert alert--info">Carregando dados do backend...</div>
          ) : null}
          {requestState.error ? <div className="alert alert--danger">{requestState.error}</div> : null}
          {submitState.error ? <div className="alert alert--danger">{submitState.error}</div> : null}

          <div className="inner-panel">
            <p className="eyebrow">Detalhes</p>
            <h4>Detalhes antes da inativação</h4>
            <div className="mini-list">
              {config.facts(record).map((fact) => (
                <div className="mini-list-item" key={fact.label}>
                  <strong>{fact.label}:</strong> {fact.value}
                </div>
              ))}
            </div>
          </div>

          {optionalFields.map((field) => (
            <label className="field" key={field.name}>
              <span>{field.label}</span>
              <input
                onChange={(event) =>
                  setDeactivationValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                type="text"
                value={deactivationValues[field.name] ?? ""}
              />
            </label>
          ))}

          <div className="button-group form-actions">
            {config.actionButtons.map((button) => (
              <button
                className={`button button--${button.variant}`}
                disabled={!record || submitState.status === "saving"}
                onClick={button.action === "confirm" ? handlePrimaryAction : undefined}
                key={button.label}
                type="button"
              >
                {submitState.status === "saving" && button.action === "confirm"
                  ? "Processando..."
                  : button.label}
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default CrudDeactivatePage;
