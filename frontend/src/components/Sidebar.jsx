import { NavLink } from "react-router-dom";
import { primaryNavigation, supportNavigation } from "../config/navigation";

const iconPaths = {
  clientes: (
    <>
      <path d="M16 18v-1.2c0-1.7-1.8-3-4-3s-4 1.3-4 3V18" />
      <circle cx="12" cy="8" r="3" />
      <path d="M20 18v-1c0-1.3-1-2.4-2.5-2.9" />
      <path d="M17 5.3a2.6 2.6 0 0 1 0 5.4" />
    </>
  ),
  estoque: (
    <>
      <path d="M4 8.5 12 4l8 4.5-8 4.5z" />
      <path d="M4 8.5V16l8 4 8-4V8.5" />
      <path d="M12 13v7" />
    </>
  ),
  fornecedores: (
    <>
      <path d="M4 18V7l8-4 8 4v11" />
      <path d="M8 18v-6h8v6" />
      <path d="M9 8h.01M12 8h.01M15 8h.01" />
    </>
  ),
  funcionarios: (
    <>
      <path d="M8 20v-2.5A4.5 4.5 0 0 1 12.5 13h1A4.5 4.5 0 0 1 18 17.5V20" />
      <circle cx="13" cy="7" r="3" />
      <path d="M4 20v-2a3.5 3.5 0 0 1 3.4-3.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  produtos: (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M9.5 11h5" />
    </>
  ),
  servicos: (
    <>
      <path d="m14.5 5 4.5 4.5-9 9H5.5V14z" />
      <path d="m13 6.5 4.5 4.5" />
      <path d="M4 20h16" />
    </>
  ),
};

function NavigationIcon({ name }) {
  return (
    <svg
      className="nav-link-svg"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {iconPaths[name] || iconPaths.home}
    </svg>
  );
}

function renderLinks(items, onClose) {
  return items.map((item) => (
    <NavLink
      aria-label={item.label}
      className={({ isActive }) =>
        `nav-link${isActive ? " nav-link--active" : ""}`
      }
      end={item.path === "/"}
      key={item.path}
      onClick={onClose}
      title={item.label}
      to={item.path}
    >
      <span className="nav-link-icon" aria-hidden="true">
        <NavigationIcon name={item.icon} />
      </span>
      <span className="nav-link-label">{item.label}</span>
    </NavLink>
  ));
}

function Sidebar({ isCollapsed, isOpen, onClose, onToggleCollapsed }) {
  return (
    <aside className={`sidebar ${isOpen ? " sidebar--open" : ""}${isCollapsed ? " sidebar--collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <p className="eyebrow">Sistema principal</p>
          <h1>Sistema de Gestao</h1>
        </div>

        <button
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <p className="nav-group-title">Fluxo principal</p>
          {renderLinks(primaryNavigation, onClose)}
        </div>

        {supportNavigation.length ? (
          <div className="nav-group">
            <p className="nav-group-title">Outros modulos</p>
            {renderLinks(supportNavigation, onClose)}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}

export default Sidebar;
