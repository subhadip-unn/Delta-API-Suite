import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Lightbulb, Zap, Globe, Smartphone, Monitor, Tablet, ChevronRight, Copy, ExternalLink } from 'lucide-react';

interface ConfigFTUEProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExample: (example: any) => void;
}

const EXAMPLE_CONFIGS = {
  venueComparison: {
    title: "🏟️ Venue API (v1 vs v2)",
    description: "Compare venue endpoints across versions and platforms",
    config: {
      endpoints: [
        {
          key: "venue-details",
          baseUrlA: "https://apiserver.cricbuzz.com",
          baseUrlB: "https://apiserver.cricbuzz.com", 
          pathA: "{platform}/venues/v1/{venueId}",
          pathB: "{platform}/venues/v2/{venueId}",
          platforms: ["i", "a", "m", "w"]
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
        venueId: [
          { name: "Eden Gardens", value: "31" },
          { name: "Wankhede Stadium", value: "45" },
          { name: "M. Chinnaswamy Stadium", value: "67" }
        ]
      }
    }
  },
  matchComparison: {
    title: "🏏 Match API (Prod vs Staging)",
    description: "Compare production vs staging environments",
    config: {
      endpoints: [
        {
          key: "match-details",
          baseUrlA: "https://api.cricbuzz.com",
          baseUrlB: "https://api.cricbuzz.stg",
          pathA: "{platform}/matches/v1/{matchId}",
          pathB: "{platform}/matches/v1/{matchId}",
          platforms: ["i", "a", "m", "w"]
        }
      ]
    }
  }
};

const PLATFORM_INFO = {
  i: { name: "iOS", icon: Smartphone, color: "bg-blue-500" },
  a: { name: "Android", icon: Smartphone, color: "bg-green-500" },
  m: { name: "Mobile Web", icon: Tablet, color: "bg-purple-500" },
  w: { name: "Website", icon: Monitor, color: "bg-orange-500" }
};

export default function ConfigFTUE({ isOpen, onClose, onLoadExample }: ConfigFTUEProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleLoadExample = (exampleKey: string) => {
    const example = EXAMPLE_CONFIGS[exampleKey as keyof typeof EXAMPLE_CONFIGS];
    onLoadExample(example.config);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">API Testing Made Simple</h2>
                    <p className="text-blue-100">Professional multi-platform API comparison</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Quick Start Examples */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Start Examples
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(EXAMPLE_CONFIGS).map(([key, example]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedExample === key ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedExample(selectedExample === key ? null : key)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{example.title}</CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                              {example.config.endpoints[0].platforms.map((platform: string) => {
                                const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
                                const Icon = info.icon;
                                return (
                                  <Badge key={platform} variant="secondary" className="text-xs">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {info.name}
                                  </Badge>
                                );
                              })}
                            </div>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadExample(key);
                              }}
                            >
                              Load Example
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Configuration Guide */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-500" />
                  Configuration Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🎯 Endpoint Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium text-sm">For v1 vs v2 comparison:</p>
                        <code className="text-xs block mt-1">
                          Base URL A: https://api.cricbuzz.com<br/>
                          Path A: {"{platform}"}/venues/v1/{"{venueId}"}<br/>
                          Path B: {"{platform}"}/venues/v2/{"{venueId}"}
                        </code>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium text-sm">For prod vs staging:</p>
                        <code className="text-xs block mt-1">
                          Base URL A: https://api.cricbuzz.com<br/>
                          Base URL B: https://api.cricbuzz.stg<br/>
                          Same paths for both
                        </code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">🌍 Multi-Platform Testing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                          const Icon = info.icon;
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <div className={`p-1 rounded ${info.color} text-white`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium">{key.toUpperCase()}</span>
                              <span className="text-sm text-muted-foreground">{info.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium text-sm">Multi-Geo Support:</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          cb-loc: ["IN", "US", "CA", "AE"] automatically tests all regions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step by Step */}
              <div>
                <h3 className="text-xl font-semibold mb-4">📋 Step-by-Step Setup</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Define Endpoints",
                      description: "Set base URLs and paths with {platform} and {paramId} placeholders"
                    },
                    {
                      step: 2,
                      title: "Configure Headers",
                      description: "Platform-specific headers with multi-geo support (cb-loc arrays)"
                    },
                    {
                      step: 3,
                      title: "Add Parameters",
                      description: "Define dynamic IDs (venueId, matchId) with multiple test values"
                    },
                    {
                      step: 4,
                      title: "Run Comparison",
                      description: "Automatic multi-platform, multi-geo, multi-parameter testing"
                    }
                  ].map((item) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: item.step * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  💡 Pro tip: Use placeholders like {"{platform}"} and {"{venueId}"} for dynamic testing
                </p>
                <Button onClick={onClose}>
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
