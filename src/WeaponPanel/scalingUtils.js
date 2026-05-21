export const SCALING_TYPES = ['none', 'spirit', 'courage', 'boon'];

export const SCALING_ICONS = {
  none: null,
  spirit: 'scaling-spirit',
  courage: 'scaling-courage',
  boon: 'scaling-boon',
};

export function getNextScaling(currentScaling) {
  const currentIndex = SCALING_TYPES.indexOf(currentScaling || 'none');
  const nextIndex = (currentIndex + 1) % SCALING_TYPES.length;
  return SCALING_TYPES[nextIndex];
}
