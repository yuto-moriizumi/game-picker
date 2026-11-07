-- game-picker schema (Neon / PostgreSQL)

CREATE TABLE IF NOT EXISTS steam_games (
  app_id bigint PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS custom_games (
  custom_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text NOT NULL,
  players integer NOT NULL DEFAULT 0
);
