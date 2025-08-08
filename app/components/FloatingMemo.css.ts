// FloatingMemo.css.ts
import { style } from '@vanilla-extract/css';

// 아이콘 스타일
export const iconStyle = style({
  fontSize: '32px',
  cursor: 'pointer',
  userSelect: 'none',
});

// 메모 컨테이너 스타일
export const memoContainer = style({
  position: 'relative',
  background: 'rgba(255,255,255,.9)',
  borderRadius: '12px',
  padding: '8px 12px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  fontSize: '14px',
  color: '#222',
  textAlign: 'center',
  width: '200px',
  whiteSpace: 'normal',
});

// 컨트롤 버튼 래퍼
export const controlContainer = style({
  position: 'absolute',
  top: 4,
  right: 4,
  display: 'flex',
  gap: '4px',
});

// 편집/삭제 버튼 스타일
export const controlButton = style({
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
});

// 메모 아이콘 크기
export const iconLarge = style({
  fontSize: '20px',
});
