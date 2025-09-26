import { style } from '@vanilla-extract/css';

export const authBarContainer = style({
  position: 'fixed',
  top: '0',
  zIndex: '5',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '8px',
  backgroundColor: '#111',
});

export const userEmail = style({
  fontSize: '14px',
});
