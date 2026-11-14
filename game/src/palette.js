// Dustline tactical palette - dusk desert mood
export const PALETTE = {
  canvas: '#222d3d',
  surface: '#333d4e',
  hairline: '#4d5d75',
  ink: '#f5f0e6',
  muted: '#c2b8a8',
  accent: '#e07a38', // vibrant amber/rust accent
  sand: '#d9c39a',
  sandDark: '#8c7853',
  rust: '#b84a2d',
  teal: '#2d828c',
  metal: '#525c6a',
  sky: '#3a4a63',
  ground: '#6b5a44'
};

export function shade(name) {
  return PALETTE[name] || PALETTE.accent;
}
