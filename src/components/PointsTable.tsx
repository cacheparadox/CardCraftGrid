import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { HandRarity } from '../engine/pokerLogic';

const HANDS: { name: string; points: number; description: string; rarity: HandRarity }[] = [
  { name: 'Royal Flush', points: 500, description: 'A-K-Q-J-10 of same suit', rarity: 'legendary' },
  { name: 'Straight Flush', points: 250, description: 'Consecutive ranks, same suit', rarity: 'legendary' },
  { name: 'Four of a Kind', points: 150, description: '4 cards of the same rank', rarity: 'epic' },
  { name: 'Full House', points: 100, description: 'Three of a kind + a pair', rarity: 'epic' },
  { name: 'Flush', points: 75, description: 'All cards same suit', rarity: 'rare' },
  { name: 'Straight', points: 50, description: 'Consecutive ranks (A-2-3-4 counts!)', rarity: 'rare' },
  { name: 'Three of a Kind', points: 25, description: '3 cards of the same rank', rarity: 'uncommon' },
  { name: 'Two Pair', points: 15, description: 'Two different pairs', rarity: 'uncommon' },
  { name: 'Pair', points: 5, description: 'Two cards of the same rank', rarity: 'common' },
];

const RARITY_LABELS: Record<HandRarity, string> = {
  legendary: 'LEGENDARY',
  epic: 'EPIC',
  rare: 'RARE',
  uncommon: 'UNCOMMON',
  common: 'COMMON',
  none: '',
};

export const PointsTable: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="menu-overlay"
    onClick={onClose}
    style={{ zIndex: 1000 }}
  >
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel"
      style={{ padding: '1.5rem', maxWidth: '480px', width: '95%', maxHeight: '85vh', overflowY: 'auto', borderRadius: '1.5rem', position: 'relative' }}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
      >
        <X size={16} />
      </button>

      <h2 style={{ marginBottom: '0.25rem', textAlign: 'center', fontSize: '1.75rem', color: '#38bdf8', fontWeight: 900 }}>How to Play</h2>
      
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <li><strong>Place Cards:</strong> Click a card in your hand, then click an empty grid slot. (Desktop: Use keys <strong>1-5</strong>).</li>
          <li><strong>Undo:</strong> Click the Undo arrow to return the last placed card to your hand.</li>
          <li><strong>Confirm:</strong> When all cards are placed, hit <strong>Confirm Turn</strong>. One remaining card is discarded and a new hand is drawn.</li>
          <li><strong>Score:</strong> Build the best poker hands across <strong>rows, columns, and the 4 corners</strong>!</li>
        </ul>
      </div>

      <h2 style={{ marginBottom: '0.25rem', textAlign: 'center', fontSize: '1.5rem', color: '#38bdf8', fontWeight: 800 }}>Winning Hands</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>Rows, columns, and corners all score!</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {HANDS.map(hand => (
          <div
            key={hand.name}
            className={`points-row rarity-row-${hand.rarity}`}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{hand.name}</span>
                <span className={`rarity-badge rarity-badge-${hand.rarity}`}>{RARITY_LABELS[hand.rarity]}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{hand.description}</div>
            </div>
            <div className={`pts-value rarity-pts-${hand.rarity}`}>{hand.points}</div>
          </div>
        ))}

        <div className="points-row rarity-row-corners" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Corner Bonus</span>
              <span className="rarity-badge rarity-badge-corners">BONUS</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>The 4 corner slots also score as a hand!</div>
          </div>
          <div className="pts-value" style={{ color: '#eab308' }}>×1</div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem' }}>Got it!</button>
    </motion.div>
  </motion.div>
);

