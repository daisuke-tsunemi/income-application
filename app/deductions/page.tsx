// app/deductions/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Notice from '@/components/Notice';
import Coverage from '@/components/Notice/Coverage';
import DeductionGuide from '@/components/Notice/DeductionGuide';
import StatTiles from '@/components/Dashboard/StatTiles';
import SummarySection from '@/components/Dashboard/SummarySection';
import YearFilter from '@/components/Dashboard/YearFilter';
import { DeductionByTypeTable, DeductionDetailTable } from '@/components/DeductionsList';
import { getDeductions } from '@/libs/microcms';
import { buildDeductionByType, buildSummary } from '@/libs/analytics';
import { buildPeriod, defaultYear, yearOptions } from '@/libs/period';
import {
  INSURANCE_CATEGORY_REQUIRED,
  MEDICAL_DEDUCTION_FLOOR,
  MEDICAL_DEDUCTION_TYPE,
  UNCOVERED_ITEMS,
} from '@/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '所得控除',
};

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Deductions({ searchParams }: Props) {
  const { year } = await searchParams;
  const period = buildPeriod(year);

  const { contents: deductions } = await getDeductions(period.filters);

  const summary = buildSummary([], [], deductions);
  const byType = buildDeductionByType(deductions);
  const missingCertificate = deductions.filter((item) => !item.certificate_image).length;
  // 第二表で区分ごとに行を分ける必要があるのに未設定のもの
  const requiresCategory = INSURANCE_CATEGORY_REQUIRED as readonly string[];
  const missingCategory = byType.reduce(
    (total, group) =>
      total + (requiresCategory.includes(group.type) ? group.missingCategoryCount : 0),
    0,
  );
  const netTotal = byType.reduce((total, group) => total + group.netAmount, 0);

  return (
    <>
      <Header title="所得控除の集計" />

      <YearFilter
        year={period.year}
        options={yearOptions()}
        defaultYear={defaultYear()}
        note={`控除 ${summary.deductionCount} 件／${byType.length} 種別`}
      />

      <div className="u-mb24">
        <StatTiles
          tiles={[
            {
              label: '支払金額の合計',
              value: summary.deductionTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '控除額そのものではない点に注意',
            },
            {
              label: '補填額を差し引いた額',
              value: netTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '保険金などで補填される金額を除いた合計',
            },
            {
              label: '第二表の区分 未設定',
              value: missingCategory.toLocaleString('ja-JP'),
              unit: '件',
              note: '生命保険料・地震保険料は区分ごとに行を分ける',
              alert: missingCategory > 0,
            },
            {
              label: '証明書 未添付',
              value: missingCertificate.toLocaleString('ja-JP'),
              unit: '件',
              note: '提出・保存が必要な証明書',
              alert: missingCertificate > 0,
            },
          ]}
        />
      </div>

      <SummarySection
        title="控除の種類別の年間合計"
        note="申告書 第一表「所得から差し引かれる金額」へ転記"
        total={{ label: '支払金額の合計', value: summary.deductionTotal }}
      >
        <DeductionByTypeTable rows={byType} />
      </SummarySection>

      {byType.map((group) => {
        const isMedical = group.type === MEDICAL_DEDUCTION_TYPE;
        return (
          <SummarySection
            key={group.type}
            title={group.type}
            note={
              isMedical
                ? `${group.count.toLocaleString('ja-JP')} 件／足切り ${MEDICAL_DEDUCTION_FLOOR.toLocaleString('ja-JP')} 円を引く前の金額`
                : `${group.count.toLocaleString('ja-JP')} 件`
            }
            total={{
              label: group.compensatedAmount > 0 ? '補填額を差し引いた金額' : '支払金額の合計',
              value: group.netAmount,
            }}
          >
            <DeductionGuide type={group.type} />
            <DeductionDetailTable rows={group.items} />
          </SummarySection>
        );
      })}

      <div className="u-mt40">
        <Coverage items={UNCOVERED_ITEMS.deductions} />
      </div>

      <div className="u-mt16">
        <Notice>
          表示しているのは<strong>支払金額の合計</strong>であって、控除額そのものではありません。
          各種別の「転記」欄が<strong>支払額＝控除額</strong>なら合計をそのまま入力でき、
          <strong>要計算・区分</strong>なら計算式・足切り・区分記入が挟まります。
        </Notice>
      </div>
    </>
  );
}
