import axios, { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'todo_auth_token';

export type ResponseFormat = 'json' | 'text' | 'blob';

// On utilise Omit pour remplacer le body natif et autoriser AxiosRequestConfig (pour onUploadProgress etc.)
export interface FetchApiOptions extends Omit<
  AxiosRequestConfig,
  'data' | 'responseType'
> {
  body?: unknown;
  responseType?: ResponseFormat;
}

// Les interfaces de retour restent identiques pour ne pas casser l'existant
interface BaseResponse {
  ok: boolean;
  status: number;
  headers: Headers; // Headers natifs simulés pour la compatibilité
  raw: AxiosResponse; // On remplace Response par AxiosResponse en interne
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
// Surcharges de typage (identiques)
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
// Implémentation via Axios
// --------------------------------------------------
export async function fetchAPI<T = unknown>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<JsonResponse<T> | TextResponse | BlobResponse> {
  const {
    body,
    responseType = 'json',
    headers: customHeaders,
    method = 'GET',
    ...restOptions
  } = options;

  // 1. Résolution de l'URL
  const url =
    endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // 2. Préparation des en-têtes (AxiosHeaders)
  const axiosHeaders = new AxiosHeaders(
    customHeaders as Record<string, string>
  );

  // Injection du JWT si disponible
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !axiosHeaders.has('Authorization')) {
    axiosHeaders.set('Authorization', `Bearer ${token}`);
  }

  // 3. Configuration du payload
  // Axios gère nativement le JSON et le FormData, pas besoin de JSON.stringify manuel
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== 'string'
  ) {
    if (!axiosHeaders.has('Content-Type')) {
      axiosHeaders.set('Content-Type', 'application/json');
    }
  }

  // Configuration Axios
  const axiosConfig: AxiosRequestConfig = {
    url,
    method,
    headers: axiosHeaders,
    data: body,
    responseType: responseType === 'json' ? 'json' : responseType, // Axios supporte 'json', 'blob', 'text'
    validateStatus: () => true, // axios ne jette pas d'erreur sur les status 4xx/5xx pour simuler le comportement de fetch
    ...restOptions, // Permet de passer onUploadProgress depuis l'extérieur
  };

  try {
    // 4. Exécution de la requête Axios
    const response = await axios.request(axiosConfig);

    // Simulation de l'objet Headers natif pour la rétrocompatibilité stricte de la propriété "headers"
    const nativeHeaders = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        nativeHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => nativeHeaders.append(key, v));
      }
    });

    const baseResult: BaseResponse = {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      headers: nativeHeaders,
      raw: response,
    };

    // 5. Traitement du format de retour
    if (responseType === 'blob') {
      return { ...baseResult, blob: response.data as Blob };
    }

    if (responseType === 'text') {
      return { ...baseResult, text: String(response.data) };
    }

    // Cas JSON par défaut
    if (response.status === 204) {
      return { ...baseResult, data: null as T };
    }

    return { ...baseResult, data: response.data as T };
  } catch (error) {
    // Gestion des erreurs réseau (CORS, perte de connexion...) non capturées par validateStatus
    throw error;
  }
}
