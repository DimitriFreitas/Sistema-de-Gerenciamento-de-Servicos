import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ModuleActionNav from "./ModuleActionNav";

function CrudListPage({ moduleConfig }) {
  const detail = moduleConfig.list.detailCard;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [requestState, setRequestState] = useState({
    status: "loading",
    error: "",
  });
  const [filters, setFilters] = useState(() =>
    Object.fromEntries(
      moduleConfig.list.filters.map((filter) => [
        filter.name,
        filter.defaultValue ?? "",
      ])
    )
  );
  const feedback = location.state?.feedback ?? null;

  useEffect(() => {
    async function loadRecords() {
      try {
        setRequestState({ status: "loading", error: "" });
        const data = await api.list(moduleConfig.apiResource);
        setRecords(Array.isArray(data) ? data : []);
        setRequestState({ status: "success", error: "" });
      } catch (error) {
        setRequestState({
          status: "error",
          error: error.message,
        });
      }
    }

    loadRecords();
  }, [moduleConfig.apiResource]);

  useEffect(() => {
    if (location.state?.feedback) {
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const filteredRecords = records.filter((record) =>
    moduleConfig.list.matchesFilters(record, filters)
  );
  const selectedId = searchParams.get("id");
  const selectedRecord =
    filteredRecords.find((record) => record._id === selectedId) || filteredRecords[0] || null;

  useEffect(() => {
    if (!selectedRecord || selectedRecord._id === selectedId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("id", selectedRecord._id);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, selectedId, selectedRecord, setSearchParams]);

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSelectRecord(recordId) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("id", recordId);
    setSearchParams(nextParams);
  }

  function handleActionClick(event) {
    event.stopPropagation();
  }

  function buildRecordPath(basePath) {
    if (!selectedRecord?._id) {
      return basePath;
    }

    return `${basePath}?id=${selectedRecord._id}`;
  }

  return (
    <div className="page-stack">
      <ModuleActionNav actions={moduleConfig.actions} />

      <section className="content-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Filtros</p>
              <h3>{moduleConfig.list.heroTitle}</h3>
            </div>
            <Link className="button button--primary" to={moduleConfig.actions[2].path}>
              {moduleConfig.actions[2].label}
            </Link>
          </div>
          <div className="filter-grid">
            {moduleConfig.list.filters.map((filter) => (
              <label className="field" key={filter.label}>
                <span>{filter.label}</span>
                {filter.type === "select" ? (
                  <select
                    onChange={(event) => handleFilterChange(filter.name, event.target.value)}
                    value={filters[filter.name]}
                  >
                    {filter.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    onChange={(event) => handleFilterChange(filter.name, event.target.value)}
                    placeholder={filter.placeholder}
                    type="text"
                    value={filters[filter.name]}
                  />
                )}
              </label>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Painel lateral</p>
              <h3>{detail.title}</h3>
            </div>
          </div>
          <div className="tab-row">
            {detail.tabs.map((tab) => (
              <span className="tab-chip" key={tab}>
                {tab}
              </span>
            ))}
          </div>

          {selectedRecord ? (
            <div className="facts-grid">
              {detail.facts(selectedRecord).map((fact) => (
                <div className="fact-card" key={fact.label}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert--info">{moduleConfig.list.emptyState}</div>
          )}
        </article>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Listagem</p>
            <h3>{moduleConfig.label}</h3>
          </div>
          <div className="button-group">
            <Link
              className={`button button--secondary${selectedRecord ? "" : " button--disabled"}`}
              onClick={(event) => {
                if (!selectedRecord) {
                  event.preventDefault();
                }
              }}
              to={buildRecordPath(moduleConfig.actions[3].path)}
            >
              {moduleConfig.actions[3].label}
            </Link>
            <Link
              className={`button button--danger${selectedRecord ? "" : " button--disabled"}`}
              onClick={(event) => {
                if (!selectedRecord) {
                  event.preventDefault();
                }
              }}
              to={buildRecordPath(moduleConfig.actions[4].path)}
            >
              {moduleConfig.actions[4].label}
            </Link>
          </div>
        </div>

        {feedback ? (
          <div className="alert alert--info">{feedback.message}</div>
        ) : null}

        {requestState.status === "loading" ? (
          <div className="alert alert--info">Carregando dados do backend...</div>
        ) : null}

        {requestState.status === "error" ? (
          <div className="alert alert--danger">{requestState.error}</div>
        ) : null}

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {moduleConfig.list.columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  className={record._id === selectedRecord?._id ? "data-table-row--active" : ""}
                  key={record._id}
                  onClick={() => handleSelectRecord(record._id)}
                >
                  {moduleConfig.list.columns.map((column) => {
                    const value = column.render(record);

                    return (
                      <td key={`${record._id}-${column.label}`}>
                        {column.type === "status" ? (
                          <span className={`status-pill status-pill--${value.tone}`}>{value.text}</span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <div className="table-actions">
                      <Link
                        className="table-link"
                        onClick={handleActionClick}
                        to={`${moduleConfig.actions[3].path}?id=${record._id}`}
                      >
                        Editar
                      </Link>
                      <Link
                        className="table-link table-link--danger"
                        onClick={handleActionClick}
                        to={`${moduleConfig.actions[4].path}?id=${record._id}`}
                      >
                        Inativar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredRecords.length && requestState.status === "success" ? (
                <tr>
                  <td className="data-table-empty" colSpan={moduleConfig.list.columns.length + 1}>
                    {moduleConfig.list.emptyState}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CrudListPage;
