// db.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g. localhost\SQLEXPRESS
  database: process.env.DB_NAME, // Resumedb
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false, // for local dev with SQL Express
    trustServerCertificate: true, // allow self-signed certs
  },
};

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect()
  .then(() => console.log("✅ Connected to SQL Server Database"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

export { sql, pool, poolConnect };
