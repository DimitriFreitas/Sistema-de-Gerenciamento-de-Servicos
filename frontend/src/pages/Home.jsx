import { Link } from "react-router-dom";
import { orderedModules } from "../data/moduleConfigs";

function Home() {
  return (
    <div className="page-stack home-page">
      <section className="hero-grid hero-grid--single">
        <article className="hero-panel hero-panel--accent">
          <p className="eyebrow">Sistema principal</p>
          <h2>Painel de controle</h2>
        </article>
      </section>

      <section className="content-grid content-grid--single">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Menu inicial</p>
              <h3>Modulos disponiveis</h3>
            </div>
          </div>

          <div className="module-grid">
            {orderedModules.map((module, index) => (
              <Link
                className={`module-tile${index === 0 ? " module-tile--primary" : ""}`}
                key={module.key}
                to={module.basePath}
              >
                <span>{module.label}</span>
                <small>{module.summary}</small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default Home;
