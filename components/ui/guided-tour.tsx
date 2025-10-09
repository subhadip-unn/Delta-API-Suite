'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle,
    Copy,
    FileText,
    Lightbulb,
    Play,
    SkipForward,
    Target,
    X,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
  highlight?: 'source' | 'target' | 'buttons' | 'none';
}

interface GuidedTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DeltaPro+',
    description: 'Let\'s take a quick tour to get you started with professional API response comparison.',
    icon: <Zap className="w-5 h-5" />,
    highlight: 'none'
  },
  {
    id: 'source',
    title: 'Source Response',
    description: 'Paste your first JSON response here. This will be your baseline for comparison.',
    action: 'Paste JSON in the left text area',
    icon: <FileText className="w-5 h-5" />,
    highlight: 'source'
  },
  {
    id: 'target',
    title: 'Target Response',
    description: 'Paste your second JSON response here. We\'ll compare this against the source.',
    action: 'Paste JSON in the right text area',
    icon: <Target className="w-5 h-5" />,
    highlight: 'target'
  },
  {
    id: 'actions',
    title: 'Action Buttons',
    description: 'Use these buttons to set responses, copy content, or download files. The green button activates the response for comparison.',
    action: 'Click "Use as Response" to activate',
    icon: <Play className="w-5 h-5" />,
    highlight: 'buttons'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Once both responses are set, the comparison will automatically start. You can now explore the differences between your API responses.',
    icon: <CheckCircle className="w-5 h-5" />,
    highlight: 'none'
  }
];

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Safety check for currentStepData
  if (!currentStepData) {
    return null;
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1000);
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible) return null;

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
          className="relative w-full max-w-md"
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
                        Step {currentStep + 1} of {tourSteps.length}
                      </Badge>
                      {currentStepData.highlight !== 'none' && (
                        <Badge variant="outline" className="text-xs">
                          {currentStepData.highlight === 'source' && 'Left Panel'}
                          {currentStepData.highlight === 'target' && 'Right Panel'}
                          {currentStepData.highlight === 'buttons' && 'Action Area'}
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
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
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

// Quick Tips Component
export function QuickTips() {
  const [showTips, setShowTips] = useState(false);

  const tips = [
    {
      icon: <FileText className="w-4 h-4" />,
      title: "JSON Validation",
      description: "Invalid JSON will be highlighted with helpful error messages"
    },
    {
      icon: <Copy className="w-4 h-4" />,
      title: "Quick Actions",
      description: "Use copy/download buttons for easy content management"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Smart Comparison",
      description: "Our engine automatically detects and highlights differences"
    }
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTips(!showTips)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Quick Tips
      </Button>

      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 z-10"
          >
            <Card className="shadow-lg border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
                      {tip.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tip.title}</p>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
