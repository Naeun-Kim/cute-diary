import { useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { motion } from 'framer-motion';
import * as styles from './FloatingMemo.css';
import type { WalkEvent } from '../types/walk';

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

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // 메모 토글 시, 부모 상태(newEvent) 초기화
    onToggleMemo();
    setShowMemo((prev) => !prev);
  };

  const handleMemoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onToggleMemo(); // 혹시 열려 있을 수 있는 새 이벤트 모달 닫기
    onEdit(event.id); // 부모에서 editingEvent 설정 → EventModal 오픈
    setShowMemo(false); // 메모 오버레이는 닫아두기(선택)
  };

  return (
    <>
      <CustomOverlayMap
        position={{ lat: event.lat, lng: event.lng }}
        yAnchor={0.5}
        clickable
      >
        <div onClick={handleIconClick} className={styles.iconStyle}>
          {event.icon}
        </div>
      </CustomOverlayMap>
      {showMemo && (
        <CustomOverlayMap
          position={{ lat: event.lat, lng: event.lng }}
          yAnchor={1}
          clickable
        >
          <motion.div
            className={styles.memoContainer}
            onClick={handleMemoClick}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={styles.controlContainer}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event.id);
                }}
                className={styles.controlButton}
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
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
