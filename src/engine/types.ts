export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GridSize = 4 | 5;

export interface GameState {
  grid: (Card | null)[][];
  deck: Card[];
  currentDraw: Card[];
  discardedCards: Card[];
  placedCount: number;
  currentRound: number;
  totalTurns: number;
  score: number;
  gameMode: GridSize;
  isGameOver: boolean;
  selectedCardId: string | null;
  waitingForConfirmation: boolean;
  history: any[];
}

export type CardPackType = 'CARDPACK3' | 'CARDPACK4' | 'CARDPACK5' | 'CARDPACK6' | 'CARDPACK7';

export interface CardPack {
  id: CardPackType;
  name: string;
  description: string;
  getCardImagePath: (card: Card) => string;
  cardRatio: number; // height / width
}

export interface HandScore {
  name: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}
