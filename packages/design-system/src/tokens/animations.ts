export const duration = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
} as const;

export const easing = {
  out: [0, 0, 0.2, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
};

export const spring = {
  snappy: { stiffness: 400, damping: 30 },
  gentle: { stiffness: 200, damping: 20 },
  bouncy: { stiffness: 300, damping: 15 },
} as const;

export const stagger = {
  fast: 0.03,
  normal: 0.04,
  slow: 0.08,
} as const;

export const hop = {
  distance: -4,
  initialDelay: 0.15,
  stagger: 0.05,
  duration: 0.5,
  repeatDelay: 1.0,
  ease: [0.34, 1.56, 0.64, 1] as const,
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
export type Spring = typeof spring;
