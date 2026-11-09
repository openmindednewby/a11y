/** One Tab stop for a group of controls: 0 on the active one, -1 on the rest. */
export function rovingTabIndexes(count: number, active: number): number[] {
  return Array.from({ length: count }, (_, index) => (index === active ? 0 : -1));
}

/** Where an arrow key moves focus in a horizontal group, wrapping at the ends; undefined for any other key. */
export function rovingArrowTarget(key: string, index: number, count: number): number | undefined {
  if (key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowLeft') return (index - 1 + count) % count;
  return undefined;
}
