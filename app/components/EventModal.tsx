'use client';

import { useState } from 'react';
import * as styles from './EventModal.css';

type IconType =
  | '💩'
  | '🐾'
  | '🍀'
  | '🐯'
  | '💕'
  | '😺'
  | '🐰'
  | '🦊'
  | '🐙'
  | '🦄';

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
  onSubmit: (icon: '💩' | '🐾' | '🎉', memo: string) => void;
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
      <textarea
        rows={3}
        className={styles.textarea}
        placeholder="메모를 입력하세요"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
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
