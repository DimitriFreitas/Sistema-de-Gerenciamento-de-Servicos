import { NavLink } from "react-router-dom";
import { primaryNavigation, supportNavigation } from "../config/navigation";

function renderLinks(items, onClose) {
  return items.map((item) => (
    <NavLink
      className={({ isActive }) =>
        `nav-link${isActive ? " nav-link--active" : ""}`
      }
      end={item.path === "/"}
      key={item.path}
      onClick={onClose}
      to={item.path}
    >
      <span>{item.label}</span>
    </NavLink>
  ));
}

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar-brand">
        <p className="eyebrow">Sistema principal</p>
        <h1>Sistema de Gestao</h1>

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
