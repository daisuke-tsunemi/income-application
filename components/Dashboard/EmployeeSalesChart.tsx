'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import Empty from '@/components/List/Empty';
import { INK, MARK, SERIES } from './chartTheme';
import { niceTicks } from './chartTicks';
import { formatCompact } from '@/libs/format';
import type { EmployeePoint } from '@/libs/analytics';

type Props = {
  data: EmployeePoint[];
};

export default function EmployeeSalesChart({ data }: Props) {
  // 0件だと軸すら描かれず枠だけになるため、明示的に空状態を出す
  if (data.length === 0) return <Empty message="対象期間に担当者が紐づく商談がありません。" />;

  const ticks = niceTicks(Math.max(0, ...data.map((point) => point.sales)));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48 + 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 72, bottom: 0, left: 8 }}
        barCategoryGap="30%"
      >
        <CartesianGrid stroke={INK.grid} strokeWidth={1} horizontal={false} />
        <XAxis
          type="number"
          // 目盛りはキリの良い数に固定する
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]]}
          tickFormatter={formatCompact}
          tick={{ fill: INK.muted, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: INK.axis, strokeWidth: 1 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: INK.secondary, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={96}
        />
        <Tooltip
          cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const point = payload[0].payload as EmployeePoint;
            return (
              <ChartTooltip
                title={point.name}
                rows={[
                  { color: SERIES.sales, name: '売上金額', value: `${point.sales.toLocaleString('ja-JP')} 円` },
                  { color: INK.muted, name: '担当件数', value: `${point.count.toLocaleString('ja-JP')} 件` },
                ]}
              />
            );
          }}
        />
        {/* 名義尺度なので全バーを同色にする（値でランプを変えない） */}
        <Bar
          dataKey="sales"
          fill={SERIES.sales}
          maxBarSize={MARK.barSize}
          radius={[0, MARK.barRadius, MARK.barRadius, 0]}
        >
          <LabelList
            dataKey="sales"
            position="right"
            offset={8}
            fill={INK.secondary}
            fontSize={12}
            formatter={(value) => Number(value ?? 0).toLocaleString('ja-JP')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
