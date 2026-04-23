import { NavLink, useSearchParams } from "react-router-dom";

function ModuleActionNav({ actions }) {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  function buildPath(path) {
    if (!selectedId || path.endsWith("/novo") || !/\/(listar|editar|inativar)$/.test(path)) {
      return path;
    }

    return `${path}?id=${selectedId}`;
  }

  return (
    <div className="surface-card module-nav-shell">
      <div className="module-subnav">
        {actions.map((action) => (
          <NavLink
            className={({ isActive }) =>
              `module-subnav-link${isActive ? " module-subnav-link--active" : ""}`
            }
            end
            key={action.path}
            to={buildPath(action.path)}
          >
            {action.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default ModuleActionNav;
