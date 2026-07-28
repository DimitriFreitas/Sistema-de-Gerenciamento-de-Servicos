const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a requisição.";
const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao backend. Verifique se a API está rodando.";

function appendSearchParams(url, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined && item !== null && item !== "")
        .forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function buildUrl(resource, id = "", params = {}) {
  const normalizedResource = resource.startsWith("/") ? resource : `/${resource}`;
  const normalizedId = id ? `/${encodeURIComponent(id)}` : "";

  return appendSearchParams(`${API_BASE_URL}${normalizedResource}${normalizedId}`, params);
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return response.text();
  }

  return response.json();
}

function isAbortError(error) {
  return error?.name === "AbortError" || String(error?.message ?? "").includes("NS_BINDING_ABORTED");
}

export async function request(resource, options = {}, id = "") {
  const { headers = {}, params, ...fetchOptions } = options;
  const hasBody = fetchOptions.body !== undefined;
  const requestHeaders = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  let response;

  try {
    response = await fetch(buildUrl(resource, id, params), {
      ...fetchOptions,
      ...(Object.keys(requestHeaders).length ? { headers: requestHeaders } : {}),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if ([502, 503, 504].includes(response.status)) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    throw new Error(
      data?.mensagem ||
      data?.erro ||
      (typeof data === "string" ? data : "") ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  return data;
}

export const api = {
  list(resource, params = {}, options = {}) {
    return request(resource, { ...options, params });
  },
  create(resource, payload) {
    return request(resource, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(resource, id, payload) {
    return request(
      resource,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      id
    );
  },
  remove(resource, id) {
    return request(
      resource,
      {
        method: "DELETE",
      },
      id
    );
  },
};
