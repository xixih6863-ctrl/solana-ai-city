import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // Element ID to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    target?: string;
  };
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

// ============================================================================
// Default Tutorial Steps
// ============================================================================

const DEFAULT_TUTORIAL: TutorialStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Solana AI City!',
    content: 'Build your own AI-powered city on the Solana blockchain. Let\'s get started with a quick tour!',
    position: 'center',
    action: { label: 'Start Tour →', target: 'next' },
  },
  {
    id: 'resources',
    title: '💰 Resources',
    content: 'Your city needs resources to grow. Gold, wood, stone, food, and energy are essential for construction and development.',
    position: 'bottom',
    action: { label: 'Next →', target: 'next' },
  },
  {
    id: 'buildings',
    title: '🏗️ Buildings',
    content: 'Select buildings from the menu and place them on the map. Each building produces resources and serves a unique purpose.',
    position: 'right',
    action: { label: 'Next →', target: 'next' },
  },
  {
    id: 'placing',
    title: '🎯 Placing Buildings',
    content: 'Click on the map to place your selected building. Make sure you have enough resources!',
    position: 'center',
    action: { label: 'Got it!', target: 'complete' },
  },
  {
    id: 'ai',
    title: '🤖 AI Assistant',
    content: 'Use the AI panel to get smart suggestions for your city layout and development strategy.',
    position: 'left',
    action: { label: 'Next →', target: 'next' },
  },
  {
    id: 'complete',
    title: '🎉 You\'re Ready!',
    content: 'Start building your city! Remember to check the leaderboard and compete with other players.',
    position: 'center',
    action: { label: 'Start Playing!', target: 'complete' },
  },
];

// ============================================================================
// TutorialOverlay Component
// ============================================================================

const TutorialOverlay = memo(function TutorialOverlay({
  steps = DEFAULT_TUTORIAL,
  onComplete,
  onSkip,
  isActive,
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    if (isActive && !dismissed) {
      setIsVisible(true);
    }
  }, [isActive, dismissed]);
  
  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);
  
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const handleComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);
  
  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setDismissed(true);
    setTimeout(() => {
      onSkip();
    }, 300);
  }, [onSkip]);
  
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setIsVisible(false);
  }, []);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);
  
  if (!isActive || dismissed) return null;
  
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
            onClick={handleDismiss}
          />
          
          {/* Tutorial Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`absolute ${
              step.position === 'center'
                ? 'inset-0 m-auto'
                : step.position === 'top'
                ? 'top-20 left-1/2 -translate-x-1/2'
                : step.position === 'bottom'
                ? 'bottom-20 left-1/2 -translate-x-1/2'
                : step.position === 'left'
                ? 'top-1/2 left-20 -translate-y-1/2'
                : 'top-1/2 right-20 -translate-y-1/2'
            } w-full max-w-md pointer-events-auto`}
          >
            {/* Progress Bar */}
            <div className="absolute -top-8 left-0 right-0 h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
            
            {/* Step Counter */}
            <div className="absolute -top-8 right-0 text-sm text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </div>
            
            {/* Card Content */}
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-700">
                <motion.h2
                  key={step.title}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-white"
                >
                  {step.title}
                </motion.h2>
              </div>
              
              {/* Body */}
              <div className="p-6">
                <motion.p
                  key={step.content}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-300 leading-relaxed"
                >
                  {step.content}
                </motion.p>
                
                {/* Highlight Target Indicator */}
                {step.target && (
                  <div className="mt-4 p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                    <p className="text-sm text-indigo-300">
                      💡 Look for: <code className="text-white">{step.target}</code>
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between">
                  {/* Navigation Dots */}
                  <div className="flex gap-1">
                    {steps.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        whileHover={{ scale: 1.2 }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-indigo-500'
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-slate-600'
                        }`}
                        aria-label={`Go to step ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrev}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        ← Back
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                    >
                      {step.action?.label || 'Next →'}
                    </motion.button>
                  </div>
                </div>
                
                {/* Skip Button */}
                <div className="mt-4 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSkip}
                    className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    Skip tutorial
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-500/20 rounded-full blur-xl" />
          </motion.div>
          
          {/* Highlight Box for Target Element */}
          {step.target && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute border-2 border-indigo-500 rounded-lg shadow-[0_0_30px_rgba(99,102,241,0.5)] pointer-events-none"
              style={{
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ============================================================================
// Context for Tutorial Management
// ============================================================================

interface TutorialContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
}

const TutorialContext = React.createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const context = React.useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

export function TutorialProvider({
  children,
  onComplete,
}: {
  children: React.ReactNode;
  onComplete?: () => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const value: TutorialContextValue = {
    isActive,
    currentStep,
    totalSteps: DEFAULT_TUTORIAL.length,
    startTutorial: () => {
      setCurrentStep(0);
      setIsActive(true);
    },
    nextStep: () => {
      if (currentStep < DEFAULT_TUTORIAL.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeTutorial();
      }
    },
    skipTutorial: () => {
      setIsActive(false);
    },
    completeTutorial: () => {
      setIsActive(false);
      onComplete?.();
    },
    resetTutorial: () => {
      setCurrentStep(0);
      setIsActive(true);
    },
  };
  
  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay
        steps={DEFAULT_TUTORIAL}
        onComplete={() => {
          setIsActive(false);
          onComplete?.();
        }}
        onSkip={() => setIsActive(false)}
        isActive={isActive}
      />
    </TutorialContext.Provider>
  );
}

export default TutorialOverlay;
export type { TutorialStep, TutorialOverlayProps };
