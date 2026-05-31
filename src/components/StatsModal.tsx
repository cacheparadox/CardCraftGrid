import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Target, Hash } from 'lucide-react';

export interface LifetimeStats {
  gamesPlayed4: number;
  gamesPlayed5: number;
  bestScore4: number;
  bestScore5: number;
  avgScore4: number;
  avgScore5: number;
  challengesWon: number;
}

export const getInitialStats = (): LifetimeStats => {
  try {
    const s = localStorage.getItem('cardcraft_stats');
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return {
    gamesPlayed4: 0, gamesPlayed5: 0,
    bestScore4: 0, bestScore5: 0,
    avgScore4: 0, avgScore5: 0,
    challengesWon: 0,
  };
};

export const saveStats = (stats: LifetimeStats) => {
  try { localStorage.setItem('cardcraft_stats', JSON.stringify(stats)); } catch { /* ignore */ }
};

interface StatsModalProps {
  stats: LifetimeStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  return (
    <div className="menu-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel"
        style={{ width: '90%', maxWidth: '400px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="btn-icon" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
          <X size={20} />
        </button>
        <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontWeight: 900, color: 'var(--accent)' }}>Lifetime Stats</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>4 × 4</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><Trophy size={14} color="#fbbf24" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Best: <strong>{stats.bestScore4}</strong></div>
              <div><Target size={14} color="#38bdf8" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Avg: <strong>{Math.round(stats.avgScore4)}</strong></div>
              <div><Hash size={14} color="#a78bfa" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Played: <strong>{stats.gamesPlayed4}</strong></div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>5 × 5</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><Trophy size={14} color="#fbbf24" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Best: <strong>{stats.bestScore5}</strong></div>
              <div><Target size={14} color="#38bdf8" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Avg: <strong>{Math.round(stats.avgScore5)}</strong></div>
              <div><Hash size={14} color="#a78bfa" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/> Played: <strong>{stats.gamesPlayed5}</strong></div>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(217,119,6,0.2) 100%)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>CHALLENGES WON</div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{stats.challengesWon}</div>
        </div>
      </motion.div>
    </div>
  );
};
