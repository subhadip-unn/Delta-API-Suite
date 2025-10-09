/**
 * URL utility functions for API requests
 */

/**
 * Generate full URL from request parts
 * @param baseUrl - Base URL
 * @param platform - Platform path
 * @param path - API path
 * @param version - API version
 * @returns Full URL string
 */
export function generateURL(
  baseUrl: string,
  platform: string,
  path: string,
  version?: string
): string {
  // Replace {version} placeholder with actual version
  const dynamicPath = version ? path.replace(/{version}/g, version) : path;
  return `${baseUrl}${platform}${dynamicPath}`;
}

/**
 * Parse URL into components
 * @param url - Full URL to parse
 * @returns URL components or null if invalid
 */
export function parseURL(url: string): {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  hash: string;
} | null {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
    };
  } catch {
    return null;
  }
}

/**
 * Add or update query parameter in URL
 * @param url - Base URL
 * @param param - Parameter name
 * @param value - Parameter value
 * @returns Updated URL
 */
export function addQueryParam(url: string, param: string, value: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(param, value);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Remove query parameter from URL
 * @param url - Base URL
 * @param param - Parameter name
 * @returns Updated URL
 */
export function removeQueryParam(url: string, param: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(param);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

