// Types for Config Editor

// Endpoint config item
export interface Endpoint {
  key: string;
  path: string;
  platforms: string[];
  idCategory: string | null;
}

// Job config item
export interface Job {
  name: string;
  platform: string;
  baseA: string;
  baseB: string;
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

// ID config item
export interface Id {
  category: string;
  values: string[];
}

// Full config state
export interface ConfigState {
  endpoints: Endpoint[];
  jobs: Job[];
  headers: Header[];
  ids: Id[];
}

// Default empty config
export const defaultConfig: ConfigState = {
  endpoints: [],
  jobs: [],
  headers: [],
  ids: []
};

// Sample data for demonstration
export const sampleConfig: ConfigState = {
  endpoints: [
    {
      key: "home-matches-v1",
      path: "home/v1/matches",
      platforms: ["a", "i", "m", "w"],
      idCategory: null
    },
    {
      key: "home-matches-v2",
      path: "home/v2/matches",
      platforms: ["a", "i", "m", "w"],
      idCategory: null
    }
  ],
  jobs: [
    {
      name: "Prod v1 vs Stg v2",
      platform: "a",
      baseA: "https://apiserver.cricbuzz.com",
      baseB: "http://api.cricbuzz.stg",
      endpointPairs: [
        {
          endpointA: "home-matches-v1",
          endpointB: "home-matches-v2"
        }
      ]
    }
  ],
  headers: [
    {
      key: "Content-Type",
      value: "application/json",
      enabled: true
    }
  ],
  ids: [
    {
      category: "matchId",
      values: ["12345", "67890"]
    }
  ]
};
