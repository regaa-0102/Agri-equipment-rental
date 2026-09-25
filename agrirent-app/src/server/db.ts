import mysql from "mysql2/promise";

let pool: mysql.Pool | undefined;

export function getDatabasePool() {
  if (!pool) {
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    if (!DB_HOST || !DB_USER || !DB_NAME) {
      throw new Error("MySQL is not configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME.");
    }

    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT ?? 3306),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      connectionLimit: 10,
      waitForConnections: true,
      decimalNumbers: true,
    });
  }

  return pool;
}