// Dustline tactical palette - dusk desert mood
export const PALETTE = {
  canvas: '#181512',
  surface: '#26221d',
  hairline: '#3a332a',
  ink: '#f5f0e6',
  muted: '#a89f91',
  accent: '#e07a38', // vibrant amber/rust accent
  sand: '#d9c39a',
  sandDark: '#8c7853',
  rust: '#b84a2d',
  teal: '#2d828c',
  metal: '#424850',
  sky: '#222834',
  ground: '#2a241b'
};

export function shade(name) {
  return PALETTE[name] || PALETTE.accent;
}
