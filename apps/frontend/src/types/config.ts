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
      key: "home-v1-index",
      path: "/a/home/v1/index",
      platforms: ["a", "i", "m", "w"],
      idCategory: "matchId"
    }
  ],
  jobs: [
    {
      name: "Prod v1 vs Stg v1",
      platform: "a",
      baseA: "https://apiserver.cricbuzz.com",
      baseB: "http://api.cricbuzz.stg",
      endpointPairs: [
        {
          endpointA: "home-v1-index",
          endpointB: "home-v1-index"
        }
      ]
    }
  ],
  headers: [
    {
      key: "i",
      value: '{"accept":"application/json","cb-loc":["IN","US","CA","AE"],"cb-tz":"+0530","cb-appver":"15.8","user-agent":"CricbuzzMobile/15.8 (com.sports.iCric; build:198; iOS 17.7.1) Alamofire/4.9.1"}',
      enabled: true
    },
    {
      key: "a",
      value: '{"accept":"application/json","cb-loc":["IN","US","CA","AE"],"cb-tz":"+0530","cb-appver":"6.23.05","cb-src":"playstore","user-agent":"okhttp/4.12.0"}',
      enabled: true
    },
    {
      key: "m",
      value: '{"accept":"application/json","content-type":"application/json","cb-loc":["IN","US","CA","AE"],"cb-tz":"+0530","user-agent":"Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"}',
      enabled: true
    },
    {
      key: "w",
      value: '{"accept":"application/json, text/plain, */*","cb-loc":["IN","US","CA","AE"],"cb-tz":"+0530","user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"}',
      enabled: true
    }
  ],
  ids: [
    {
      category: "matchId",
      values: ["114960", "118928"]
    }
  ]
};
