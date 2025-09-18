'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        } else if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        } else if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
          }
        } else if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        } else if (entry.entryType === 'navigation') {
          setMetrics(prev => ({ ...prev, ttfb: (entry as any).responseStart - (entry as any).requestStart }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
    } catch (e) {
      // Performance Observer not supported
    }

    // Show metrics after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  const getScore = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'N/A';
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.poor) return 'Needs Improvement';
    return 'Poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'Good': return 'text-green-500';
      case 'Needs Improvement': return 'text-yellow-500';
      case 'Poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 bg-card/90 backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-xs"
      >
        <div className="text-xs font-semibold mb-2 text-muted-foreground">Performance Metrics</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getScoreColor(getScore(metrics.lcp, { good: 2500, poor: 4000 }))}>
              {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getScoreColor(getScore(metrics.fid, { good: 100, poor: 300 }))}>
              {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getScoreColor(getScore(metrics.cls, { good: 0.1, poor: 0.25 }))}>
              {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getScoreColor(getScore(metrics.fcp, { good: 1800, poor: 3000 }))}>
              {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getScoreColor(getScore(metrics.ttfb, { good: 800, poor: 1800 }))}>
              {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
