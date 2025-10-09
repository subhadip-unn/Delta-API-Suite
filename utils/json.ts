/**
 * JSON utility functions for parsing and formatting
 */

/**
 * Safely parse JSON string
 * @param text - String to parse
 * @returns Parsed JSON object or null if invalid
 */
export function parseJSON<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Format object as JSON string
 * @param obj - Object to format
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON string or original value as string
 */
export function formatJSON(obj: unknown, indent = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}

/**
 * Validate if string is valid JSON
 * @param text - String to validate
 * @returns True if valid JSON
 */
export function isValidJSON(text: string): boolean {
  return parseJSON(text) !== null;
}

/**
 * Pretty print JSON with syntax highlighting metadata
 * @param obj - Object to pretty print
 * @returns Object with formatted JSON and metadata
 */
export function prettyPrintJSON(obj: unknown) {
  const formatted = formatJSON(obj, 2);
  const lines = formatted.split('\n');
  
  return {
    formatted,
    lines,
    lineCount: lines.length,
    size: new Blob([formatted]).size,
  };
}

