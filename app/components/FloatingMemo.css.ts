// FloatingMemo.css.ts
import { style, globalStyle } from '@vanilla-extract/css';

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
  paddingBlock: '8px',
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
  marginTop: '4px',
  fontSize: '20px',
});

// 여러 이벤트 아이콘 컨테이너
export const multipleIconContainer = style({
  position: 'relative',
  display: 'inline-block',
});

// 여러 이벤트 아이콘
export const multipleIcon = style({
  fontSize: '32px',
});

// 이벤트 개수 표시
export const eventCount = style({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: '#ff6b6b',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
});

// Swiper 컨테이너
export const swiperContainer = style({
  width: '100%',
  height: '100%',
});

// Swiper 페이지네이션 스타일
export const swiperPagination = style({});

globalStyle(`${swiperPagination} .swiper-pagination`, {
  bottom: '0 !important',
});

globalStyle(`${swiperPagination} .swiper-pagination-bullet-active`, {
  backgroundColor: '#111 !important',
});

// 메모 슬라이드
export const memoSlide = style({
  position: 'relative',
  gap: '4px',
  paddingInline: '12px',
  fontSize: '14px',
  color: '#222',
  textAlign: 'center',
  width: '100%',
  whiteSpace: 'normal',
  height: '100%',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
});

// 슬라이드 인디케이터
export const slideIndicator = style({
  position: 'absolute',
  bottom: '4px',
  right: '4px',
  background: 'rgba(0,0,0,0.5)',
  color: 'white',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '10px',
});

// + 버튼 컨테이너
export const addButtonContainer = style({
  position: 'absolute',
  top: '4px',
  left: '4px',
  zIndex: 10,
});

// + 버튼 스타일
export const addButton = style({
  background: '#4ade80',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  transition: 'all 0.2s ease',
  ':hover': {
    background: '#22c55e',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

// 메모 텍스트 스타일
export const memoText = style({
  paddingInline: '12px',
  selectors: {
    [`${memoContainer} > &`]: {
      paddingBottom: '8px',
    },
  },
});
