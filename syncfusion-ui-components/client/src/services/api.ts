// Thin fetch wrapper: attaches the JWT bearer token and signals logout on 401.
export const API_URL: string = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'scm.auth';

export interface AuthUser { sub: string; name: string; role: string }
export interface AuthSession { token: string; expiresAt: number; user: AuthUser }

export const tokenStore = {
  get(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      return session.expiresAt > Date.now() ? session : null;
    } catch {
      return null;
    }
  },
  set(session: AuthSession) { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session)); },
  clear() { sessionStorage.removeItem(TOKEN_KEY); },
};

export const UNAUTHORIZED_EVENT = 'scm:unauthorized';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = tokenStore.get();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (session) headers.set('Authorization', `Bearer ${session.token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    tokenStore.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => apiFetch<{ user: AuthUser }>('/auth/me'),
};
