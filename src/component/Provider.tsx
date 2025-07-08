"use client";

import { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query-client";

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // サーバー: 常に新しいクエリクライアントを作成
    return makeQueryClient();
  } else {
    // ブラウザ: まだ持っていない場合は新しいクエリクライアントを作成
    // これは、Reactが初期レンダリング中にサスペンドした場合に
    // 新しいクライアントを再作成しないようにするために非常に重要です。
    // クエリクライアントの作成の下にサスペンス境界がある場合は、
    // これは必要ないかもしれません
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Provider(props: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {props.children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
