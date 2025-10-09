'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTour } from '@/contexts/tour-context';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Code,
  FileText,
  Globe,
  Lightbulb,
  Settings,
  SkipForward,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface GlobalTourStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
  highlight?: 'header' | 'tabs' | 'content' | 'none';
  mode?: string;
}

const globalTourSteps: GlobalTourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DeltaPro+',
    description: 'Your professional API testing suite. Let\'s explore the powerful features that will streamline your API comparison workflow.',
    icon: <Zap className="w-5 h-5" />,
    highlight: 'none'
  },
  {
    id: 'header',
    title: 'Professional Interface',
    description: 'Clean, modern interface with Cricbuzz branding and theme controls. Everything you need is within easy reach.',
    action: 'Notice the clean header design',
    icon: <Settings className="w-5 h-5" />,
    highlight: 'header'
  },
  {
    id: 'tabs',
    title: 'Three Powerful Modes',
    description: 'Switch between different testing approaches: API Explorer for guided testing, API Builder for custom requests, and Response Comparison for direct JSON analysis.',
    action: 'Click on different tabs to explore',
    icon: <Code className="w-5 h-5" />,
    highlight: 'tabs',
    mode: 'api-explorer'
  },
  {
    id: 'api-explorer',
    title: 'API Explorer Mode',
    description: 'Discover and test APIs with our comprehensive library. Search, browse, and execute APIs with built-in parameter validation.',
    action: 'Try searching for an API',
    icon: <Globe className="w-5 h-5" />,
    highlight: 'content',
    mode: 'api-explorer'
  },
  {
    id: 'api-builder',
    title: 'API Builder Mode',
    description: 'Create custom API requests with our intuitive builder. Import cURL commands or build requests from scratch.',
    action: 'Try importing a cURL command',
    icon: <Code className="w-5 h-5" />,
    highlight: 'content',
    mode: 'api-builder'
  },
  {
    id: 'response-comparison',
    title: 'Response Comparison Mode',
    description: 'Paste JSON responses directly for instant comparison. Perfect for debugging API changes and validating responses.',
    action: 'Paste some JSON responses',
    icon: <FileText className="w-5 h-5" />,
    highlight: 'content',
    mode: 'response-comparison'
  },
  {
    id: 'features',
    title: 'Advanced Features',
    description: 'Real-time comparison, CORS-free requests, detailed analytics, and professional reporting. Everything you need for comprehensive API testing.',
    action: 'Explore the comparison results',
    icon: <BarChart3 className="w-5 h-5" />,
    highlight: 'none'
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'You now know how to use DeltaPro+ effectively. Start testing APIs and comparing responses like a professional!',
    icon: <CheckCircle className="w-5 h-5" />,
    highlight: 'none'
  }
];

export function GlobalTour() {
  const { showGlobalTour, setShowGlobalTour, setHasSeenGlobalTour, currentMode, setCurrentMode } = useTour();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStepData = globalTourSteps[currentStep];
  const isLastStep = currentStep === globalTourSteps.length - 1;

  // Safety check
  if (!currentStepData || !showGlobalTour) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Switch to the appropriate mode if the step specifies one
      if (globalTourSteps[nextStep]?.mode && globalTourSteps[nextStep].mode !== currentMode) {
        setCurrentMode(globalTourSteps[nextStep].mode!);
      }
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      setShowGlobalTour(false);
      setHasSeenGlobalTour(true);
      setIsCompleted(false);
      setCurrentStep(0);
    }, 1000);
  };

  const handleSkip = () => {
    setShowGlobalTour(false);
    setHasSeenGlobalTour(true);
    setCurrentStep(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          layout
          className="relative w-full max-w-lg"
        >
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Step {currentStep + 1} of {globalTourSteps.length}
                      </Badge>
                      {currentStepData.mode && (
                        <Badge variant="outline" className="text-xs">
                          {currentStepData.mode === 'api-explorer' && 'API Explorer'}
                          {currentStepData.mode === 'api-builder' && 'API Builder'}
                          {currentStepData.mode === 'response-comparison' && 'Response Comparison'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>

              {currentStepData.action && (
                <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span>Try this: {currentStepData.action}</span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / globalTourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / globalTourSteps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Tour
                </Button>
                <Button onClick={handleNext} className="min-w-[100px]">
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completion Animation */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="p-4 rounded-full bg-green-500 text-white"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
