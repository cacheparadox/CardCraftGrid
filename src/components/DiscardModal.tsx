import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardPackType } from '../engine/types';
import { CARD_PACKS } from '../engine/cardPacks';
import { X } from 'lucide-react';

interface DiscardModalProps {
  discardedCards: Card[];
  selectedPack: CardPackType;
  onClose: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({ discardedCards, selectedPack, onClose }) => {
  return (
    <div className="menu-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-panel"
        style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="btn-icon" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
          <X size={20} />
        </button>
        <h2 style={{ margin: '0 0 1rem 0', textAlign: 'center', fontWeight: 900, color: 'var(--accent)' }}>Discard Pile</h2>
        {discardedCards.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0' }}>No cards discarded yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.5rem' }}>
            {discardedCards.map((card, i) => (
              <img
                key={i}
                src={CARD_PACKS[selectedPack].getCardImagePath(card)}
                alt={`${card.rank} of ${card.suit}`}
                style={{ width: '100%', borderRadius: '4px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
