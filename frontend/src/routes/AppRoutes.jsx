import { Fragment } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CrudDeactivatePage from "../components/CrudDeactivatePage";
import CrudFormPage from "../components/CrudFormPage";
import CrudListPage from "../components/CrudListPage";
import CrudModulePage from "../components/CrudModulePage";
import { orderedModules } from "../data/moduleConfigs";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {orderedModules.map((moduleConfig) => {
            const basePath = moduleConfig.basePath.replace(/^\//, "");

            return (
              <Fragment key={moduleConfig.key}>
                <Route path={basePath} element={<CrudModulePage moduleConfig={moduleConfig} />} />
                <Route path={`${basePath}/listar`} element={<CrudListPage moduleConfig={moduleConfig} />} />
                <Route
                  path={`${basePath}/novo`}
                  element={<CrudFormPage mode="create" moduleConfig={moduleConfig} />}
                />
                <Route
                  path={`${basePath}/editar`}
                  element={<CrudFormPage mode="edit" moduleConfig={moduleConfig} />}
                />
                <Route
                  path={`${basePath}/inativar`}
                  element={<CrudDeactivatePage moduleConfig={moduleConfig} />}
                />
              </Fragment>
            );
          })}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
