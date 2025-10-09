/**
 * 🎨 DELTA API SUITE - UTILITY FUNCTIONS
 * 
 * Clean utility functions for the application
 * Professional separation of concerns
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for optimal className handling
 * @param inputs - Class values to merge
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
