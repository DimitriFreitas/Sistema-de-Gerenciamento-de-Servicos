import { useLocation } from "react-router-dom";
import { getRouteMeta } from "../config/navigation";

function Header({ onMenuToggle }) {
  const location = useLocation();
  const routeMeta = getRouteMeta(location.pathname);

  return (
    <header className="header">
      <div className="header-main">
        <button
          aria-label="Abrir menu lateral"
          className="menu-toggle"
          onClick={onMenuToggle}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <div>
          <p className="eyebrow">{routeMeta.eyebrow}</p>
          <h2>{routeMeta.label}</h2>
        </div>
      </div>
    </header>
  );
}

export default Header;
