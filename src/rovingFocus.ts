import { RovingAxis } from './RovingAxis';

const HORIZONTAL_STEPS = new Map<string, number>([
  ['ArrowRight', 1],
  ['ArrowLeft', -1],
]);
const BOTH_STEPS = new Map<string, number>([
  ...HORIZONTAL_STEPS,
  ['ArrowDown', 1],
  ['ArrowUp', -1],
]);

/** One Tab stop for a group of controls: 0 on the active one, -1 on the rest. */
export function rovingTabIndexes(count: number, active: number): number[] {
  return Array.from({ length: count }, (_, index) => (index === active ? 0 : -1));
}

/** Where an arrow key moves focus in a group, wrapping at the ends; `Both` also walks Up/Down; undefined for any other key. */
export function rovingArrowTarget(
  key: string,
  index: number,
  count: number,
  axis: RovingAxis = RovingAxis.Horizontal,
): number | undefined {
  const step = (axis === RovingAxis.Both ? BOTH_STEPS : HORIZONTAL_STEPS).get(key);
  if (step === undefined) return undefined;
  return (index + step + count) % count;
}
