'use client';

import { useState } from 'react';
import * as styles from './EventModal.css';
import type { IconType } from '../types/walk';

const icons: IconType[] = [
  '💩',
  '🐾',
  '🍀',
  '🐯',
  '💕',
  '😺',
  '🐰',
  '🦊',
  '🐙',
  '🦄',
];

export default function EventModal({
  onClose,
  onSubmit,
  initialIcon,
  initialMemo,
}: {
  onClose: () => void;
  onSubmit: (icon: IconType, memo: string) => void;
  initialIcon: IconType;
  initialMemo: string;
}) {
  const [selectedIcon, setSelectedIcon] = useState<IconType>(initialIcon);
  const [memo, setMemo] = useState(initialMemo);

  const handleSubmit = () => {
    if (memo.trim()) {
      onSubmit(selectedIcon, memo);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <h3 className={styles.title}>이벤트 추가</h3>
      <div className={styles.iconContainer}>
        <div className={styles.iconInnerScroll}>
          {icons.map((icon) => (
            <button
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              className={`${styles.iconButton} ${
                selectedIcon === icon ? styles.iconButtonSelected : ''
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <textarea
        rows={3}
        className={styles.textarea}
        placeholder="메모를 입력하세요 (최대 200자)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        maxLength={200}
      />
      <div className={styles.charCount}>{memo.length}/200</div>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={onClose}>
          취소
        </button>
        <button className={styles.primaryButton} onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
}
