import SearchBox from './SearchBox';

type Props = {
  totalCount: number;
  placeholder?: string;
  /** 検索欄の隣に並べる追加フィルタ（担当者ラジオなど） */
  children?: React.ReactNode;
};

export default function ListToolbar({ totalCount, placeholder, children }: Props) {
  return (
    <div className="u-align wrap bottom between u-gap8 u-mb24">
      <div className="u-align wrap bottom u-gap8">
        <SearchBox placeholder={placeholder} />
        {children}
      </div>
      <p className="c-txt__sm">
        全 <strong className='c-heading--xl'>{totalCount.toLocaleString('ja-JP')}</strong> 件
      </p>
    </div>
  );
}
