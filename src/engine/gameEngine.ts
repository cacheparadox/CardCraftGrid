import { Card, Rank, Suit, GameState, GridSize } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}_of_${suit}_${Math.random().toString(36).substr(2, 9)}`,
        suit,
        rank
      });
    });
  });
  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function createInitialState(size: GridSize): GameState {
  const deck = createDeck();
  const grid = Array(size).fill(null).map(() => Array(size).fill(null));
  const initialDraw = deck.splice(0, size + 1);

  return {
    grid,
    deck,
    currentDraw: initialDraw,
    discardedCards: [],
    placedCount: 0,
    currentRound: 1,
    totalTurns: 0,
    score: 0,
    gameMode: size,
    isGameOver: false,
    selectedCardId: null,
    waitingForConfirmation: false,
    history: []
  };
}
