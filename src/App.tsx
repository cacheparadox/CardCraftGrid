import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { CardItem } from './components/CardItem';
import { GridSlot } from './components/GridSlot';
import { GameState, GridSize, Card, CardPackType } from './engine/types';
import { createInitialState } from './engine/gameEngine';
import { calculateTotalScore, evaluateHand as calculateHand, ScoreDetail } from './engine/pokerLogic';
import { CARD_PACKS } from './engine/cardPacks';
import { ScoreIndicator } from './components/ScoreIndicator';
import { PointsTable } from './components/PointsTable';
import { DiscardModal } from './components/DiscardModal';
import { StatsModal, LifetimeStats, getInitialStats, saveStats } from './components/StatsModal';
import { Trophy, RefreshCcw, Settings, Info, Star, Undo2, BarChart2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ScoreDelta { id: number; value: number; }
const getBestScore = (size: 4 | 5) => {
  try { return parseInt(localStorage.getItem(`lykepokeher_best_${size}`) || '0') || 0; }
  catch { return 0; }
};
const saveBestScore = (size: 4 | 5, score: number) => {
  try { localStorage.setItem(`lykepokeher_best_${size}`, String(score)); }
  catch { /* noop */ }
};

const computeSlotPx = (n: number): number => {
  const gap = 6;
  const gridPad = 14;
  const colScoreH = 58;
  const headerH = 64;
  const handH = 182;
  const outerPad = 24;
  const sideColsW = 230;

  const availH = window.innerHeight - headerH - handH - outerPad - gridPad * 2 - colScoreH - (n - 1) * gap;
  const availW = window.innerWidth - sideColsW - outerPad - gridPad * 2 - (n - 1) * gap;

  const byH = availH / (n * 1.4);
  const byW = availW / n;
  return Math.max(46, Math.min(100, Math.floor(Math.min(byH, byW))));
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPack, setSelectedPack] = useState<CardPackType>(() =>
    (localStorage.getItem('lykepokeher_pack') as CardPackType | null) || 'CARDPACK5'
  );
  
  // Modals
  const [showMenu, setShowMenu] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [showDiscardViewer, setShowDiscardViewer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [scoreDeltas, setScoreDeltas] = useState<ScoreDelta[]>([]);
  
  // Progression
  const [bestScores, setBestScores] = useState<Record<4 | 5, number>>(() => ({
    4: getBestScore(4),
    5: getBestScore(5),
  }));
  const [isNewBest, setIsNewBest] = useState(false);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(getInitialStats());
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeWon, setChallengeWon] = useState(false);

  // Turn state
  const [turnPlacements, setTurnPlacements] = useState<Set<string>>(new Set());
  const [turnPlacementHistory, setTurnPlacementHistory] = useState<string[]>([]);
  const [hoveredLine, setHoveredLine] = useState<{ type: 'Row'|'Col', index: number } | null>(null);

  // Tap-to-place selection
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [selectedGridSlot, setSelectedGridSlot] = useState<string | null>(null);
  
  const [slotPx, setSlotPx] = useState(80);
  const deltaCounterRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  useEffect(() => {
    if (!gameState) return;
    const n = gameState.gameMode;
    const compute = () => setSlotPx(computeSlotPx(n));
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [gameState?.gameMode]);

  const getChallengeTarget = useCallback((mode: 4 | 5) => {
    const baseTarget = mode === 4 ? 300 : 450;
    return Math.max(baseTarget, bestScores[mode] - 100);
  }, [bestScores]);

  const showDelta = useCallback((delta: number) => {
    if (delta <= 0) return;
    const id = ++deltaCounterRef.current;
    setScoreDeltas(prev => [...prev, { id, value: delta }]);
    setTimeout(() => setScoreDeltas(prev => prev.filter(d => d.id !== id)), 1500);
  }, []);

  const startGame = (size: GridSize, isChallenge = false) => {
    setGameState(createInitialState(size));
    setShowMenu(false);
    setIsNewBest(false);
    setSelectedHandCardId(null);
    setSelectedGridSlot(null);
    setScoreDeltas([]);
    setTurnPlacements(new Set());
    setTurnPlacementHistory([]);
    setChallengeMode(isChallenge);
    setChallengeWon(false);
    setSlotPx(computeSlotPx(size));
  };

  const placeCard = useCallback((card: Card, r: number, c: number, state: GameState): GameState | null => {
    if (state.grid[r][c]) return null;
    const newGrid = state.grid.map(row => [...row]);
    newGrid[r][c] = card;
    const newDraw = state.currentDraw.filter(d => d.id !== card.id);
    const newPlacedCount = state.placedCount + 1;
    const isTurnEnd = newPlacedCount >= state.gameMode;

    const prevScore = state.score;
    const { total } = calculateTotalScore(newGrid, state.gameMode);
    showDelta(total - prevScore);

    const slotId = `slot-${r}-${c}`;
    setTurnPlacements(prev => new Set([...prev, slotId]));
    setTurnPlacementHistory(prev => [...prev, slotId]);

    return {
      ...state,
      grid: newGrid,
      currentDraw: newDraw,
      placedCount: newPlacedCount,
      score: total,
      waitingForConfirmation: isTurnEnd,
    };
  }, [showDelta]);

  const unplaceCard = useCallback((fromSlot: string, state: GameState): GameState | null => {
    const parts = fromSlot.split('-');
    const sr = parseInt(parts[1]);
    const sc = parseInt(parts[2]);
    const card = state.grid[sr][sc];
    if (!card) return null;

    const newGrid = state.grid.map(row => [...row]);
    newGrid[sr][sc] = null;
    const { total } = calculateTotalScore(newGrid, state.gameMode);

    setTurnPlacements(prev => { const s = new Set(prev); s.delete(fromSlot); return s; });
    setTurnPlacementHistory(prev => prev.filter(id => id !== fromSlot));

    return {
      ...state,
      grid: newGrid,
      score: total,
      currentDraw: [...state.currentDraw, card],
      placedCount: state.placedCount - 1,
      waitingForConfirmation: false,
    };
  }, []);

  const handleUndo = useCallback(() => {
    if (turnPlacementHistory.length === 0 || !gameState) return;
    const lastSlot = turnPlacementHistory[turnPlacementHistory.length - 1];
    const newState = unplaceCard(lastSlot, gameState);
    if (newState) setGameState(newState);
    setSelectedHandCardId(null);
    setSelectedGridSlot(null);
  }, [turnPlacementHistory, gameState, unplaceCard]);

  // Turn confirm
  const confirmTurn = useCallback(() => {
    if (!gameState) return;

    const remainingCards = gameState.currentDraw;
    const nextDeck = [...gameState.deck];
    const nextDraw = nextDeck.splice(0, gameState.gameMode + 1);
    const nextRound = gameState.currentRound + 1;
    const isGameOver = nextRound > gameState.gameMode;

    setGameState({
      ...gameState,
      deck: nextDeck,
      currentDraw: nextDraw,
      discardedCards: [...gameState.discardedCards, ...remainingCards],
      placedCount: 0,
      currentRound: nextRound,
      totalTurns: gameState.totalTurns + 1,
      waitingForConfirmation: false,
      isGameOver,
    });
    setTurnPlacements(new Set());
    setTurnPlacementHistory([]);
    setSelectedHandCardId(null);
    setSelectedGridSlot(null);

    if (isGameOver) {
      const mode = gameState.gameMode as 4 | 5;
      const isBest = gameState.score > bestScores[mode];
      
      const targetScore = getChallengeTarget(mode);
      const cWon = challengeMode && gameState.score >= targetScore;
      setChallengeWon(cWon);

      if (isBest) {
        setBestScores(prev => ({ ...prev, [mode]: gameState.score }));
        saveBestScore(mode, gameState.score);
        setIsNewBest(true);
      }

      setLifetimeStats(prev => {
        const next = { ...prev };
        if (mode === 4) {
          next.gamesPlayed4++;
          next.avgScore4 = ((next.avgScore4 * (next.gamesPlayed4 - 1)) + gameState.score) / next.gamesPlayed4;
          next.bestScore4 = Math.max(next.bestScore4, gameState.score);
        } else {
          next.gamesPlayed5++;
          next.avgScore5 = ((next.avgScore5 * (next.gamesPlayed5 - 1)) + gameState.score) / next.gamesPlayed5;
          next.bestScore5 = Math.max(next.bestScore5, gameState.score);
        }
        if (cWon) next.challengesWon++;
        saveStats(next);
        return next;
      });

      if (isBest || cWon) {
        confetti({ particleCount: 220, spread: 100, origin: { y: 0.55 } });
      }
    }
  }, [gameState, bestScores, challengeMode, getChallengeTarget]);

  const handleDragStart = (event: any) => {
    const data = event.active.data.current;
    if (data) setDraggedCard({ id: data.id, suit: data.suit, rank: data.rank });
    setSelectedHandCardId(null);
    setSelectedGridSlot(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCard(null);
    if (!gameState) return;

    const data = active.data.current as { id: string; suit: string; rank: string; fromSlot?: string } | undefined;
    const fromSlot = data?.fromSlot;
    const overId = over?.id as string | undefined;

    if (!overId?.startsWith('slot-')) {
      if (fromSlot) {
        const newState = unplaceCard(fromSlot, gameState);
        if (newState) setGameState(newState);
      }
      return;
    }

    const parts = overId.split('-');
    const r = parseInt(parts[1]);
    const c = parseInt(parts[2]);
    if (isNaN(r) || isNaN(c) || r < 0 || c < 0 || r >= gameState.gameMode || c >= gameState.gameMode) return;
    if (fromSlot === overId) return;
    if (gameState.grid[r][c] !== null) return;

    let card: Card | undefined;
    if (fromSlot) {
      const fp = fromSlot.split('-');
      card = gameState.grid[parseInt(fp[1])][parseInt(fp[2])] ?? undefined;
    } else {
      card = gameState.currentDraw.find(cd => cd.id === active.id);
    }
    if (!card) return;

    let state = gameState;
    if (fromSlot) {
      const unplaced = unplaceCard(fromSlot, gameState);
      if (!unplaced) return;
      state = unplaced;
    }

    const newState = placeCard(card, r, c, state);
    if (newState) setGameState(newState);
  };

  const handleHandCardTap = (card: Card) => {
    setSelectedGridSlot(null);
    setSelectedHandCardId(prev => prev === card.id ? null : card.id);
  };

  const handleGridCardTap = (slotId: string) => {
    setSelectedHandCardId(null);
    setSelectedGridSlot(prev => prev === slotId ? null : slotId);
  };

  const handleSlotTap = (r: number, c: number) => {
    if (!gameState) return;
    const slotId = `slot-${r}-${c}`;

    if (selectedGridSlot) {
      if (selectedGridSlot === slotId) { setSelectedGridSlot(null); return; }
      if (gameState.grid[r][c]) {
        if (turnPlacements.has(slotId)) setSelectedGridSlot(slotId);
        return;
      }
      const afterUnplace = unplaceCard(selectedGridSlot, gameState);
      if (!afterUnplace) { setSelectedGridSlot(null); return; }
      const card = gameState.grid[parseInt(selectedGridSlot.split('-')[1])][parseInt(selectedGridSlot.split('-')[2])];
      if (!card) { setSelectedGridSlot(null); return; }
      const afterPlace = placeCard(card, r, c, afterUnplace);
      if (afterPlace) setGameState(afterPlace);
      setSelectedGridSlot(null);

    } else if (selectedHandCardId) {
      if (gameState.grid[r][c]) return;
      const card = gameState.currentDraw.find(cd => cd.id === selectedHandCardId);
      if (!card) return;
      const newState = placeCard(card, r, c, gameState);
      if (newState) { setGameState(newState); setSelectedHandCardId(null); }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && gameState?.waitingForConfirmation) {
        e.preventDefault();
        confirmTurn();
      }
      if (e.key === 'Escape') { 
        setSelectedHandCardId(null); 
        setSelectedGridSlot(null); 
      }
      // Number keys 1-5 selection
      if (!gameState || gameState.isGameOver || gameState.waitingForConfirmation) return;
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
      if (e.key in keyMap) {
        const idx = keyMap[e.key];
        if (idx < gameState.currentDraw.length) {
          handleHandCardTap(gameState.currentDraw[idx]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, confirmTurn]);

  useEffect(() => {
    document.title = gameState && !showMenu
      ? `⭐ ${gameState.score} — CardCraft Grid`
      : 'CardCraft Grid';
  }, [gameState?.score, showMenu]);

  const isYellowMark = (r: number, c: number, size: number) =>
    (r === 0 && c === 0) || (r === 0 && c === size - 1) ||
    (r === size - 1 && c === 0) || (r === size - 1 && c === size - 1);

  // ════════════════════════════════════════════════════════════════════════════
  // MENU
  // ════════════════════════════════════════════════════════════════════════════
  if (showMenu) {
    return (
      <div className="menu-overlay">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel menu-panel">
          <div className="menu-title-block">
            <h1 className="menu-title">CARDCRAFT GRID</h1>
            <p className="menu-subtitle">Poker hands on a grid — rows, columns & corners all score</p>
          </div>

          <div className="card-pack-selector">
            {(Object.keys(CARD_PACKS) as CardPackType[]).map(packId => (
              <div key={packId} className={`pack-card ${selectedPack === packId ? 'selected' : ''}`} onClick={() => { setSelectedPack(packId); localStorage.setItem('lykepokeher_pack', packId); }}>
                <img src={CARD_PACKS[packId].getCardImagePath({ id: 'p', suit: 'spades', rank: 'A' })} alt={packId} style={{ height: '55px', marginBottom: '0.4rem', imageRendering: 'pixelated' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{CARD_PACKS[packId].name}</div>
              </div>
            ))}
          </div>

          <div className="menu-start-grid">
            <button className="btn btn-primary btn-lg btn-mode" onClick={() => startGame(4)}>
              <span>4 × 4 Classic</span>
              {bestScores[4] > 0 && <span className="mode-best">🏆 {bestScores[4]}</span>}
            </button>
            <button className="btn btn-primary btn-lg btn-mode" onClick={() => startGame(5)}>
              <span>5 × 5 Classic</span>
              {bestScores[5] > 0 && <span className="mode-best">🏆 {bestScores[5]}</span>}
            </button>
            <button className="btn btn-outline btn-mode" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => startGame(4, true)}>
              <span><Target size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> 4×4 Challenge</span>
              <span className="mode-best">Goal: {getChallengeTarget(4)} pts</span>
            </button>
            <button className="btn btn-outline btn-mode" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => startGame(5, true)}>
              <span><Target size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> 5×5 Challenge</span>
              <span className="mode-best">Goal: {getChallengeTarget(5)} pts</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => setShowPoints(true)} style={{ flex: 1 }}>
              <Info size={15} style={{ marginRight: '0.4rem' }} /> Rules
            </button>
            <button className="btn btn-ghost" onClick={() => setShowStats(true)} style={{ flex: 1 }}>
              <BarChart2 size={15} style={{ marginRight: '0.4rem' }} /> Stats
            </button>
          </div>
        </motion.div>
        {showPoints && <PointsTable onClose={() => setShowPoints(false)} />}
        {showStats && <StatsModal stats={lifetimeStats} onClose={() => setShowStats(false)} />}
      </div>
    );
  }

  if (!gameState) return null;

  const rowResults = gameState.grid.map(row => calculateHand(row));
  const colResults = Array(gameState.gameMode).fill(null).map((_, c) => calculateHand(gameState.grid.map(r => r[c])));
  const cardsLeft = gameState.gameMode - gameState.placedCount;
  const discardCard = gameState.waitingForConfirmation && gameState.currentDraw.length > 0
    ? gameState.currentDraw[0]
    : null;

  // ════════════════════════════════════════════════════════════════════════════
  // GAME OVER
  // ════════════════════════════════════════════════════════════════════════════
  if (gameState.isGameOver) {
    const { details } = calculateTotalScore(gameState.grid, gameState.gameMode);
    return (
      <div className="menu-overlay">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="glass-panel gameover-panel"
        >
          {challengeMode && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`new-best-badge ${challengeWon ? '' : 'challenge-failed'}`} style={{ backgroundColor: challengeWon ? '' : '#ef4444' }}>
              <Target size={13} fill="currentColor" /> {challengeWon ? 'CHALLENGE CLEARED' : 'CHALLENGE FAILED'}
            </motion.div>
          )}
          {!challengeMode && isNewBest && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="new-best-badge">
              <Star size={13} fill="currentColor" /> NEW BEST!
            </motion.div>
          )}
          
          <h2 className="gameover-title">GAME OVER</h2>
          <div className="gameover-score-block">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>FINAL SCORE</div>
            <div className="score-value" style={{ fontSize: '4.5rem', lineHeight: 1 }}>{gameState.score}</div>
            
            {challengeMode ? (
               <div style={{ fontSize: '0.75rem', color: challengeWon ? 'var(--accent)' : '#ef4444' }}>
                 Target: {getChallengeTarget(gameState.gameMode as 4 | 5)}
               </div>
            ) : (
               bestScores[gameState.gameMode as 4 | 5] > 0 && !isNewBest && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best: {bestScores[gameState.gameMode as 4 | 5]}</div>
            )}
          </div>

          {details.length > 0 && (
            <div className="gameover-breakdown">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SCORING HANDS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {details.map((d: ScoreDetail, i) => (
                  <div key={i} className={`breakdown-row rarity-row-${d.rarity}`}>
                    <span style={{ fontSize: '0.8rem' }}>
                      {d.type === 'Row' ? `Row ${d.index + 1}` : d.type === 'Col' ? `Col ${d.index + 1}` : 'Corners'}
                      {' — '}<strong>{d.name}</strong>
                    </span>
                    <span className={`pts-value rarity-pts-${d.rarity}`} style={{ fontSize: '0.9rem' }}>+{d.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => startGame(gameState.gameMode, challengeMode)}>Play Again</button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowMenu(true)}>Menu</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GAME
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="game-container">
      <div className="delta-container" aria-hidden="true">
        <AnimatePresence>
          {scoreDeltas.map(d => (
            <motion.div key={d.id} className="score-delta"
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -60, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}>
              +{d.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="game-header">
        <div className="header-score">
          <Trophy size={28} color="#fbbf24" />
          <span className="score-value">{gameState.score}</span>
          {challengeMode ? (
            <span className="header-best" style={{ color: 'var(--accent)' }}>GOAL {getChallengeTarget(gameState.gameMode as 4 | 5)}</span>
          ) : (
            bestScores[gameState.gameMode as 4 | 5] > 0 && <span className="header-best">BEST {bestScores[gameState.gameMode as 4 | 5]}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>ROUND</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{Math.min(gameState.currentRound, gameState.gameMode)} / {gameState.gameMode}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn btn-icon" onClick={() => setShowPoints(true)} title="Scoring guide"><Info size={18} /></button>
            <button className="btn btn-icon" onClick={() => setShowMenu(true)} title="Menu"><Settings size={18} /></button>
            <button className="btn btn-icon" onClick={() => startGame(gameState.gameMode, challengeMode)} title="Restart"><RefreshCcw size={18} /></button>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="game-main">
          {/* Discard pile */}
          <div className="discard-column" onClick={() => setShowDiscardViewer(true)} style={{ cursor: 'pointer' }} title="View Discards">
            {gameState.discardedCards.length === 0 && (
              <div style={{ fontSize: '0.55rem', opacity: 0.25, writingMode: 'vertical-rl', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Discard</div>
            )}
            {gameState.discardedCards.slice(-10).map((card, i, arr) => (
              <img key={i} src={CARD_PACKS[selectedPack].getCardImagePath(card)} className="discarded-card" alt="discarded"
                style={{ '--rotate': `${(i - arr.length / 2) * 3}deg` } as React.CSSProperties} />
            ))}
          </div>

          {/* Grid */}
          <div className="grid-section">
            <div className="grid-container">
              <div className="row-scores" style={{ display: 'grid', gridTemplateRows: `repeat(${gameState.gameMode}, ${slotPx * 1.4}px)`, gap: '0.4rem' }}>
                {rowResults.map((res, i) => (
                  <div key={i} onMouseEnter={() => setHoveredLine({ type: 'Row', index: i })} onMouseLeave={() => setHoveredLine(null)}>
                    <ScoreIndicator result={res} />
                  </div>
                ))}
              </div>
              <div
                className="grid-board"
                style={{ gridTemplateColumns: `repeat(${gameState.gameMode}, ${slotPx}px)`, gap: '0.4rem' } as React.CSSProperties}
              >
                {gameState.grid.map((row, r) => row.map((card, c) => {
                  const slotId = `slot-${r}-${c}`;
                  const isTurnPlacement = turnPlacements.has(slotId);
                  const isSelectedForMove = selectedGridSlot === slotId;
                  const isHandSelected = !!selectedHandCardId && !card;
                  const isGridSelected = !!selectedGridSlot && !card;
                  
                  // Highlight logic
                  const isHoverHighlighted = hoveredLine && ((hoveredLine.type === 'Row' && hoveredLine.index === r) || (hoveredLine.type === 'Col' && hoveredLine.index === c));
                  // Flash logic if score just updated
                  const isScoringRow = rowResults[r].points > 0;
                  const isScoringCol = colResults[c].points > 0;
                  const flashClass = isScoringRow || isScoringCol ? 'flash-scoring' : '';

                  return (
                    <div key={slotId} className={`grid-slot-wrapper ${isHoverHighlighted ? 'hover-highlight' : ''} ${flashClass}`}>
                      <GridSlot
                        id={slotId}
                        card={card}
                        pack={CARD_PACKS[selectedPack]}
                        isYellowMark={isYellowMark(r, c, gameState.gameMode)}
                        isTurnPlacement={isTurnPlacement}
                        isSelectedForMove={isSelectedForMove}
                        isTargeted={(isHandSelected || isGridSelected)}
                        onTap={() => handleSlotTap(r, c)}
                        onCardTap={isTurnPlacement ? () => handleGridCardTap(slotId) : undefined}
                      />
                    </div>
                  );
                }))}
              </div>
              <div className="col-scores" style={{ gridColumn: 2, display: 'grid', gridTemplateColumns: `repeat(${gameState.gameMode}, ${slotPx}px)`, gap: '0.4rem' }}>
                {colResults.map((res, i) => (
                  <div key={i} onMouseEnter={() => setHoveredLine({ type: 'Col', index: i })} onMouseLeave={() => setHoveredLine(null)}>
                    <ScoreIndicator result={res} vertical />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="scores-column" />
        </div>

        {/* Hand / Confirm */}
        <div className="hand-section">
          <AnimatePresence mode="wait">
            {gameState.waitingForConfirmation ? (
              <motion.button
                key="confirm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="btn btn-confirm"
                onClick={confirmTurn}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.06em', position: 'relative', zIndex: 1 }}>
                  CONFIRM TURN
                </span>
                {discardCard && (
                  <div className="confirm-discard-row" style={{ position: 'relative', zIndex: 1 }}>
                    <span className="confirm-discard-label">Discarding</span>
                    <img
                      src={CARD_PACKS[selectedPack].getCardImagePath(discardCard)}
                      className="confirm-discard-img"
                      alt={`${discardCard.rank} of ${discardCard.suit}`}
                    />
                    <span className="confirm-discard-name">
                      {discardCard.rank} of {discardCard.suit.charAt(0).toUpperCase() + discardCard.suit.slice(1)}
                    </span>
                  </div>
                )}
                <span className="confirm-hint" style={{ position: 'relative', zIndex: 1 }}>or press Space / Enter</span>
              </motion.button>
            ) : (
              <motion.div key="hand" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hand-area glass-panel">
                <div className="hand-label">
                  PLACE <strong>{cardsLeft}</strong> card{cardsLeft !== 1 ? 's' : ''}
                  {selectedGridSlot && <span style={{ color: '#fbbf24', marginLeft: '0.5rem' }}>— tap empty slot to move</span>}
                </div>
                {turnPlacementHistory.length > 0 && (
                  <button className="btn btn-icon btn-undo" onClick={handleUndo} title="Undo last placement">
                    <Undo2 size={16} />
                  </button>
                )}
                {gameState.currentDraw.map(card => (
                  <div
                    key={card.id}
                    className={`hand-card-wrapper ${selectedHandCardId === card.id ? 'selected-card' : ''}`}
                    onClick={() => handleHandCardTap(card)}
                  >
                    <CardItem card={card} pack={CARD_PACKS[selectedPack]} />
                    <img src={CARD_PACKS[selectedPack].getCardImagePath(card)} className="card-preview" alt="preview" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedCard && (
            <div style={{ width: '80px', aspectRatio: '1/1.4', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}>
              <img src={CARD_PACKS[selectedPack].getCardImagePath(draggedCard)} className="card" alt="dragging" style={{ borderRadius: '0.5rem' }} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showPoints && <PointsTable onClose={() => setShowPoints(false)} />}
      {showDiscardViewer && <DiscardModal discardedCards={gameState.discardedCards} selectedPack={selectedPack} onClose={() => setShowDiscardViewer(false)} />}
      {showStats && <StatsModal stats={lifetimeStats} onClose={() => setShowStats(false)} />}
    </div>
  );
};

export default App;
