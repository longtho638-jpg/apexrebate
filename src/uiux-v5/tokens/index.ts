export * from './colors'
export * from './radius'
export * from './spacing'
export * from './shadows'
export * from './typography'

export const motion = {
  entrance: { type: 'fade+slide', distance: 20, duration: 0.45, stagger: 0.06 },
  hover: { scale: 1.02, glow: 'rgba(51,209,184,0.2)' },
  parallax: { min: 25, max: 60 },
  scroll: { heroShift: 40 },
}
