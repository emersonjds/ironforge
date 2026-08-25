let currentToken: string | null = null;

export function setApiAuthToken(token: string | null): void {
  currentToken = token;
}

export function getApiAuthToken(): string | null {
  return currentToken;
}
