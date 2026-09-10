const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'todo_auth_token';

export type ResponseFormat = 'json' | 'text' | 'blob';

export interface FetchApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  responseType?: ResponseFormat;
}

interface BaseResponse {
  ok: boolean;
  status: number;
  headers: Headers;
  raw: Response;
}

export interface JsonResponse<T> extends BaseResponse {
  data: T;
  text?: never;
  blob?: never;
}

export interface TextResponse extends BaseResponse {
  data?: never;
  text: string;
  blob?: never;
}

export interface BlobResponse extends BaseResponse {
  data?: never;
  text?: never;
  blob: Blob;
}

// --------------------------------------------------
// Surcharges de typage
// --------------------------------------------------
export async function fetchAPI(
  endpoint: string,
  options: FetchApiOptions & { responseType: 'blob' }
): Promise<BlobResponse>;

export async function fetchAPI(
  endpoint: string,
  options: FetchApiOptions & { responseType: 'text' }
): Promise<TextResponse>;

export async function fetchAPI<T = unknown>(
  endpoint: string,
  options?: FetchApiOptions & { responseType?: 'json' }
): Promise<JsonResponse<T>>;

// --------------------------------------------------
// Implémentation
// --------------------------------------------------
export async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<JsonResponse<T> | TextResponse | BlobResponse> {
  const {
    body,
    responseType = 'json',
    headers: customHeaders,
    ...restOptions
  } = options;

  // 1. Résolution de l'URL
  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // 2. Préparation des en-têtes
  const headers = new Headers(customHeaders);

  // Injection du JWT si disponible
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 3. Sérialisation du corps si nécessaire
  let payload: BodyInit | null | undefined;

  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== 'string'
  ) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    payload = JSON.stringify(body);
  } else {
    payload = body as BodyInit | null | undefined;
  }

  // 4. Exécution de la requête
  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: payload,
  });

  const baseResult: BaseResponse = {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    raw: response,
  };

  // 5. Traitement du format de retour
  if (responseType === 'blob') {
    const blob = await response.blob();
    return { ...baseResult, blob };
  }

  if (responseType === 'text') {
    const text = await response.text();
    return { ...baseResult, text };
  }

  // Cas par défaut: JSON (gestion du HTTP 204 No Content)
  if (response.status === 204) {
    return { ...baseResult, data: null as T };
  }

  const data = (await response.json().catch(() => null)) as T;
  return { ...baseResult, data };
}
