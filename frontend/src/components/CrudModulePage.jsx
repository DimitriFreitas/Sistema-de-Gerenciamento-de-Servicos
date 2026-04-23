import { Link } from "react-router-dom";
import ModuleActionNav from "./ModuleActionNav";

function CrudModulePage({ moduleConfig }) {
  return (
    <div className="page-stack">
      <ModuleActionNav actions={moduleConfig.actions} />

      <section className="hero-grid">
        <article className="hero-panel hero-panel--accent">
          <p className="eyebrow">{moduleConfig.contextLabel}</p>
          <h2>{moduleConfig.label}</h2>

          <div className="hero-actions">
            <Link className="button button--light" to={moduleConfig.actions[1].path}>
              Abrir consulta
            </Link>
            <Link className="button button--ghost-light" to={moduleConfig.actions[2].path}>
              Abrir cadastro
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Operacoes</p>
              <h3>CRUD do modulo</h3>
            </div>
            <span className="badge">{moduleConfig.contextLabel}</span>
          </div>

          <div className="action-stack">
            {moduleConfig.actions.slice(1).map((action) => (
              <Link className="action-card" key={action.path} to={action.path}>
                <strong>{action.label}</strong>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default CrudModulePage;
