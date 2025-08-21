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
  headers: { [platform: string]: { [key: string]: string | string[] } };
  ids: { [category: string]: IdValue[] };
}

// Default empty config
export const defaultConfig: ConfigState = {
  endpoints: [],
  jobs: [],
  headers: {},
  ids: {}
};

// Sample data for demonstration - Cricbuzz Venues API V1 vs V2 Comparison (venueId=31)
export const sampleConfig: ConfigState = {
  endpoints: [
    {
      key: "venue-details-v1",
      path: "m/venues/v1/{venueId}",
      baseUrlA: "https://apiserver.cricbuzz.com",
      baseUrlB: "https://apiserver.cricbuzz.com",
      platforms: ["i", "a", "m", "w"],
      idCategory: "venueId"
    },
    {
      key: "venue-details-v2",
      path: "m/venues/v2/{venueId}",
      baseUrlA: "https://apiserver.cricbuzz.com",
      baseUrlB: "https://apiserver.cricbuzz.com",
      platforms: ["i", "a", "m", "w"],
      idCategory: "venueId"
    }
  ],
  jobs: [
    {
      name: "iOS: Venues V1 vs V2 (venueId=31)",
      platform: "i",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "venue-details-v1",
          endpointB: "venue-details-v2"
        }
      ]
    },
    {
      name: "Android: Venues V1 vs V2 (venueId=31)",
      platform: "a",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "venue-details-v1",
          endpointB: "venue-details-v2"
        }
      ]
    },
    {
      name: "Mobile Web: Venues V1 vs V2 (venueId=31)",
      platform: "m",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "venue-details-v1",
          endpointB: "venue-details-v2"
        }
      ]
    },
    {
      name: "Desktop Web: Venues V1 vs V2 (venueId=31)",
      platform: "w",
      ignorePaths: ["responseLastUpdated", "timestamp"],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointPairs: [
        {
          endpointA: "venue-details-v1",
          endpointB: "venue-details-v2"
        }
      ]
    }
  ],
  headers: {
    "i": {
      "accept": "application/json",
      "cb-loc": ["IN", "US", "CA", "AE"],
      "cb-tz": "+0530",
      "cb-appver": "15.8",
      "user-agent": "CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1"
    },
    "a": {
      "accept": "application/json",
      "cb-loc": ["IN", "US", "CA", "AE"],
      "cb-tz": "+0530",
      "cb-appver": "6.23.05",
      "cb-src": "playstore",
      "user-agent": "okhttp/4.12.0"
    },
    "m": {
      "accept": "application/json",
      "content-type": "application/json",
      "cb-loc": ["IN", "US", "CA", "AE"],
      "cb-tz": "+0530",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
    },
    "w": {
      "accept": "application/json, text/plain, */*",
      "cb-loc": ["IN", "US", "CA", "AE"],
      "cb-tz": "+0530",
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    }
  },
  ids: {
    "venueId": [
      { name: "Eden Gardens, Kolkata (Primary Test)", value: "31", enabled: true },
      { name: "Wankhede Stadium, Mumbai", value: "45", enabled: false },
      { name: "M. Chinnaswamy Stadium, Bangalore", value: "67", enabled: false },
      { name: "Feroz Shah Kotla, Delhi", value: "89", enabled: false },
      { name: "MA Chidambaram Stadium, Chennai", value: "23", enabled: false }
    ]
  }
};
