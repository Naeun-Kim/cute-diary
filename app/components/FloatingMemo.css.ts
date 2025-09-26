import { style, globalStyle } from '@vanilla-extract/css';

export const iconStyle = style({
  fontSize: '32px',
  cursor: 'pointer',
  userSelect: 'none',
});

export const memoContainer = style({
  position: 'relative',
  zIndex: 1,
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

export const controlContainer = style({
  position: 'absolute',
  top: 4,
  right: '36px',
  display: 'flex',
  gap: '8px',
});

export const controlButton = style({
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
});

export const controlButtonWrapper = style({
  position: 'relative',
  display: 'flex',
  gap: '8px',
  paddingBlock: '8px',
});

export const iconLarge = style({
  marginTop: '4px',
  fontSize: '20px',
});

export const multipleIconContainer = style({
  position: 'relative',
  display: 'inline-block',
});

export const multipleIcon = style({
  fontSize: '32px',
});

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

export const swiperContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  width: '100%',
  height: '100%',
});

export const swiperPagination = style({});

globalStyle(`${swiperPagination} .swiper-pagination`, {
  position: 'static',
});

globalStyle(`${swiperPagination} .swiper-pagination-bullet-active`, {
  backgroundColor: '#111 !important',
});

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

export const addButtonContainer = style({
  position: 'absolute',
  top: '8px',
  left: '8px',
  zIndex: 10,
});

export const closeButtonContainer = style({
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 10,
});

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

export const closeButton = style({
  background: 'none',
  color: '#111',
  width: '28px',
  height: '28px',
  fontSize: '28px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const memoText = style({
  paddingInline: '12px',
  selectors: {
    [`${memoContainer} > &`]: {
      paddingBottom: '8px',
    },
  },
});
