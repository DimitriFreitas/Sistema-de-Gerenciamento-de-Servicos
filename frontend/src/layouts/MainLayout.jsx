import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  const [sidebarState, setSidebarState] = useState({
    isOpen: false,
    pathname: "/",
  });
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isSidebarOpen =
    sidebarState.isOpen && sidebarState.pathname === location.pathname;

  function toggleSidebar() {
    setSidebarState((current) => ({
      isOpen: !(current.isOpen && current.pathname === location.pathname),
      pathname: location.pathname,
    }));
  }

  function closeSidebar() {
    setSidebarState({
      isOpen: false,
      pathname: location.pathname,
    });
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen ? (
        <button
          aria-label="Fechar menu lateral"
          className="sidebar-overlay"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}

      <div className="app-main">
        {isHomePage ? null : <Header onMenuToggle={toggleSidebar} />}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
