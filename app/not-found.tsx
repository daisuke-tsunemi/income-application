"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import styles from "./layout.module.scss";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return (
    <>
      <Header title="404 Not Found" />
      <div style={{ textAlign: "center", padding: "240px 50px" }}>
        {/* Header 側が h1 のため h2 に下げる */}
        <h2>404 - ページが見つかりません</h2>
        <p>お探しのページは存在しません。</p>
        {query && <p className="c-txt__md ">検索クエリ: {query}</p>}
        <Link href='/'>トップへ戻る</Link>
      </div>
    </>
  );
}

// not-found.tsx には props が渡らない（error を受け取るのは error.tsx）。
// useSearchParams を使うため Suspense で囲む必要がある。
export default function NotFound() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
