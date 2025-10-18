'use client';

import { useState } from 'react';
import * as styles from './EventModal.css';
import type { IconType } from '../types/walk';
import { checkProfanity } from '../utils/profanity';

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
    const res = checkProfanity(memo);

    // 자음/모음만, 비속어(strict/soft) 모두 저장 불가
    if (res.level === 'strict' || res.level === 'soft') {
      alert('자음/모음만 입력 또는 부적절한 표현이 포함되어 저장할 수 없어요.');
      return;
    }

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
