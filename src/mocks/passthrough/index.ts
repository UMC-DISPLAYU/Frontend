import { http, passthrough } from 'msw';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

type PassthroughEndpoint = {
  method: HttpMethod | 'ALL';
  path: string;
};

type LocalPassthroughConfig = {
  MSW_LOCAL_PASSTHROUGH_ENDPOINTS?: string[];
};

const localConfigModules = import.meta.glob<LocalPassthroughConfig>('./config.local.ts', {
  eager: true,
});

const localPassthroughEndpoints =
  Object.values(localConfigModules)[0]?.MSW_LOCAL_PASSTHROUGH_ENDPOINTS ?? [];

const normalizePath = (path: string) => {
  try {
    return new URL(path).pathname.replace(/\/$/, '');
  } catch {
    return path.replace(/\/$/, '');
  }
};

const parseEndpoint = (endpoint: string): PassthroughEndpoint | null => {
  const trimmed = endpoint.trim();

  if (!trimmed) {
    return null;
  }

  const [maybeMethod, maybePath] = trimmed.split(/\s+/, 2);
  const method = maybeMethod.toUpperCase();

  if (HTTP_METHODS.includes(method as HttpMethod) && maybePath) {
    return { method: method as HttpMethod, path: normalizePath(maybePath) };
  }

  return { method: 'ALL', path: normalizePath(trimmed) };
};

const passthroughEndpoints = localPassthroughEndpoints
  .map(parseEndpoint)
  .filter((endpoint): endpoint is PassthroughEndpoint => endpoint !== null);

const toMswPaths = (path: string) => {
  const withoutApiPrefix = path.replace(/^\/api/, '');

  return path === withoutApiPrefix ? [`*${path}`] : [`*${path}`, `*${withoutApiPrefix}`];
};

const createPassthroughHandler = ({ method, path }: PassthroughEndpoint) => {
  const resolver = () => passthrough();
  const createHandler =
    method === 'ALL' ? http.all : http[method.toLowerCase() as Lowercase<HttpMethod>];

  return toMswPaths(path).map((mswPath) => createHandler(mswPath, resolver));
};

export const passthroughHandlers = passthroughEndpoints.flatMap(createPassthroughHandler);
