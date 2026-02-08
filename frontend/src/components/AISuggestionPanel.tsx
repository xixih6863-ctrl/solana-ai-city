/**
 * Solana AI City - AI Suggestion Panel Component
 * 
 * Displays AI-powered strategy suggestions with animations
 * WCAG AA compliant
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface AISuggestion {
  id: string;
  priority: SuggestionPriority;
  action: string;
  reason: string;
  expectedGain: string;
  timestamp: number;
}

export interface AISuggestionPanelProps {
  suggestions: AISuggestion[];
  currentStrategy: string;
  onApplySuggestion?: (suggestion: AISuggestion) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
  onStrategyChange?: (strategy: string) => void;
}

// ============================================================================
// Strategy Options
// ============================================================================

const STRATEGIES = [
  { id: 'balanced', name: '⚖️ Balanced', description: 'Balanced development' },
  { id: 'economy', name: '💰 Economy', description: 'Focus on gold production' },
  { id: 'military', name: '⚔️ Military', description: 'Focus on population' },
  { id: 'expansion', name: '🏗️ Expansion', description: 'Rapid expansion' },
  { id: 'technology', name: '🔬 Technology', description: 'Technology focus' },
];

// ============================================================================
// Animations
// ============================================================================

const panelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
};

const suggestionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring', stiffness: 30025 }
  },
, damping:   exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 }
  },
};

const priorityColors = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400', icon: '🔴' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', icon: '🟡' },
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400', icon: '🔵' },
};

// ============================================================================
// Suggestion Item Component
// ============================================================================

const SuggestionItem = memo(function SuggestionItem({ 
  suggestion,
  onApply,
  onDismiss 
}: { 
  suggestion: AISuggestion;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const colors = useMemo(() => 
    priorityColors[suggestion.priority],
    [suggestion.priority]
  );
  
  return (
    <motion.div
      className={[
        'suggestion-item',
        'p-4',
        'rounded-lg',
        'border',
        colors.bg,
        colors.border,
      ].join(' ')}
      variants={suggestionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="article"
      aria-label={`AI Suggestion: ${suggestion.action}`}
    >
      {/* Header */}
      <div className="suggestion-header">
        <span className="priority-icon" aria-hidden="true">
          {colors.icon}
        </span>
        <span className={`priority-label ${colors.text}`}>
          {suggestion.priority.toUpperCase()}
        </span>
      </div>
      
      {/* Content */}
      <div className="suggestion-content">
        <h4 className="suggestion-action">{suggestion.action}</h4>
        <p className="suggestion-reason">{suggestion.reason}</p>
        <p className="suggestion-gain">
          <span className="gain-icon" aria-hidden="true">📈</span>
          {suggestion.expectedGain}
        </p>
      </div>
      
      {/* Actions */}
      <div className="suggestion-actions">
        <motion.button
          className="btn-apply"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApply}
          aria-label={`Apply suggestion: ${suggestion.action}`}
        >
          Apply
        </motion.button>
        
        <motion.button
          className="btn-dismiss"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDismiss}
          aria-label={`Dismiss suggestion: ${suggestion.action}`}
        >
          Dismiss
        </motion.button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// Strategy Selector Component
// ============================================================================

const StrategySelector = memo(function StrategySelector({ 
  currentStrategy,
  onChange 
}: { 
  currentStrategy: string;
  onChange: (strategy: string) => void;
}) {
  return (
    <div className="strategy-selector" role="radiogroup" aria-label="AI Strategy">
      <h3 className="selector-title">🎯 AI Strategy</h3>
      <div className="strategy-options">
        {STRATEGIES.map((strategy) => (
          <motion.button
            key={strategy.id}
            className={[
              'strategy-option',
              currentStrategy === strategy.id ? 'active' : '',
            ].join(' ')}
            onClick={() => onChange(strategy.id)}
            role="radio"
            aria-checked={currentStrategy === strategy.id}
            aria-label={strategy.description}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="strategy-name">{strategy.name}</span>
            <span className="strategy-description">{strategy.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// AI Suggestion Panel Component
// ============================================================================

const AISuggestionPanel = memo(function AISuggestionPanel({
  suggestions,
  currentStrategy,
  onApplySuggestion,
  onDismissSuggestion,
  onStrategyChange,
}: AISuggestionPanelProps) {
  // Group suggestions by priority
  const groupedSuggestions = useMemo(() => {
    const grouped = {
      high: [] as AISuggestion[],
      medium: [] as AISuggestion[],
      low: [] as AISuggestion[],
    };
    
    suggestions.forEach(suggestion => {
      grouped[suggestion.priority].push(suggestion);
    });
    
    return grouped;
  }, [suggestions]);
  
  // Handle apply suggestion
  const handleApply = (suggestion: AISuggestion) => {
    onApplySuggestion?.(suggestion);
  };
  
  // Handle dismiss suggestion
  const handleDismiss = (suggestionId: string) => {
    onDismissSuggestion?.(suggestionId);
  };
  
  // Handle strategy change
  const handleStrategyChange = (strategy: string) => {
    onStrategyChange?.(strategy);
  };
  
  return (
    <aside 
      className="ai-suggestion-panel"
      role="complementary"
      aria-label="AI Strategy Suggestions"
    >
      {/* Header */}
      <header className="panel-header">
        <h2 className="panel-title">
          <span className="ai-icon" aria-hidden="true">🤖</span>
          AI Strategy Advisor
        </h2>
        <p className="panel-subtitle">
          Smart suggestions to optimize your city
        </p>
      </header>
      
      {/* Strategy Selector */}
      <StrategySelector
        currentStrategy={currentStrategy}
        onChange={handleStrategyChange}
      />
      
      {/* Suggestions List */}
      <section className="suggestions-section" aria-label="AI Suggestions">
        <h3 className="suggestions-title">
          💡 Suggestions
          <span className="suggestion-count">
            ({suggestions.length})
          </span>
        </h3>
        
        <AnimatePresence mode="wait">
          {suggestions.length === 0 ? (
            <motion.div
              className="no-suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="no-suggestions-icon" aria-hidden="true">✨</span>
              <p>All systems optimized!</p>
              <p className="no-suggestions-hint">
                Your city is running efficiently
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="suggestions-list"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
            >
              {/* High Priority */}
              {groupedSuggestions.high.map((suggestion) => (
                <SuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={() => handleApply(suggestion)}
                  onDismiss={() => handleDismiss(suggestion.id)}
                />
              ))}
              
              {/* Medium Priority */}
              {groupedSuggestions.medium.map((suggestion) => (
                <SuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={() => handleApply(suggestion)}
                  onDismiss={() => handleDismiss(suggestion.id)}
                />
              ))}
              
              {/* Low Priority */}
              {groupedSuggestions.low.map((suggestion) => (
                <SuggestionItem
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={() => handleApply(suggestion)}
                  onDismiss={() => handleDismiss(suggestion.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      
      {/* Footer */}
      <footer className="panel-footer">
        <p className="footer-hint">
          💡 AI learns from your play style
        </p>
      </footer>
    </aside>
  );
});

// ============================================================================
// Export
// ============================================================================

export default AISuggestionPanel;
export type { AISuggestion, AISuggestionPanelProps, SuggestionPriority };
