const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function buildUrl(resource, id = "") {
  const normalizedResource = resource.startsWith("/") ? resource : `/${resource}`;
  const normalizedId = id ? `/${id}` : "";
  return `${API_BASE_URL}${normalizedResource}${normalizedId}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function request(resource, options = {}, id = "") {
  const response = await fetch(buildUrl(resource, id), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.mensagem || data?.erro || "Nao foi possivel concluir a requisicao."
    );
  }

  return data;
}

export const api = {
  list(resource) {
    return request(resource);
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
