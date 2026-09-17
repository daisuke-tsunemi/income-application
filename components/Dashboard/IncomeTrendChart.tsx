'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { INK, MARK, SERIES, SURFACE } from './chartTheme';
import { niceTicks } from './chartTicks';
import { formatCompact } from '@/libs/format';
import type { MonthlyPoint } from '@/libs/analytics';
import styles from './dashboard.module.scss';

type Props = {
  data: MonthlyPoint[];
};

const yen = (value: number) => `${value.toLocaleString('ja-JP')} 円`;

const SERIES_LABEL = {
  income: '売上',
  expense: '必要経費',
  withheld: '源泉徴収税額',
} as const;

// 凡例は Recharts の並び順に任せず、売上を先頭に固定して自前で描画する
const LEGEND_KEYS = ['income', 'expense', 'withheld'] as const;

function ChartLegend() {
  return (
    <ul className={styles.legend}>
      {LEGEND_KEYS.map((key) => (
        <li key={key} className={styles.legend__item}>
          <span
            className={styles.legend__key}
            style={{ backgroundColor: SERIES[key] }}
            aria-hidden="true"
          />
          {SERIES_LABEL[key]}
        </li>
      ))}
    </ul>
  );
}

export default function IncomeTrendChart({ data }: Props) {
  const max = Math.max(
    0,
    ...data.map((point) => Math.max(point.income, point.expense, point.withheld)),
  );
  const ticks = niceTicks(max);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        {/* 罫線は実線ヘアライン。縦罫は引かない */}
        <CartesianGrid stroke={INK.grid} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: INK.secondary, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: INK.axis, strokeWidth: 1 }}
        />
        <YAxis
          // 目盛りはキリの良い数に固定する
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]]}
          tickFormatter={formatCompact}
          tick={{ fill: INK.muted, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          // クロスヘアで X を拾わせる（線そのものを狙わせない）
          cursor={{ stroke: INK.axis, strokeWidth: 1 }}
          content={({ active, payload, label }) =>
            active && payload && payload.length > 0 ? (
              <ChartTooltip
                title={String(label)}
                rows={payload.map((item) => ({
                  color: String(item.color ?? SERIES.income),
                  name:
                    SERIES_LABEL[item.dataKey as keyof typeof SERIES_LABEL] ??
                    String(item.dataKey),
                  value: yen(Number(item.value ?? 0)),
                }))}
              />
            ) : null
          }
        />
        <Legend verticalAlign="top" align="left" height={32} content={<ChartLegend />} />
        {LEGEND_KEYS.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={SERIES[key]}
            strokeWidth={MARK.lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            // 面色のリングで重なりを分離する
            dot={{ r: 4, fill: SERIES[key], stroke: SURFACE, strokeWidth: MARK.surfaceGap }}
            activeDot={{ r: 6, fill: SERIES[key], stroke: SURFACE, strokeWidth: MARK.surfaceGap }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
