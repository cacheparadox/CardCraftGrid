import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Card, CardPack } from '../engine/types';
import { motion } from 'framer-motion';

// Draggable card for slots placed this turn
const TurnPlacedCard: React.FC<{
  card: Card;
  pack: CardPack;
  slotId: string;
  isSelected: boolean;
  onCardTap?: () => void;
}> = ({ card, pack, slotId, isSelected, onCardTap }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `gridcard-${slotId}`,
    data: { id: card.id, suit: card.suit, rank: card.rank, fromSlot: slotId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: '100%',
        height: '100%',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.15 : 1,
        position: 'relative',
        zIndex: isDragging ? 200 : undefined,
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onCardTap?.(); }}
    >
      <motion.img
        key={card.id}
        src={pack.getCardImagePath(card)}
        className="card"
        alt={`${card.rank} of ${card.suit}`}
        draggable={false}
        initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
        animate={{
          scale: 1,
          opacity: 1,
          rotateY: 0,
          filter: isSelected ? 'drop-shadow(0 0 10px #38bdf8) brightness(1.15)' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
    </div>
  );
};

interface GridSlotProps {
  id: string;
  card: Card | null;
  pack: CardPack;
  isYellowMark?: boolean;
  onTap?: () => void;
  isTargeted?: boolean;
  isTurnPlacement?: boolean;
  isSelectedForMove?: boolean;
  onCardTap?: () => void;
}

export const GridSlot: React.FC<GridSlotProps> = ({
  id, card, pack, isYellowMark, onTap, isTargeted,
  isTurnPlacement, isSelectedForMove, onCardTap,
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const cls = [
    'grid-slot',
    isOver ? 'highlight' : '',
    isYellowMark ? 'yellow-mark' : '',
    card ? 'filled' : '',
    isTargeted ? 'targeted' : '',
    isSelectedForMove ? 'move-selected' : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={setNodeRef} className={cls} onClick={!card ? onTap : undefined}>
      {card && isTurnPlacement ? (
        <TurnPlacedCard
          card={card}
          pack={pack}
          slotId={id}
          isSelected={!!isSelectedForMove}
          onCardTap={onCardTap}
        />
      ) : card ? (
        <motion.img
          key={card.id}
          src={pack.getCardImagePath(card)}
          alt={`${card.rank} of ${card.suit}`}
          className="card"
          initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          draggable={false}
        />
      ) : (
        <div className="slot-empty-dot" />
      )}
    </div>
  );
};
