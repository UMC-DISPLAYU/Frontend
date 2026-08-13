export type ImageOptimizationFormat = 'webp' | 'original';

type OptimizeImageUrlOptions = {
  format?: ImageOptimizationFormat;
  quality?: number;
  maxScale?: number;
};

const VERCEL_IMAGE_ENDPOINT = '/_vercel/image';
const DEFAULT_QUALITY = 75;
const DEFAULT_MAX_SCALE = 2.6;
const MAX_REQUEST_WIDTH = 3840;
const VERCEL_IMAGE_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];
const OPTIMIZABLE_HOST_KEYWORDS = ['cloudfront.net', 'amazonaws.com'];
const NON_OPTIMIZABLE_EXTENSIONS = /\.(svg|gif)(?:[?#].*)?$/i;
const VERCEL_OPTIMIZATION_HOSTS = ['displayu.co.kr'];

const canUseVercelImageOptimization = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname } = window.location;

  return (
    hostname.endsWith('.vercel.app') ||
    VERCEL_OPTIMIZATION_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  );
};

const getRequestWidth = (displayWidth: number, maxScale = DEFAULT_MAX_SCALE) => {
  if (!Number.isFinite(displayWidth) || displayWidth <= 0) {
    return undefined;
  }

  const scaledWidth = Math.min(Math.ceil(displayWidth * maxScale), MAX_REQUEST_WIDTH);

  return VERCEL_IMAGE_WIDTHS.find((width) => width >= scaledWidth) ?? MAX_REQUEST_WIDTH;
};

const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

export const isOptimizableImageUrl = (url?: string | null) => {
  if (!url || !isHttpUrl(url) || NON_OPTIMIZABLE_EXTENSIONS.test(url)) {
    return false;
  }

  try {
    const { hostname } = new URL(url);

    return OPTIMIZABLE_HOST_KEYWORDS.some((keyword) => hostname.includes(keyword));
  } catch {
    return false;
  }
};

export const optimizeImageUrl = (
  originalUrl: string,
  displayWidth: number,
  format: ImageOptimizationFormat = 'webp',
  options: OptimizeImageUrlOptions = {},
) => {
  if (
    format === 'original' ||
    !canUseVercelImageOptimization() ||
    !isOptimizableImageUrl(originalUrl)
  ) {
    return originalUrl;
  }

  const requestWidth = getRequestWidth(displayWidth, options.maxScale);

  if (!requestWidth) {
    return originalUrl;
  }

  const params = new URLSearchParams({
    url: originalUrl,
    w: String(requestWidth),
    q: String(options.quality ?? DEFAULT_QUALITY),
  });

  return `${VERCEL_IMAGE_ENDPOINT}?${params.toString()}`;
};
