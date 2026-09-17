/**
 * 金額軸の目盛りを 1 / 2 / 2.5 / 5 × 10^n に丸めて返す。
 * Recharts の既定（等分割）だと 7,500 のような半端な値が出て、
 * 短縮表記した際に単位が混在するため自前で刻みを決める。
 */
export const niceTicks = (max: number, targetCount = 4): number[] => {
  if (!Number.isFinite(max) || max <= 0) return [0];

  const rawStep = max / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10].map((multiplier) => multiplier * magnitude).find((candidate) => candidate >= rawStep) ??
    10 * magnitude;

  const ticks: number[] = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
};

/** niceTicks の上端。軸の domain 上限に使う */
export const niceMax = (max: number, targetCount = 4): number => {
  const ticks = niceTicks(max, targetCount);
  return ticks[ticks.length - 1];
};
