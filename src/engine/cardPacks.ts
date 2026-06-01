import { Card, CardPack, CardPackType, Rank, Suit } from './types';

const getSuitChar = (suit: Suit) => suit[0].toLowerCase();
const getRankValue = (rank: Rank) => {
  if (rank === 'A') return '01';
  if (rank === 'J') return '11';
  if (rank === 'Q') return '12';
  if (rank === 'K') return '13';
  const val = parseInt(rank);
  return val < 10 ? `0${val}` : `${val}`;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const CARD_PACKS: Record<CardPackType, CardPack> = {
  CARDPACK3: {
    id: 'CARDPACK3',
    name: 'Retro Pixel',
    description: 'Pixel art style for a retro feel.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      return `/assets/cardpacks/CARDPACK3/${getSuitChar(card.suit)}${getRankValue(card.rank)}.png`;
    },
  },
  CARDPACK4: {
    id: 'CARDPACK4',
    name: 'Sleek Dark',
    description: 'Elegant dark-themed cards.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      return `/assets/cardpacks/CARDPACK4/${getSuitChar(card.suit)}${getRankValue(card.rank)}.png`;
    },
  },
  CARDPACK5: {
    id: 'CARDPACK5',
    name: 'Vintage Classic',
    description: 'High-resolution vintage playing cards.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      const suitName = capitalize(card.suit);
      let rankName = card.rank as string;
      if (rankName === 'A') rankName = 'Ace';
      else if (rankName === 'J') rankName = 'Jack';
      else if (rankName === 'Q') rankName = 'Queen';
      else if (rankName === 'K') rankName = 'King';
      return `/assets/cardpacks/CARDPACK5/${suitName}/${rankName}.png`;
    },
  },
  CARDPACK6: {
    id: 'CARDPACK6',
    name: 'Mystic Tarot',
    description: 'A beautifully painted mystic tarot deck.',
    cardRatio: 1.7, // Tarot cards are typically taller
    getCardImagePath: (card: Card) => {
      let suitName = '';
      if (card.suit === 'hearts') suitName = 'Cups';
      else if (card.suit === 'spades') suitName = 'Swords';
      else if (card.suit === 'clubs') suitName = 'Wands';
      else if (card.suit === 'diamonds') suitName = 'Pentacles';
      
      const rankNum = getRankValue(card.rank); // returns '01', '02', ..., '13'
      return `/assets/cardpacks/CARDPACK6/${suitName}${rankNum}.png`;
    },
  },
  CARDPACK7: {
    id: 'CARDPACK7',
    name: 'Clean Vector',
    description: 'Modern, crisp vector playing cards.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      const suitName = capitalize(card.suit);
      const suitChar = getSuitChar(card.suit); // 'c', 'd', 'h', 's'
      let rankNum = card.rank as string;
      if (rankNum === 'A') rankNum = '1';
      else if (rankNum === 'J') rankNum = '11';
      else if (rankNum === 'Q') rankNum = '12';
      else if (rankNum === 'K') rankNum = '13';
      
      return `/assets/cardpacks/CARDPACK7/${suitName}/${rankNum}${suitChar}.png`;
    },
  },
};
