import { useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { motion } from 'framer-motion';
import * as styles from './FloatingMemo.css';

type WalkEvent = {
  id: string;
  lat: number;
  lng: number;
  icon: '💩' | '🐾' | '🍀' | '🐯' | '💕' | '😺' | '🐰' | '🦊' | '🐙' | '🦄';
  memo: string;
};

interface FloatingMemoProps {
  event: WalkEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleMemo: () => void;
}

export default function FloatingMemo({
  event,
  onEdit,
  onDelete,
  onToggleMemo,
}: FloatingMemoProps) {
  const [showMemo, setShowMemo] = useState(false);

  const handleIconClick = () => {
    // 메모 토글 시, 부모 상태(newEvent) 초기화
    onToggleMemo();
    setShowMemo((prev) => !prev);
  };

  return (
    <>
      <CustomOverlayMap
        position={{ lat: event.lat, lng: event.lng }}
        yAnchor={0.5}
      >
        <div onClick={handleIconClick} className={styles.iconStyle}>
          {event.icon}
        </div>
      </CustomOverlayMap>
      {showMemo && (
        <CustomOverlayMap
          position={{ lat: event.lat, lng: event.lng }}
          yAnchor={1}
        >
          <motion.div
            className={styles.memoContainer}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={styles.controlContainer}>
              <button
                onClick={() => onEdit(event.id)}
                className={styles.controlButton}
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className={styles.controlButton}
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div className={styles.iconLarge}>{event.icon}</div>
            <p>{event.memo}</p>
          </motion.div>
        </CustomOverlayMap>
      )}
    </>
  );
}
