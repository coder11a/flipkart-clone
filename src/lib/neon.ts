import { neon } from "@neondatabase/serverless";

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL is not set. Add it to your environment (e.g. .env.local).",
  );
}

export const sql = neon(connectionString);

export async function pingDatabase() {
  const [row] = await sql`select now()`;
  return row;
}
