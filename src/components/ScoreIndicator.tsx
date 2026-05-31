import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PokerHandResult } from '../engine/pokerLogic';

interface ScoreIndicatorProps {
  result: PokerHandResult | null;
  vertical?: boolean;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ result, vertical }) => {
  const active = result && result.points > 0;
  const rarity = active ? result.rarity : 'none';

  return (
    <div
      className={`score-indicator rarity-${rarity} ${active ? 'active' : ''} ${vertical ? 'vertical' : ''}`}
      style={{ height: '100%', width: '100%' }}
    >
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={result.name}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}
          >
            <span className="si-name">{vertical ? result.shortName : result.name}</span>
            <span className="si-pts">{result.points}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

