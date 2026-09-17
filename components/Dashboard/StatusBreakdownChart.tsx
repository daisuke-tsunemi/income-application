'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { INK, MARK, NEUTRAL, ordinalColor } from './chartTheme';
import type { StatusPoint } from '@/libs/analytics';

type Props = {
  data: StatusPoint[];
};

export default function StatusBreakdownChart({ data }: Props) {
  // 順序ランプはパイプライン段階の数に合わせて割り当てる
  const pipelineCount = data.filter((point) => point.inPipeline).length;
  const colorOf = (point: StatusPoint, index: number) =>
    point.inPipeline ? ordinalColor(index, pipelineCount) : NEUTRAL;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48 + 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 40, bottom: 0, left: 8 }}
        barCategoryGap="30%"
      >
        <CartesianGrid stroke={INK.grid} strokeWidth={1} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          // 最大値までで軸を止める（件数が少ないときに軸だけ伸びるのを防ぐ）
          domain={[0, (dataMax: number) => Math.max(1, dataMax)]}
          tick={{ fill: INK.muted, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: INK.axis, strokeWidth: 1 }}
        />
        <YAxis
          type="category"
          dataKey="status"
          tick={{ fill: INK.secondary, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip
          cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          content={({ active, payload }) =>
            active && payload && payload.length > 0 ? (
              <ChartTooltip
                title={String((payload[0].payload as StatusPoint).status)}
                rows={[
                  {
                    color: colorOf(
                      payload[0].payload as StatusPoint,
                      data.indexOf(payload[0].payload as StatusPoint),
                    ),
                    name: '商談数',
                    value: `${Number(payload[0].value ?? 0).toLocaleString('ja-JP')} 件`,
                  },
                ]}
              />
            ) : null
          }
        />
        {/* 単一系列なので凡例は置かない（見出しが内容を示す） */}
        <Bar dataKey="count" maxBarSize={MARK.barSize} radius={[0, MARK.barRadius, MARK.barRadius, 0]}>
          {data.map((point, index) => (
            <Cell key={point.status} fill={colorOf(point, index)} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            fill={INK.secondary}
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
