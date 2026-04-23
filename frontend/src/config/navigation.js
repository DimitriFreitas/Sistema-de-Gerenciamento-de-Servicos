import { orderedModules } from "../data/moduleConfigs";

export const primaryNavigation = [
  {
    label: "Inicio",
    path: "/",
    description: "Visao geral do sistema e acesso aos modulos principais.",
  },
  ...orderedModules.map((module) => ({
    label: module.label,
    path: module.basePath,
    description: module.summary,
  })),
];

export const supportNavigation = [];

const routeMetadata = {
  "/": {
    eyebrow: "Tela inicial",
    label: "Bem-vindo",
    description: "Sistema com modulos de clientes e produtos prontos para operacao.",
  },
  ...orderedModules.reduce((accumulator, module) => {
    accumulator[module.basePath] = module.routeMeta.base;
    accumulator[`${module.basePath}/listar`] = module.routeMeta.list;
    accumulator[`${module.basePath}/novo`] = module.routeMeta.create;
    accumulator[`${module.basePath}/editar`] = module.routeMeta.edit;
    accumulator[`${module.basePath}/inativar`] = module.routeMeta.deactivate;
    return accumulator;
  }, {}),
};

const orderedPaths = Object.keys(routeMetadata).sort(
  (left, right) => right.length - left.length
);

export function getRouteMeta(pathname) {
  const exactMatch = routeMetadata[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = orderedPaths.find((path) => pathname.startsWith(path));

  return (
    routeMetadata[partialMatch] ?? {
      eyebrow: "Navegacao",
      label: "Sistema de Gestao",
      description: "Fluxo principal de operacao do sistema.",
    }
  );
}
