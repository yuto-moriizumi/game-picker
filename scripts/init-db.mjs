import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set");
}

const sql = neon(url);
const schemaPath = new URL("../db/schema.sql", import.meta.url);
const schema = await readFile(schemaPath, "utf8");

const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter((statement) => statement.length > 0);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} statement(s).`);
