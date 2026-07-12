const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir esta ação. Tenta novamente dentro de instantes.";
const NETWORK_ERROR_MESSAGE = "Não conseguimos ligar ao serviço neste momento. Verifica a internet e tenta novamente.";
const SESSION_ERROR_MESSAGE = "A tua sessão expirou. Inicia sessão novamente para continuares.";

const technicalPatterns = [
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "network request failed",
  "load failed",
  "econnrefused",
  "timeout",
  "request failed",
  "internal server error",
  "traceback",
  "stack",
  "typeerror",
  "referenceerror",
  "syntaxerror",
  "sqlalchemy",
  "database",
  "postgres",
  "supabase",
  "auth/v1",
  "jwt",
  "webpack",
  "module",
  "localhost",
  "127.0.0.1",
];

export function getFriendlyErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  if (error instanceof Error) {
    return normalizeErrorMessage(error.message, fallback);
  }

  if (typeof error === "string") {
    return normalizeErrorMessage(error, fallback);
  }

  return fallback;
}

export function normalizeErrorMessage(message?: string | null, fallback = DEFAULT_ERROR_MESSAGE) {
  const cleanMessage = message?.trim();

  if (!cleanMessage) {
    return fallback;
  }

  const lowerMessage = cleanMessage.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "Email ou palavra-passe incorretos. Confirma os dados e tenta novamente.";
  }

  if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("not confirmed")) {
    return "Ainda falta confirmar o email. Enviámos um link de confirmação para a tua caixa de entrada.";
  }

  if (
    lowerMessage.includes("sessão inválida") ||
    lowerMessage.includes("sessao invalida") ||
    lowerMessage.includes("expired") ||
    lowerMessage.includes("token")
  ) {
    return SESSION_ERROR_MESSAGE;
  }

  if (
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("timeout")
  ) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (technicalPatterns.some((pattern) => lowerMessage.includes(pattern))) {
    return fallback;
  }

  if (/\b(4\d\d|5\d\d)\b/.test(cleanMessage)) {
    return fallback;
  }

  return cleanMessage;
}
