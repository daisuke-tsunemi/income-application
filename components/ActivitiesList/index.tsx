import Link from 'next/link';
import DataTable, { type Column } from '@/components/List/DataTable';
import { EMPTY_LABEL, formatDateTime } from '@/libs/format';
import type { Activity } from '@/libs/types';

type Props = {
  activities: Activity[];
};

const columns: Column<Activity>[] = [
  {
    header: '活動日時',
    cell: (activity) => (
      <p className='c-txt__xs'>
        {formatDateTime(activity.activatedAt) ?? EMPTY_LABEL}
      </p>
    ),
  },
  {
    header: '活動タイトル',
    cell: (activity) =>
      activity.deals ? (
        <Link href={`/activities/${activity.id}`} className="c-heading--sm">{activity['activity-title']}</Link>
      ) : (
        <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '案件名',
    cell: (activity) =>
      activity.deals ? (
        <p className="c-heading--sm">{activity.deals.title}</p>
      ) : (
        <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '活動内容/次回予定',
    cell: (activity) => <div><p className='c-txt__sm'>{activity['activity-content'] ?? EMPTY_LABEL}</p>
    <p className='c-txt__sm'>{activity['activity-next'] ?? EMPTY_LABEL}</p></div>,
  },
];

export default function ActivitiesList({ activities }: Props) {
  return (
    <DataTable
      columns={columns}
      rows={activities}
      getKey={(activity) => activity.id}
      emptyMessage="該当する活動履歴がありません。"
    />
  );
}
