// Types for Config Editor

// Endpoint config item
export interface Endpoint {
  key: string;
  path: string;
  baseUrlA?: string;
  baseUrlB?: string;
  platforms: string[];
  idCategory?: string | null;
}

// Job config item
export interface Job {
  name: string;
  platform: string;
  baseA?: string;
  baseB?: string;
  baseUrlA?: string;
  baseUrlB?: string;
  ignorePaths?: string[];
  retryPolicy?: {
    retries: number;
    delayMs: number;
  };
  endpointPairs: EndpointPair[];
}

export interface EndpointPair {
  endpointA: string;
  endpointB: string;
}

// Header config item
export interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

// ID value item
export interface IdValue {
  name: string;
  value: string;
  enabled?: boolean;
}

// ID config item
export interface Id {
  category: string;
  values: IdValue[];
}

// Full config state
export interface ConfigState {
  endpoints: Endpoint[];
  jobs: Job[];
  headers: { [platform: string]: { [key: string]: string } };
  ids: { [category: string]: IdValue[] };
}

// Default empty config
export const defaultConfig: ConfigState = {
  endpoints: [],
  jobs: [],
  headers: {},
  ids: {}
};

// Sample data for demonstration - Real Cricbuzz Production vs Staging + V1 vs V2 Comparison
export const sampleConfig: ConfigState = {
  endpoints: [
    {
      key: "home-matches-v1",
      path: "/w/home/v1/matches",
      baseUrlA: "https://apiserver.cricbuzz.com",
      baseUrlB: "https://apiserver.cricbuzz.com",
      platforms: ["i", "a", "m", "w"]
    },
    {
      key: "home-matches-v2",
      path: "/w/home/v2/matches",
      baseUrlA: "https://apiserver.cricbuzz.com",
      baseUrlB: "https://apiserver.cricbuzz.com",
      platforms: ["i", "a", "m", "w"]
    },
    {
      key: "home-matches-prod-vs-stg",
      path: "/w/home/v1/matches",
      baseUrlA: "https://apiserver.cricbuzz.com",
      baseUrlB: "http://api.cricbuzz.stg",
      platforms: ["i", "a", "m", "w"]
    }
  ],
  jobs: [
    {
      name: "iOS: Home Matches V1 vs V2",
      platform: "i",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "home-matches-v1",
          endpointB: "home-matches-v2"
        }
      ]
    },
    {
      name: "Android: Home Matches V1 vs V2",
      platform: "a",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "home-matches-v1",
          endpointB: "home-matches-v2"
        }
      ]
    },
    {
      name: "iOS: Production vs Staging",
      platform: "i",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "home-matches-prod-vs-stg",
          endpointB: "home-matches-prod-vs-stg"
        }
      ]
    },
    {
      name: "Android: Production vs Staging",
      platform: "a",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "home-matches-prod-vs-stg",
          endpointB: "home-matches-prod-vs-stg"
        }
      ]
    }
  ],
  headers: {
    "i": {
      "accept": "application/json",
      "cb-loc": "IN",
      "cb-tz": "Asia/Kolkata",
      "cb-appver": "15.8",
      "user-agent": "CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1"
    },
    "a": {
      "accept": "application/json",
      "cb-loc": "IN",
      "cb-tz": "Asia/Kolkata",
      "cb-appver": "6.23.05",
      "cb-src": "playstore",
      "user-agent": "okhttp/4.12.0"
    },
    "m": {
      "accept": "application/json",
      "content-type": "application/json",
      "cb-loc": "IN",
      "cb-tz": "Asia/Kolkata",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
    },
    "w": {
      "accept": "application/json, text/plain, */*",
      "cb-loc": "IN",
      "cb-tz": "Asia/Kolkata",
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    }
  },
  ids: {
    "matchId": [
      { name: "India vs England ODI", value: "114960" },
      { name: "Australia vs New Zealand T20", value: "118928" }
    ]
  }
};
