type Props = {
  message?: string;
};

export default function Empty({ message = '該当するデータがありません。' }: Props) {
  return (
    <div className="p-data__none">
      <p>{message}</p>
    </div>
  );
}
