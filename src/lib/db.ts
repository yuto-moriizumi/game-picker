import { neon, NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | undefined;

/**
 * Neon (Vercel Postgres) への接続を遅延初期化して返す。
 * ビルド時やテスト時に DATABASE_URL が無くても import 時点では失敗しない。
 */
export function getDb(): Sql {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    client = neon(url);
  }
  return client;
}
