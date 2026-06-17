export function getRequestErrorResponse(error, fallbackMessage) {
  if (error.name === "ValidationError") {
    return {
      status: 400,
      body: {
        mensagem: Object.values(error.errors)
          .map((currentError) => currentError.message)
          .join(" "),
      },
    };
  }

  if (error.name === "CastError") {
    return {
      status: 400,
      body: { mensagem: "Identificador informado é inválido." },
    };
  }

  if (error.code === 11000) {
    return {
      status: 400,
      body: { mensagem: "Já existe um registro com esses dados." },
    };
  }

  return {
    status: 500,
    body: { mensagem: fallbackMessage || error.message },
  };
}
