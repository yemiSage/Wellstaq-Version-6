export const typography = {
  fontFamily: {
    display: 'var(--font-display)',
    sans: 'var(--font-sans)',
  },
  scale: {
    h1: { fontSize: '52px', lineHeight: '60px', letterSpacing: '-0.02em' },
    h2: { fontSize: '36px', lineHeight: '44px', letterSpacing: '-0.02em' },
    h3: { fontSize: '30px', lineHeight: '38px' },
    h4: { fontSize: '24px', lineHeight: '32px' },
    h5: { fontSize: '20px', lineHeight: '30px' },
    subheading: { fontSize: '16px', lineHeight: '24px' },
    body: { fontSize: '14px', lineHeight: '20px' },
    caption: { fontSize: '12px', lineHeight: '18px' },
  },
} as const;
