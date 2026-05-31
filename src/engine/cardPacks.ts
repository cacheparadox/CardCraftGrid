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

const RANK_NAME_MAP: Record<string, string> = {
  'A': 'Ace',
  'J': 'Jack',
  'Q': 'Queen',
  'K': 'King',
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10'
};

export const CARD_PACKS: Record<CardPackType, CardPack> = {
  CARDPACK1: {
    id: 'CARDPACK1',
    name: 'Classic White',
    description: 'Traditional card design with white borders.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      const suit = card.suit.toLowerCase();
      const rank = RANK_NAME_MAP[card.rank];
      
      // Handle extreme inconsistencies in CARDPACK1
      if (suit === 'spades') {
        if (card.rank === 'A') return `/assets/cardpacks/CARDPACK1/ace of spades.png`;
        if (card.rank === 'Q') return `/assets/cardpacks/CARDPACK1/queen of spades.png`;
        if (card.rank === 'K') return `/assets/cardpacks/CARDPACK1/king of spades.png`;
        // Jack of spades is Uppercase J in listing
      }
      if (suit === 'clubs' && card.rank === 'A') return `/assets/cardpacks/CARDPACK1/ace of clubs.png`;
      
      return `/assets/cardpacks/CARDPACK1/${rank} of ${suit}.png`;
    },
  },
  CARDPACK2: {
    id: 'CARDPACK2',
    name: 'Modern Blue',
    description: 'Clean modern design with blue accents.',
    cardRatio: 1.4,
    getCardImagePath: (card: Card) => {
      let val: string;
      if (card.rank === 'A') val = 'A';
      else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') val = card.rank;
      else {
        const n = parseInt(card.rank);
        val = n < 10 ? `0${n}` : `${n}`;
      }
      return `/assets/cardpacks/CARDPACK2/card_${card.suit}_${val}.png`;
    },
  },
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
};
