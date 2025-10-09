/**
 * 🎯 DELTA API SUITE - CONSTANTS
 * 
 * All application constants in one place for easy maintenance
 * Clean separation from business logic
 */

import type {
  ApiCategory,
  Environment,
  EnvironmentId,
  Platform,
  PlatformId,
  Version,
  VersionId
} from '@/types';

// 🌐 PLATFORM CONSTANTS
export const PLATFORMS: readonly Platform[] = [
  { id: 'm', name: 'MSite', prefix: '/m/', description: 'Mobile Website' },
  { id: 'w', name: 'Website', prefix: '/w/', description: 'Desktop Website' },
  { id: 'i', name: 'iOS', prefix: '/i/', description: 'iOS App' },
  { id: 'a', name: 'Android', prefix: '/a/', description: 'Android App' },
  { id: 'b', name: 'Backend', prefix: '/b/', description: 'Backend Services' },
  { id: 'v', name: 'Vernacular', prefix: '/v/', description: 'Vernacular Languages' },
  { id: 't', name: 'TV', prefix: '/t/', description: 'TV Platform' }
] as const;

// 📊 VERSION CONSTANTS
export const VERSIONS: readonly Version[] = [
  { id: '{version}', name: 'Version 1', description: 'Stable API' },
  { id: 'v2', name: 'Version 2', description: 'Latest API' }
] as const;

// 🌍 ENVIRONMENT CONSTANTS
export const ENVIRONMENTS: readonly Environment[] = [
  { id: 'prod', name: 'Production', baseUrl: 'https://apiprv.cricbuzz.com' },
  { id: 'dev', name: 'Development', baseUrl: 'https://apiserver.cricbuzz.com' },
  { id: 'staging', name: 'Staging', baseUrl: 'http://api.cricbuzz.stg' }
] as const;

// 🎯 API CATEGORY CONSTANTS
export const API_CATEGORIES: readonly ApiCategory[] = [
  { id: 'home', name: 'Home & Dashboard', icon: '🏠' },
  { id: 'match', name: 'Match Center', icon: '🏏' },
  { id: 'news', name: 'News & Content', icon: '📰' },
  { id: 'videos', name: 'Videos & Media', icon: '🎥' },
  { id: 'teams', name: 'Teams & Players', icon: '🏆' },
  { id: 'series', name: 'Series & Venues', icon: '🏟️' },
  { id: 'stats', name: 'Statistics', icon: '📊' },
  { id: 'schedule', name: 'Schedule', icon: '📅' },
  { id: 'authentication', name: 'Authentication', icon: '🔐' },
  { id: 'cbplus', name: 'CB Plus Premium', icon: '💎' },
  { id: 'iplAuction', name: 'IPL Auction', icon: '🏆' },
  { id: 'search', name: 'Search & Discovery', icon: '🔍' },
  { id: 'quiz', name: 'Quiz & Interactive', icon: '🎯' },
  { id: 'special', name: 'Special Content', icon: '🎪' }
] as const;

// 🔧 DEFAULT VALUES
export const DEFAULT_PLATFORM: PlatformId = 'm';
export const DEFAULT_VERSION: VersionId = '{version}';
export const DEFAULT_ENVIRONMENT: EnvironmentId = 'prod';

// ⏱️ TIMEOUT CONSTANTS
export const API_TIMEOUT = 30000; // 30 seconds
export const REQUEST_RETRIES = 3;

// 🎨 UI CONSTANTS
export const THEME_STORAGE_KEY = 'delta-theme';
export const STATE_STORAGE_KEY = 'deltapro-state';

// 📊 PAGINATION CONSTANTS
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 🔍 SEARCH CONSTANTS
export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 300;

// 🎯 COMPARISON CONSTANTS
export const MAX_COMPARISON_SIZE = 1024 * 1024; // 1MB
export const DIFF_CONTEXT_LINES = 3;
