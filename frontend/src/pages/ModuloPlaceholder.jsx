import { Link } from "react-router-dom";

function ModuloPlaceholder({ title, description, taskId, plannedWindow }) {
  return (
    <div className="page-stack">
      <section className="hero-grid">
        <article className="hero-panel hero-panel--soft">
          <p className="eyebrow">Modulo complementar</p>
          <h2>{title}</h2>
          <div className="hero-actions">
            <Link className="button button--secondary" to="/">
              Voltar ao inicio
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Informacoes</p>
              <h3>Visao do modulo</h3>
            </div>
          </div>

          <div className="timeline-list">
            <div className="timeline-item">
              <strong>Resumo</strong>
            </div>
            <div className="timeline-item">
              <strong>Referencia interna</strong>
              <p>{taskId}</p>
            </div>
            <div className="timeline-item">
              <strong>Status</strong>
              <p>{plannedWindow}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default ModuloPlaceholder;
