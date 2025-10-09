/**
 * 🎯 DELTA API SUITE - TYPE DEFINITIONS
 * 
 * Professional type definitions for the Delta API Suite
 * Clean separation of interfaces and constants for maintainability
 */

// 🌐 PLATFORM TYPES
export interface Platform {
  readonly id: string;
  readonly name: string;
  readonly prefix: string;
  readonly description: string;
}

export type PlatformId = 'm' | 'w' | 'i' | 'a' | 'b' | 'v' | 't';

// 📊 VERSION TYPES
export interface Version {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export type VersionId = '{version}' | 'v2';

// 🌍 ENVIRONMENT TYPES
export interface Environment {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
}

export type EnvironmentId = 'prod' | 'staging' | 'dev';

// 🎯 API CATEGORY TYPES
export interface ApiCategory {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

export type ApiCategoryId = 'home' | 'match' | 'news' | 'videos' | 'teams' | 'series' | 
  'stats' | 'schedule' | 'authentication' | 'cbplus' | 'iplAuction' | 'search' | 
  'quiz' | 'special';

// 🔗 API ENDPOINT TYPES
export interface ApiEndpoint {
  readonly id: string;
  readonly category: ApiCategoryId;
  readonly group?: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly pathTemplate: string;
  readonly platformPrefix: string;
  readonly versionHint: string;
  readonly parameters: ParameterDefinition[];
  readonly examples?: string[];
}

export interface ParameterDefinition {
  readonly name: string;
  readonly key: string;
  readonly type: 'string' | 'number' | 'boolean';
  readonly required: boolean;
  readonly description: string;
  readonly placeholder: string;
  readonly example?: string;
}

// 📚 API LIBRARY STRUCTURE
export interface ApiLibrary {
  readonly [category: string]: {
    readonly [endpoint: string]: string | ApiEndpoint | {
      readonly [subEndpoint: string]: string | ApiEndpoint;
    };
  };
}

// 🔧 UTILITY TYPES
export interface ApiUrlOptions {
  readonly platform?: PlatformId;
  readonly version?: VersionId;
  readonly environment?: EnvironmentId;
  readonly parameters?: Record<string, string>;
}

// 📊 COMPARISON TYPES
export interface ComparisonResult {
  readonly isMatch: boolean;
  readonly identical: boolean;
  readonly differences: DiffItem[];
  readonly summary: {
    readonly totalDifferences: number;
    readonly totalFields: number;
    readonly identicalFields: number;
    readonly differentFields: number;
    readonly missingFields: number;
    readonly extraFields: number;
    readonly added: number;
    readonly removed: number;
    readonly modified: number;
  };
}

export interface DiffItem {
  readonly path: string;
  readonly type: 'added' | 'removed' | 'modified' | 'missing' | 'extra' | 'changed' | 'type-changed';
  readonly oldValue?: any;
  readonly newValue?: any;
  readonly sourceValue?: any;
  readonly targetValue?: any;
  readonly description: string;
}

// 🎨 UI TYPES
export interface ApiResponse {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly durationMs: number;
  readonly size: number;
  readonly body: any;
  readonly url: string;
}

export interface ApiRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body?: any;
}

// 🎯 CONFIGURATION TYPES
export interface AppConfig {
  readonly api: {
    readonly baseUrls: Record<EnvironmentId, string>;
    readonly timeout: number;
    readonly retries: number;
  };
  readonly ui: {
    readonly theme: 'light' | 'dark' | 'system';
    readonly defaultPlatform: PlatformId;
    readonly defaultVersion: VersionId;
    readonly defaultEnvironment: EnvironmentId;
  };
  readonly features: {
    readonly enableCaching: boolean;
    readonly enableAnalytics: boolean;
    readonly enableErrorReporting: boolean;
  };
}
