import { getDatabase } from "../config/database.js";

export async function checkDatabase() {
  await getDatabase().command({ ping: 1 });
  return true;
}
