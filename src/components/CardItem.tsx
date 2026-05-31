import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardPack } from '../engine/types';
import { motion } from 'framer-motion';

interface CardItemProps {
  card: Card;
  pack: CardPack;
  isDragging?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({ card, pack, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
    data: card,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`card-wrapper ${isDragging ? 'dragging' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img 
        src={pack.getCardImagePath(card)} 
        alt={`${card.rank} of ${card.suit}`} 
        className="card"
        draggable={false}
      />
    </motion.div>
  );
};
