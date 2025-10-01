import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the base URL for static assets (images, files, etc.)
 * This extracts the base URL from the API_BASE_URL environment variable
 */
export function getBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api';
  
  // Remove the /index.php/api part to get the base URL
  const baseUrl = apiBaseUrl.replace('/index.php/api', '');
  
  return baseUrl;
}
