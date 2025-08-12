import { style } from '@vanilla-extract/css';

export const modalOverlay = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  zIndex: 100,
  width: '100%',
  background: 'white',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: 16,
  boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
  color: '#222',
});

export const title = style({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 'bold',
});

export const iconContainer = style({
  display: 'flex',
  marginTop: 8,
  marginLeft: -16,
  marginRight: -16,
});

export const iconInnerScroll = style({
  display: 'flex',
  gap: 12,
  overflowX: 'auto',
  paddingInline: 16,
});

export const iconButton = style({
  flexShrink: 0,
  fontSize: 24,
  width: 55,
  padding: 8,
  borderRadius: 8,
  background: 'none',
  cursor: 'pointer',
  border: '1px solid #ccc',
  transition: 'border-color 0.2s ease',

  ':hover': {
    borderColor: '#999',
  },
});

export const iconButtonSelected = style({
  border: '1px solid black',
});

export const textarea = style({
  width: '100%',
  marginTop: 12,
  borderRadius: 8,
  padding: 8,
  border: '1px solid #ccc',
  resize: 'vertical',
  fontFamily: 'inherit',
  fontSize: '0.9rem',

  ':focus': {
    outline: 'none',
    borderColor: '#007AFF',
    boxShadow: '0 0 0 2px rgba(0, 122, 255, 0.2)',
  },
});

export const buttonContainer = style({
  marginTop: 12,
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
});

export const button = style({
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  background: 'white',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',

  ':hover': {
    backgroundColor: '#f5f5f5',
  },
});

export const primaryButton = style([
  button,
  {
    backgroundColor: '#222',
    color: 'white',
    border: '1px solid #222',

    ':hover': {
      backgroundColor: '#000',
    },
  },
]);
