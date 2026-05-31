import { Card, Rank } from './types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export type HandRarity = 'none' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface PokerHandResult {
  name: string;
  shortName: string;
  points: number;
  rarity: HandRarity;
}

export function evaluateHand(cards: (Card | null)[]): PokerHandResult {
  const activeCards = cards.filter((c): c is Card => c !== null);
  if (activeCards.length < 2) return { name: 'High Card', shortName: 'Hi', points: 0, rarity: 'none' };

  const ranks = activeCards.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  const suits = activeCards.map(c => c.suit);
  const counts = new Map<number, number>();
  ranks.forEach(r => counts.set(r, (counts.get(r) || 0) + 1));
  const freq = Array.from(counts.values()).sort((a, b) => b - a);

  const isFlush = new Set(suits).size === 1 && activeCards.length === cards.length;
  const isStraight = activeCards.length === cards.length && ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);

  // Low straight: A-2-3-4 (4-card game) or A-2-3-4-5 (5-card game)
  const isLowStraight = activeCards.length === cards.length &&
    ranks.includes(14) && ranks.includes(2) && ranks.includes(3) &&
    (cards.length === 4 ? ranks.includes(4) && ranks.length === 4 : ranks.includes(4) && ranks.includes(5));

  // Royal Flush: top-end straight flush (ends with Ace)
  if (isFlush && isStraight && ranks[ranks.length - 1] === 14) return { name: 'Royal Flush', shortName: 'RF', points: 500, rarity: 'legendary' };
  if (isFlush && (isStraight || isLowStraight)) return { name: 'Straight Flush', shortName: 'SF', points: 250, rarity: 'legendary' };
  if (freq[0] === 4) return { name: 'Four of a Kind', shortName: '4K', points: 150, rarity: 'epic' };
  if (freq[0] === 3 && freq[1] === 2) return { name: 'Full House', shortName: 'FH', points: 100, rarity: 'epic' };
  if (isFlush) return { name: 'Flush', shortName: 'FL', points: 75, rarity: 'rare' };
  if (isStraight || isLowStraight) return { name: 'Straight', shortName: 'ST', points: 50, rarity: 'rare' };
  if (freq[0] === 3) return { name: 'Three of a Kind', shortName: '3K', points: 25, rarity: 'uncommon' };
  if (freq[0] === 2 && freq[1] === 2) return { name: 'Two Pair', shortName: '2P', points: 15, rarity: 'uncommon' };
  if (freq[0] === 2) return { name: 'Pair', shortName: 'PR', points: 5, rarity: 'common' };

  return { name: 'High Card', shortName: 'Hi', points: 0, rarity: 'none' };
}

export function calculateTotalScore(grid: (Card | null)[][], size: number): { total: number; details: ScoreDetail[] } {
  let total = 0;
  const details: ScoreDetail[] = [];

  for (let r = 0; r < size; r++) {
    const res = evaluateHand(grid[r]);
    if (res.points > 0) {
      total += res.points;
      details.push({ type: 'Row', index: r, ...res });
    }
  }

  for (let c = 0; c < size; c++) {
    const colCards = grid.map(row => row[c]);
    const res = evaluateHand(colCards);
    if (res.points > 0) {
      total += res.points;
      details.push({ type: 'Col', index: c, ...res });
    }
  }

  // Corners bonus
  const corners = [grid[0][0], grid[0][size - 1], grid[size - 1][0], grid[size - 1][size - 1]];
  const cornerRes = evaluateHand(corners);
  if (cornerRes.points > 0) {
    total += cornerRes.points;
    details.push({ type: 'Corners', index: -1, ...cornerRes });
  }

  return { total, details };
}

export interface ScoreDetail extends PokerHandResult {
  type: 'Row' | 'Col' | 'Corners';
  index: number;
}
